import React, {useEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import * as THREE from 'three';
import type {Segment} from './cues';

// Pure scene builders below are copied verbatim from public/solar-scene.js
// (planets table, seeded RNG, canvas textures, orbit rings, star fields).
// Only the per-frame update() was rewritten: see applySolarFrame.

type PlanetSpec = {
  name: string;
  radius: number;
  distance: number;
  color: string;
  speed: number;
  tilt: number;
  moons?: number;
};

const planets: PlanetSpec[] = [
  {name: 'Mercury', radius: 0.28, distance: 3.0, color: '#9a8f84', speed: 4.1, tilt: 0.02},
  {name: 'Venus', radius: 0.42, distance: 4.2, color: '#d8a45f', speed: 3.1, tilt: 0.04},
  {name: 'Earth', radius: 0.46, distance: 5.6, color: '#2f84d6', speed: 2.5, tilt: 0.18, moons: 1},
  {name: 'Mars', radius: 0.34, distance: 7.0, color: '#c85b3a', speed: 2.0, tilt: 0.12},
  {name: 'Jupiter', radius: 0.9, distance: 9.3, color: '#d3a36d', speed: 1.35, tilt: 0.05, moons: 3},
  {name: 'Saturn', radius: 0.78, distance: 12.0, color: '#d9c082', speed: 1.05, tilt: 0.2, moons: 2},
  {name: 'Uranus', radius: 0.6, distance: 14.5, color: '#84d6df', speed: 0.78, tilt: 0.15},
  {name: 'Neptune', radius: 0.58, distance: 16.6, color: '#426ce4', speed: 0.62, tilt: 0.12},
];

function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Seeded 2D value noise, tileable horizontally so the texture wraps
 * around the sphere without a seam. */
function makeNoise(seed: number, period: number): (x: number, y: number) => number {
  const random = createRandom(seed);
  const size = 256;
  const table = Array.from({length: size * size}, () => random());
  const at = (ix: number, iy: number) => table[(((iy % size) + size) % size) * size + (((ix % period) + period) % period)];
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = fade(x - ix);
    const fy = fade(y - iy);
    const a = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * fx;
    const b = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * fx;
    return a + (b - a) * fy;
  };
}

/** Fractal noise in [0, 1]; u, v are texture coords in [0, 1). */
function makeFbm(seed: number, baseFreq: number, octaves = 5): (u: number, v: number) => number {
  const layers = Array.from({length: octaves}, (_, o) => ({
    noise: makeNoise(seed + o * 7919, baseFreq * 2 ** o),
    freq: baseFreq * 2 ** o,
    amp: 0.5 ** o,
  }));
  const norm = layers.reduce((sum, l) => sum + l.amp, 0);
  return (u, v) => layers.reduce((sum, l) => sum + l.noise(u * l.freq, v * l.freq * 0.5) * l.amp, 0) / norm;
}

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, b: RGB, t: number): RGB => {
  const c = Math.min(1, Math.max(0, t));
  return [a[0] + (b[0] - a[0]) * c, a[1] + (b[1] - a[1]) * c, a[2] + (b[2] - a[2]) * c];
};
/** Piecewise-linear colour ramp over [0, 1]. */
const ramp = (stops: [number, string][]) => {
  const parsed = stops.map(([t, c]) => [t, hex(c)] as const);
  return (t: number): RGB => {
    for (let i = 1; i < parsed.length; i++) {
      if (t <= parsed[i][0]) {
        const [t0, c0] = parsed[i - 1];
        const [t1, c1] = parsed[i];
        return mix(c0, c1, (t - t0) / (t1 - t0));
      }
    }
    return parsed[parsed.length - 1][1];
  };
};

type Painter = (u: number, v: number) => RGB;

/** Per-planet surface painters: rocky worlds get mottled terrain, Earth gets
 * oceans, continents, ice caps and clouds, gas and ice giants get bands. */
function makePainter(name: string, seed: number): Painter {
  const terrain = makeFbm(seed, 6);
  const detail = makeFbm(seed + 101, 24, 3);
  const warp = makeFbm(seed + 202, 3, 3);
  switch (name) {
    case 'Mercury': {
      const color = ramp([[0, '#5e5852'], [0.45, '#8f877d'], [0.7, '#b3aa9e'], [1, '#d4ccc0']]);
      return (u, v) => color(terrain(u, v) * 0.7 + detail(u, v) * 0.3);
    }
    case 'Venus': {
      const color = ramp([[0, '#b9864a'], [0.5, '#e0b878'], [1, '#f6e2b4']]);
      return (u, v) => color(terrain(u + warp(u, v) * 0.35, v) * 0.85 + Math.sin(v * Math.PI * 5 + warp(u, v) * 6) * 0.08 + 0.05);
    }
    case 'Earth': {
      const clouds = makeFbm(seed + 303, 8, 5);
      return (u, v) => {
        const lat = Math.abs(v - 0.5) * 2;
        const h = terrain(u, v) + (detail(u, v) - 0.5) * 0.15;
        let c: RGB = h < 0.53 ? mix(hex('#0b2c66'), hex('#1f6fb8'), (h - 0.3) / 0.23) : mix(hex('#3f8a3a'), hex('#a08a55'), (h - 0.53) / 0.2);
        if (lat > 0.82 || (lat > 0.7 && h > 0.5)) c = hex('#eef4fa');
        const cl = Math.max(0, clouds(u, v) - 0.55) * 2.6;
        return mix(c, [255, 255, 255], cl);
      };
    }
    case 'Mars': {
      const color = ramp([[0, '#5a2414'], [0.4, '#9a4325'], [0.65, '#c8693d'], [1, '#e2a070']]);
      return (u, v) => {
        const lat = Math.abs(v - 0.5) * 2;
        const c = color(terrain(u, v) * 0.75 + detail(u, v) * 0.25);
        return lat > 0.9 ? mix(c, hex('#f2ece4'), (lat - 0.9) * 10) : c;
      };
    }
    case 'Jupiter': {
      const color = ramp([[0, '#8a5a3a'], [0.3, '#c99a6a'], [0.55, '#efdcbc'], [0.75, '#b9773f'], [1, '#f3e6cf']]);
      return (u, v) => {
        const band = 0.5 + 0.5 * Math.sin(v * Math.PI * 14 + warp(u, v) * 2.2);
        let c = color(band * 0.8 + terrain(u, v) * 0.2);
        // Great Red Spot
        const du = (u - 0.3) / 0.07;
        const dv = (v - 0.64) / 0.04;
        const d = du * du + dv * dv;
        if (d < 1) c = mix(c, hex('#b8462c'), (1 - d) * 1.4);
        return c;
      };
    }
    case 'Saturn': {
      const color = ramp([[0, '#b99a5e'], [0.5, '#e4cf96'], [1, '#f5e8c4']]);
      return (u, v) => color(0.5 + 0.35 * Math.sin(v * Math.PI * 11 + warp(u, v) * 1.2) + (terrain(u, v) - 0.5) * 0.12);
    }
    case 'Uranus': {
      const color = ramp([[0, '#79c4cf'], [1, '#bdeef0']]);
      return (u, v) => color(0.55 + 0.12 * Math.sin(v * Math.PI * 6) + (terrain(u, v) - 0.5) * 0.2);
    }
    default: {
      // Neptune
      const color = ramp([[0, '#1d3c9e'], [0.6, '#3d6ee0'], [1, '#8fb4f5']]);
      return (u, v) => {
        let c = color(0.5 + 0.18 * Math.sin(v * Math.PI * 8 + warp(u, v) * 3) + (terrain(u, v) - 0.5) * 0.4);
        const du = (u - 0.6) / 0.06;
        const dv = (v - 0.62) / 0.035;
        const d = du * du + dv * dv;
        if (d < 1) c = mix(c, hex('#11205a'), 1 - d);
        return c;
      };
    }
  }
}

function makePlanetTexture(name: string, seed: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context is unavailable');
  }
  const paint = makePainter(name, seed);
  const img = ctx.createImageData(512, 256);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x++) {
      const [r, g, b] = paint(x / 512, y / 256);
      const i = (y * 512 + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeStarTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context is unavailable');
  }
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(190,220,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function makeGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context is unavailable');
  }
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(0.38, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createOrbitRing(radius: number): THREE.LineLoop<THREE.BufferGeometry, THREE.LineBasicMaterial> {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
  const pts = curve.getPoints(192).map((p) => new THREE.Vector3(p.x, 0, p.y));
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({color: '#6e7ea0', transparent: true, opacity: 0.25});
  return new THREE.LineLoop(geo, mat);
}

function createStarField(count: number, size: number, opacity: number, seed: number): THREE.Points {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const random = createRandom(seed);
  for (let i = 0; i < count; i++) {
    const r = 38 + random() * 80;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    map: makeStarTexture(),
    color: '#dce8ff',
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

function smoothstep(v: number): number {
  const c = Math.min(1, Math.max(0, v));
  return c * c * (3 - 2 * c);
}

type PlanetRuntime = {
  group: THREE.Group;
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  halo: THREE.Sprite;
  orbit: THREE.LineLoop<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  spec: PlanetSpec;
  moons: THREE.Mesh[];
};

type SolarWorld = {
  root: THREE.Group;
  sun: THREE.Mesh;
  planetRuntimes: PlanetRuntime[];
};

/** Build every scene object once. Deterministic: all randomness comes from
 * seeded createRandom, all layout from the planets table. */
function buildSolarWorld(): SolarWorld {
  const root = new THREE.Group();

  root.add(new THREE.AmbientLight('#4a6fa5', 0.6));
  const sunLight = new THREE.PointLight('#fff8e7', 16, 80, 1.5);
  sunLight.position.set(0, 0, 0);
  root.add(sunLight);
  const rimLight = new THREE.DirectionalLight('#7eb6ff', 1.8);
  rimLight.position.set(-15, 12, 20);
  root.add(rimLight);
  const fillLight = new THREE.DirectionalLight('#ff9b6b', 0.4);
  fillLight.position.set(10, -5, -15);
  root.add(fillLight);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 96, 96),
    new THREE.MeshBasicMaterial({color: '#ffe36d'}),
  );
  root.add(sun);

  const sunGlowTex = makeGlowTexture('rgba(255,240,180,0.9)', 'rgba(255,160,50,0)');
  const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: sunGlowTex,
      color: '#ffcc66',
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  sunGlow.scale.setScalar(6.2);
  root.add(sunGlow);
  const outerGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: sunGlowTex,
      color: '#ff8844',
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  outerGlow.scale.setScalar(10.5);
  root.add(outerGlow);
  const coronaGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: sunGlowTex,
      color: '#ff6622',
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  coronaGlow.scale.setScalar(14);
  root.add(coronaGlow);

  root.add(createStarField(1700, 0.105, 0.62, 112358));
  root.add(createStarField(420, 0.22, 0.48, 112399));

  const planetRuntimes = planets.map((spec, idx) => {
    const group = new THREE.Group();
    group.rotation.z = spec.tilt;
    root.add(group);
    const orbit = createOrbitRing(spec.distance);
    group.add(orbit);
    const tex = makePlanetTexture(spec.name, 112358 + idx * 97);
    const mat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: tex,
      roughness: 0.55,
      metalness: spec.name === 'Mercury' ? 0.15 : 0.06,
      envMapIntensity: 0.8,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(spec.radius, 64, 64), mat);
    group.add(mesh);

    const r = parseInt(spec.color.slice(1, 3), 16);
    const g = parseInt(spec.color.slice(3, 5), 16);
    const b = parseInt(spec.color.slice(5, 7), 16);
    const haloTex = makeGlowTexture(`rgba(${r},${g},${b},0.6)`, 'rgba(255,255,255,0)');
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: haloTex,
        color: spec.color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    group.add(halo);

    if (spec.name === 'Saturn') {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(spec.radius * 1.35, spec.radius * 2.1, 96),
        new THREE.MeshStandardMaterial({
          color: '#e5d49b',
          emissive: '#8a7448',
          emissiveIntensity: 0.6,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        }),
      );
      ring.rotation.x = Math.PI / 2.4;
      mesh.add(ring);
    }

    const moons = Array.from({length: spec.moons ?? 0}, (_, i) => {
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(spec.radius * 0.16, 24, 24),
        new THREE.MeshStandardMaterial({color: '#d8dde8', roughness: 0.85}),
      );
      moon.userData.moonOffset = i * 2.1;
      group.add(moon);
      return moon;
    });

    return {group, mesh, halo, orbit, spec, moons};
  });

  return {root, sun, planetRuntimes};
}

/** Frame-pure port of SolarScene.update(frame, totalFrames, segments).
 * Every value assigned here is a closed-form f(frame): sun breathing,
 * orbit angles, rotations, camera path, and the cue transition blend are
 * unchanged pure functions of frame. The original smoothed planet scale,
 * halo size/opacity, and emissive intensity with per-frame lerp toward a
 * target (e.g. `current + (target - current) * 0.08`), which depends on
 * render history and breaks determinism under concurrent rendering. Those
 * now assign the lerp's fixed point (the target) directly, keeping the
 * sinusoidal modulation that made them feel alive. */
function applySolarFrame(
  world: SolarWorld,
  camera: THREE.PerspectiveCamera,
  frame: number,
  totalFrames: number,
  segments: Segment[],
): void {
  const {sun, planetRuntimes} = world;

  sun.rotation.y = frame * 0.015;
  const active = segments.find((s) => frame >= s.start && frame < s.end) ?? segments[segments.length - 1];
  const activeIdx = segments.indexOf(active);
  const sunIsActive = active.name === 'Sun' || active.name === 'Finale';
  const breathe = Math.sin(frame * 0.06) * 0.04 + Math.sin(frame * 0.12) * 0.02;
  sun.scale.setScalar((sunIsActive ? 1.2 : 1) + breathe);

  const planetPositions = new Map<string, THREE.Vector3>();
  const target = new THREE.Vector3();
  let activeRadius = 1.45;

  planetRuntimes.forEach(({group, mesh, halo, moons, orbit, spec}, idx) => {
    const planetIsActive = spec.name === active.name || active.name === 'Finale';
    const angle = frame * 0.008 * spec.speed + idx * 0.52;
    mesh.position.set(Math.cos(angle) * spec.distance, 0, Math.sin(angle) * spec.distance);
    mesh.rotation.y = frame * 0.04 * (1.2 + idx * 0.08);
    // Orbits are tilted, so the camera must aim at the world position,
    // not the position inside the tilted group.
    group.rotation.y = Math.sin(frame * 0.003 + idx) * 0.04;
    group.updateMatrixWorld(true);
    const worldPos = mesh.getWorldPosition(new THREE.Vector3());
    planetPositions.set(spec.name, worldPos);

    const b = 1 + Math.sin(frame * 0.06) * 0.04 + Math.sin(frame * 0.15) * 0.015;
    mesh.scale.setScalar(planetIsActive ? 1.4 * b : 1);

    halo.position.copy(mesh.position);
    halo.scale.setScalar(spec.radius * (planetIsActive ? 6.5 + Math.sin(frame * 0.05) * 0.4 : 3.5));
    halo.material.opacity = planetIsActive ? 0.55 : 0.06;

    orbit.material.color.set(planetIsActive ? spec.color : '#6e7ea0');
    orbit.material.opacity = planetIsActive ? 0.85 : 0.2;
    mesh.material.emissive.set(planetIsActive ? spec.color : '#000000');
    mesh.material.emissiveIntensity = planetIsActive ? 0.12 : 0;

    if (spec.name === active.name) {
      target.copy(worldPos);
      activeRadius = spec.radius;
    }

    moons.forEach((moon, mi) => {
      const ma = frame * 0.055 * (1 + mi * 0.3) + (moon.userData.moonOffset as number);
      const md = spec.radius * (2.4 + mi * 0.6);
      moon.position.set(
        mesh.position.x + Math.cos(ma) * md,
        Math.sin(ma * 0.8) * spec.radius * 0.45,
        mesh.position.z + Math.sin(ma) * md,
      );
    });
  });

  const prevSeg = activeIdx > 0 ? segments[activeIdx - 1] : active;
  const prevPos = planetPositions.get(prevSeg.name);
  const transitionFrames = 45;
  const tProg = smoothstep((frame - active.start) / transitionFrames);
  if (prevPos && activeIdx > 0 && active.name !== 'Sun') {
    target.lerpVectors(prevPos, target, tProg);
    const prevR = planets.find((p) => p.name === prevSeg.name)?.radius ?? 1.45;
    activeRadius = prevR + (activeRadius - prevR) * tProg;
  }

  const activeIsPlanet = active.name !== 'Sun' && active.name !== 'Finale';
  const camRadius = activeIsPlanet
    ? Math.max(7.5, activeRadius * 8.5)
    : 26 + (frame / totalFrames) * 2 - Math.sin((frame / totalFrames) * Math.PI) * 6;
  const wideOffset = active.name === 'Finale' ? 16 : 0;
  const progress = frame / totalFrames;
  const camSweep = progress * Math.PI * 2;
  const orbitAngle = camSweep * (activeIsPlanet ? 1.8 : 0.6) + Math.sin(frame * 0.005) * 0.15;
  const tY = activeIsPlanet ? 2.5 + activeRadius * 3.0 : 9.0 + Math.sin(camSweep * 1.1) * 2.5;
  const tZ = target.z + Math.cos(orbitAngle) * camRadius + (active.name === 'Finale' ? 20 : 0);

  camera.position.set(target.x + Math.sin(orbitAngle) * camRadius + wideOffset, tY, tZ);
  camera.lookAt(target);
  camera.fov = activeIsPlanet ? 42 : 52;
  camera.updateProjectionMatrix();
}

type GLState = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  world: SolarWorld;
};

const WIDTH = 1080;
const HEIGHT = 1920;

function disposeWorld(world: SolarWorld): void {
  world.root.traverse((obj) => {
    // Sprite.geometry is a module-level shared quad in three.js;
    // disposing it would break sprites created by later mounts.
    if (!(obj instanceof THREE.Sprite)) {
      const node = obj as unknown as {geometry?: THREE.BufferGeometry};
      node.geometry?.dispose();
    }
    const node = obj as unknown as {material?: THREE.Material | THREE.Material[]};
    const materials = node.material === undefined ? [] : Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      const withMap = material as THREE.Material & {map?: THREE.Texture | null};
      withMap.map?.dispose();
      material.dispose();
    }
  });
}

export const SolarScene: React.FC<{frame: number; totalFrames: number; segments: Segment[]}> = ({
  frame,
  totalFrames,
  segments,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GLState | null>(null);
  const presentedRef = useRef(false);
  const [handle] = useState(() => delayRender('Creating WebGL solar scene'));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: false, preserveDrawingBuffer: true});
    renderer.setSize(WIDTH, HEIGHT, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#02040b');
    scene.fog = new THREE.FogExp2('#02040b', 0.012);
    const camera = new THREE.PerspectiveCamera(52, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(0, 12, 28);
    const world = buildSolarWorld();
    scene.add(world.root);
    stateRef.current = {renderer, scene, camera, world};
    return () => {
      scene.remove(world.root);
      disposeWorld(world);
      renderer.dispose();
      stateRef.current = null;
      presentedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) {
      return;
    }
    applySolarFrame(st.world, st.camera, frame, totalFrames, segments);
    st.renderer.render(st.scene, st.camera);
    if (!presentedRef.current) {
      presentedRef.current = true;
      continueRender(handle);
    }
  });

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      style={{position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT}}
    />
  );
};
