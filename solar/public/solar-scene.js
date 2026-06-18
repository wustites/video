// Solar system Canvas 2D scene for HyperFrames
// No Three.js dependency - pure Canvas 2D

window.SolarScene = (function() {
  const planets = [
    {name:'Mercury',radius:8,distance:80,color:'#9a8f84',speed:4.1,tilt:0.02},
    {name:'Venus',radius:12,distance:110,color:'#d8a45f',speed:3.1,tilt:0.04},
    {name:'Earth',radius:13,distance:150,color:'#2f84d6',speed:2.5,tilt:0.18,moons:1},
    {name:'Mars',radius:10,distance:190,color:'#c85b3a',speed:2.0,tilt:0.12},
    {name:'Jupiter',radius:25,distance:250,color:'#d3a36d',speed:1.35,tilt:0.05,moons:3},
    {name:'Saturn',radius:22,distance:320,color:'#d9c082',speed:1.05,tilt:0.2,moons:2,rings:true},
    {name:'Uranus',radius:17,distance:390,color:'#84d6df',speed:0.78,tilt:0.15},
    {name:'Neptune',radius:16,distance:450,color:'#426ce4',speed:0.62,tilt:0.12}
  ];

  function createRandom(seed) {
    let state = seed;
    return () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; };
  }

  function createStarField(count, seed) {
    const random = createRandom(seed);
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: random() * 1080,
        y: random() * 1920,
        size: 0.5 + random() * 2,
        opacity: 0.3 + random() * 0.7
      });
    }
    return stars;
  }

  function smoothstep(v) { const c = Math.min(1,Math.max(0,v)); return c*c*(3-2*c); }

  function init(canvas, width, height) {
    const ctx = canvas.getContext('2d');
    const stars = createStarField(800, 112358);
    const centerX = width / 2;
    const centerY = height / 2 - 100;

    function drawStars() {
      stars.forEach(star => {
        ctx.fillStyle = `rgba(220,232,255,${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawSun(frame, active) {
      const breathe = Math.sin(frame * 0.06) * 2 + Math.sin(frame * 0.12) * 1;
      const scale = (active ? 1.2 : 1) + breathe / 40;
      const r = 40 * scale;

      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r * 3);
      glow.addColorStop(0, 'rgba(255,240,180,0.9)');
      glow.addColorStop(0.4, 'rgba(255,200,100,0.4)');
      glow.addColorStop(1, 'rgba(255,160,50,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffe36d';
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawOrbit(distance) {
      ctx.strokeStyle = 'rgba(110,126,160,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, distance, 0, Math.PI * 2);
      ctx.stroke();
    }

    function drawPlanet(spec, frame, idx, active) {
      const angle = frame * 0.008 * spec.speed + idx * 0.52;
      const x = centerX + Math.cos(angle) * spec.distance;
      const y = centerY + Math.sin(angle) * spec.distance * 0.4;
      const breathe = 1 + Math.sin(frame * 0.06) * 0.04 + Math.sin(frame * 0.15) * 0.015;
      const scale = active ? 1.4 * breathe : 1;
      const r = spec.radius * scale;

      if (active) {
        ctx.strokeStyle = spec.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(centerX, centerY, spec.distance, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (spec.rings) {
        ctx.strokeStyle = '#e5d49b';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.62;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 2.1, r * 0.6, 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (active) {
        const halo = ctx.createRadialGradient(x, y, r, x, y, r * 6.5);
        const c = spec.color;
        halo.addColorStop(0, c + '88');
        halo.addColorStop(1, c + '00');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, r * 6.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = spec.color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      if (active) {
        ctx.fillStyle = spec.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      const moonCount = spec.moons || 0;
      for (let m = 0; m < moonCount; m++) {
        const moonAngle = frame * 0.055 * (1 + m * 0.3) + m * 2.1;
        const moonDist = r * (2.4 + m * 0.6);
        const mx = x + Math.cos(moonAngle) * moonDist;
        const my = y + Math.sin(moonAngle * 0.8) * r * 0.45;
        ctx.fillStyle = '#d8dde8';
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      return {x, y};
    }

    return {
      ctx, width, height,
      update(frame, totalFrames, segments) {
        ctx.fillStyle = '#02040b';
        ctx.fillRect(0, 0, width, height);

        drawStars();

        const active = segments.find(s => frame >= s.start && frame < s.end) || segments[segments.length - 1];
        const sunIsActive = active.name === 'Sun' || active.name === 'Finale';

        drawSun(frame, sunIsActive);

        planets.forEach((spec, idx) => {
          drawOrbit(spec.distance);
        });

        const positions = new Map();
        planets.forEach((spec, idx) => {
          const planetIsActive = spec.name === active.name || active.name === 'Finale';
          const pos = drawPlanet(spec, frame, idx, planetIsActive);
          positions.set(spec.name, pos);
        });

        return { active, positions };
      }
    };
  }

  return { init, planets };
})();
