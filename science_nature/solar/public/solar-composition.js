// Shared cue-driven Solar composition runtime.
window.SolarComposition = (function () {
  const FPS = 30;

  function init(options) {
    const data = window.SOLAR_VOICEOVER;
    if (!data || !Array.isArray(data.cues) || data.cues.length === 0) {
      throw new Error("Generated SOLAR_VOICEOVER cues are required");
    }

    const root = document.getElementById("root");
    const overlayRoot = document.getElementById("cueOverlays");
    const canvas = document.getElementById("solar-canvas");
    const scene = SolarScene.init(canvas, 1080, 1920);
    const totalFrames = Math.ceil(data.compositionDuration * FPS);
    const segments = data.cues.map((cue) => ({
      name: cue.scene,
      start: Math.round(cue.start * FPS),
      end: Math.round(cue.end * FPS),
    }));

    root.dataset.duration = String(data.compositionDuration);

    data.cues.forEach((cue, index) => {
      const group = document.createElement("div");
      group.className = "cue-group";
      group.id = `cue-${index}`;
      group.innerHTML = `<div class="planet-name">${cue.name}</div><div class="text-overlay">${cue.text}</div>`;
      overlayRoot.appendChild(group);
    });

    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({
      paused: true,
      onUpdate: function () {
        scene.update(Math.floor(this.time() * FPS), totalFrames, segments);
      },
    });

    data.cues.forEach((cue, index) => {
      const selector = `#cue-${index}`;
      const visibleDuration = Math.max(0.12, cue.end - cue.start);
      const enterDuration = Math.min(0.35, visibleDuration / 3);
      const exitDuration = Math.min(0.16, visibleDuration / 4);
      tl.set(selector, { visibility: "visible", opacity: 0 }, cue.start);
      tl.fromTo(
        selector,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: enterDuration, ease: "power3.out" },
        cue.start,
      );
      tl.to(selector, { opacity: 0, y: -12, duration: exitDuration, ease: "power2.in" }, cue.end - exitDuration);
      tl.set(selector, { opacity: 0, visibility: "hidden" }, cue.end);
    });

    window.__timelines[options.compositionId] = tl;
  }

  return { init };
})();
