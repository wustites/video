// Solar system Three.js scene for HyperFrames
// Driven by GSAP timeline proxy

window.SolarScene = (function() {
  const planets = [
    {name:'Mercury',radius:0.28,distance:3.0,color:'#9a8f84',speed:4.1,tilt:0.02},
    {name:'Venus',radius:0.42,distance:4.2,color:'#d8a45f',speed:3.1,tilt:0.04},
    {name:'Earth',radius:0.46,distance:5.6,color:'#2f84d6',speed:2.5,tilt:0.18,moons:1},
    {name:'Mars',radius:0.34,distance:7.0,color:'#c85b3a',speed:2.0,tilt:0.12},
    {name:'Jupiter',radius:0.9,distance:9.3,color:'#d3a36d',speed:1.35,tilt:0.05,moons:3},
    {name:'Saturn',radius:0.78,distance:12.0,color:'#d9c082',speed:1.05,tilt:0.2,moons:2},
    {name:'Uranus',radius:0.6,distance:14.5,color:'#84d6df',speed:0.78,tilt:0.15},
    {name:'Neptune',radius:0.58,distance:16.6,color:'#426ce4',speed:0.62,tilt:0.12}
  ];

  function createRandom(seed) {
    let state = seed;
    return () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; };
  }

  function makePlanetTexture(base, accent, seed) {
    const random = createRandom(seed);
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 36; i++) {
      const y = random() * 256, h = 3 + random() * 16;
      ctx.globalAlpha = 0.18 + random() * 0.25;
      ctx.fillStyle = i % 2 === 0 ? accent : '#ffffff';
      ctx.fillRect(0, y, 512, h);
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makeStarTexture() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(0.4,'rgba(190,220,255,0.45)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,64,64);
    return new THREE.CanvasTexture(c);
  }

  function makeGlowTexture(inner, outer) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128,128,0,128,128,128);
    g.addColorStop(0,inner); g.addColorStop(0.38,inner); g.addColorStop(1,outer);
    ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createOrbitRing(radius) {
    const curve = new THREE.EllipseCurve(0,0,radius,radius,0,Math.PI*2,false,0);
    const pts = curve.getPoints(192).map(p => new THREE.Vector3(p.x,0,p.y));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({color:'#6e7ea0',transparent:true,opacity:0.25});
    return new THREE.LineLoop(geo, mat);
  }

  function createStarField(count, size, opacity, seed) {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const random = createRandom(seed);
    for (let i = 0; i < count; i++) {
      const r = 38 + random()*80, theta = random()*Math.PI*2, phi = Math.acos(2*random()-1);
      positions.push(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      map: makeStarTexture(), color:'#dce8ff', size, transparent:true, opacity,
      depthWrite:false, blending:THREE.AdditiveBlending
    });
    return new THREE.Points(geo, mat);
  }

  function smoothstep(v) { const c = Math.min(1,Math.max(0,v)); return c*c*(3-2*c); }

  function init(canvas, width, height) {
    const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, preserveDrawingBuffer:true});
    renderer.setPixelRatio(1); renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#02040b');
    scene.fog = new THREE.FogExp2('#02040b', 0.012);

    const camera = new THREE.PerspectiveCamera(56, width/height, 0.1, 1000);
    camera.position.set(0,12,28); camera.lookAt(0,0,0);

    scene.add(new THREE.AmbientLight('#4a6fa5', 0.6));
    const sunLight = new THREE.PointLight('#fff8e7', 16, 80, 1.5);
    sunLight.position.set(0,0,0); scene.add(sunLight);
    const rimLight = new THREE.DirectionalLight('#7eb6ff', 1.8);
    rimLight.position.set(-15,12,20); scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight('#ff9b6b', 0.4);
    fillLight.position.set(10,-5,-15); scene.add(fillLight);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.45,96,96),
      new THREE.MeshBasicMaterial({color:'#ffe36d'})
    );
    scene.add(sun);

    const sunGlowTex = makeGlowTexture('rgba(255,240,180,0.9)','rgba(255,160,50,0)');
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map:sunGlowTex, color:'#ffcc66', transparent:true, opacity:0.8,
      depthWrite:false, blending:THREE.AdditiveBlending
    }));
    sunGlow.scale.setScalar(6.2); scene.add(sunGlow);
    const outerGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map:sunGlowTex, color:'#ff8844', transparent:true, opacity:0.3,
      depthWrite:false, blending:THREE.AdditiveBlending
    }));
    outerGlow.scale.setScalar(10.5); scene.add(outerGlow);
    const coronaGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map:sunGlowTex, color:'#ff6622', transparent:true, opacity:0.12,
      depthWrite:false, blending:THREE.AdditiveBlending
    }));
    coronaGlow.scale.setScalar(14); scene.add(coronaGlow);

    scene.add(createStarField(1700, 0.105, 0.62, 112358));
    scene.add(createStarField(420, 0.22, 0.48, 112399));

    const planetRuntimes = planets.map((spec, idx) => {
      const group = new THREE.Group(); group.rotation.z = spec.tilt; scene.add(group);
      const orbit = createOrbitRing(spec.distance); group.add(orbit);
      const tex = makePlanetTexture(spec.color, spec.name==='Earth'?'#70c779':'#3a3a4a', 112358+idx*97);
      const mat = new THREE.MeshStandardMaterial({
        color:spec.color, map:tex, roughness:0.55,
        metalness:spec.name==='Mercury'?0.15:0.06, envMapIntensity:0.8
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(spec.radius,64,64), mat);
      group.add(mesh);

      const r=parseInt(spec.color.slice(1,3),16), g=parseInt(spec.color.slice(3,5),16), b=parseInt(spec.color.slice(5,7),16);
      const haloTex = makeGlowTexture(`rgba(${r},${g},${b},0.6)`,'rgba(255,255,255,0)');
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map:haloTex, color:spec.color, transparent:true, opacity:0,
        depthWrite:false, blending:THREE.AdditiveBlending
      }));
      group.add(halo);

      if (spec.name === 'Saturn') {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(spec.radius*1.35, spec.radius*2.1, 96),
          new THREE.MeshStandardMaterial({color:'#e5d49b', side:THREE.DoubleSide, transparent:true, opacity:0.62})
        );
        ring.rotation.x = Math.PI/2.4; mesh.add(ring);
      }

      const moons = Array.from({length:spec.moons||0}, (_,i) => {
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(spec.radius*0.16,24,24),
          new THREE.MeshStandardMaterial({color:'#d8dde8', roughness:0.85})
        );
        moon.userData.moonOffset = i * 2.1; group.add(moon); return moon;
      });

      return {group, mesh, halo, orbit, spec, moons};
    });

    return {
      renderer, scene, camera, sun, planetRuntimes,
      update(frame, totalFrames, segments) {
        sun.rotation.y = frame * 0.015;
        const active = segments.find(s => frame >= s.start && frame < s.end) || segments[segments.length-1];
        const activeIdx = segments.indexOf(active);
        const sunIsActive = active.name === 'Sun' || active.name === 'Finale';
        const breathe = Math.sin(frame*0.06)*0.04 + Math.sin(frame*0.12)*0.02;
        sun.scale.setScalar((sunIsActive?1.2:1) + breathe);

        const planetPositions = new Map();
        let target = new THREE.Vector3(), activeRadius = 1.45;

        planetRuntimes.forEach(({group, mesh, halo, moons, orbit, spec}, idx) => {
          const planetIsActive = spec.name === active.name || active.name === 'Finale';
          const angle = frame*0.008*spec.speed + idx*0.52;
          mesh.position.set(Math.cos(angle)*spec.distance, 0, Math.sin(angle)*spec.distance);
          mesh.rotation.y = frame*0.04*(1.2+idx*0.08);
          planetPositions.set(spec.name, mesh.position.clone());

          const b = 1 + Math.sin(frame*0.06)*0.04 + Math.sin(frame*0.15)*0.015;
          const tScale = planetIsActive ? 1.4*b : 1;
          const cScale = mesh.scale.x;
          mesh.scale.setScalar(cScale + (tScale-cScale)*0.1);

          halo.position.copy(mesh.position);
          const tHalo = planetIsActive ? 6.5+Math.sin(frame*0.05)*0.4 : 3.5;
          const cHalo = halo.scale.x;
          halo.scale.setScalar(spec.radius*(cHalo+(tHalo-cHalo)*0.08));
          if (halo.material) halo.material.opacity += ((planetIsActive?0.55:0.06)-halo.material.opacity)*0.08;

          if (orbit.material) {
            orbit.material.color.set(planetIsActive?spec.color:'#6e7ea0');
            orbit.material.opacity = planetIsActive?0.85:0.2;
          }
          if (mesh.material) {
            mesh.material.emissive.set(planetIsActive?spec.color:'#000000');
            mesh.material.emissiveIntensity += ((planetIsActive?0.3:0)-mesh.material.emissiveIntensity)*0.08;
          }

          if (spec.name === active.name) { target.copy(mesh.position); activeRadius = spec.radius; }

          moons.forEach((moon, mi) => {
            const ma = frame*0.055*(1+mi*0.3)+moon.userData.moonOffset;
            const md = spec.radius*(2.4+mi*0.6);
            moon.position.set(mesh.position.x+Math.cos(ma)*md, Math.sin(ma*0.8)*spec.radius*0.45, mesh.position.z+Math.sin(ma)*md);
          });
          group.rotation.y = Math.sin(frame*0.003+idx)*0.04;
        });

        const prevSeg = activeIdx > 0 ? segments[activeIdx-1] : active;
        const prevPos = planetPositions.get(prevSeg.name);
        const transitionFrames = 45;
        const tProg = smoothstep((frame - active.start) / transitionFrames);
        if (prevPos && activeIdx > 0 && active.name !== 'Sun') {
          target.lerpVectors(prevPos, target, tProg);
          const prevR = planets.find(p=>p.name===prevSeg.name)?.radius||1.45;
          activeRadius = prevR + (activeRadius-prevR)*tProg;
        }

        const activeIsPlanet = active.name !== 'Sun' && active.name !== 'Finale';
        const camRadius = activeIsPlanet ? Math.max(7.5, activeRadius*8.5) :
          26 + (frame/totalFrames)*2 - Math.sin(frame/totalFrames*Math.PI)*6;
        const wideOffset = active.name==='Finale'?16:0;
        const progress = frame/totalFrames;
        const camSweep = progress*Math.PI*2;
        const orbitAngle = camSweep*(activeIsPlanet?1.8:0.6) + Math.sin(frame*0.005)*0.15;
        const tY = activeIsPlanet ? 2.5+activeRadius*3.0 : 9.0+Math.sin(camSweep*1.1)*2.5;
        const tZ = target.z + Math.cos(orbitAngle)*camRadius + (active.name==='Finale'?20:0);

        camera.position.set(target.x+Math.sin(orbitAngle)*camRadius+wideOffset, tY, tZ);
        camera.lookAt(target);
        camera.fov = activeIsPlanet ? 42 : 52;
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);
      }
    };
  }

  return {init, planets};
})();
