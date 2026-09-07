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

function makePlanetTexture(base: string, accent: string, seed: number): THREE.CanvasTexture {
  const random = createRandom(seed);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context is unavailable');
  }
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 36; i++) {
    const y = random() * 256;
    const h = 3 + random() * 16;
    ctx.globalAlpha = 0.18 + random() * 0.25;
    ctx.fillStyle = i % 2 === 0 ? accent : '#ffffff';
    ctx.fillRect(0, y, 512, h);
  }
  ctx.globalAlpha = 1;
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
    const tex = makePlanetTexture(spec.color, spec.name === 'Earth' ? '#70c779' : '#3a3a4a', 112358 + idx * 97);
    const mat = new THREE.MeshStandardMaterial({
      color: spec.color,
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
        new THREE.MeshStandardMaterial({color: '#e5d49b', side: THREE.DoubleSide, transparent: true, opacity: 0.62}),
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
    planetPositions.set(spec.name, mesh.position.clone());

    const b = 1 + Math.sin(frame * 0.06) * 0.04 + Math.sin(frame * 0.15) * 0.015;
    mesh.scale.setScalar(planetIsActive ? 1.4 * b : 1);

    halo.position.copy(mesh.position);
    halo.scale.setScalar(spec.radius * (planetIsActive ? 6.5 + Math.sin(frame * 0.05) * 0.4 : 3.5));
    halo.material.opacity = planetIsActive ? 0.55 : 0.06;

    orbit.material.color.set(planetIsActive ? spec.color : '#6e7ea0');
    orbit.material.opacity = planetIsActive ? 0.85 : 0.2;
    mesh.material.emissive.set(planetIsActive ? spec.color : '#000000');
    mesh.material.emissiveIntensity = planetIsActive ? 0.3 : 0;

    if (spec.name === active.name) {
      target.copy(mesh.position);
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
    group.rotation.y = Math.sin(frame * 0.003 + idx) * 0.04;
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
