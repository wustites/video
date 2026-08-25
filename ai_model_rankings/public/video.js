(function () {
  const root = document.getElementById("root");
  const localeKey = root.dataset.locale || document.documentElement.lang || "en";
  const config = window.AI_MODEL_RANKINGS_I18N;
  const locale = config.locales[localeKey] || config.locales.en;
  const data = window.AI_MODEL_RANKINGS_DATA || { models: [], scatterPoints: [], providerCounts: [], tierCounts: [0, 0, 0, 0], cards: [], metrics: {} };
  const providerName = (key, label) => (locale.providers && locale.providers[key]) || label || key;
  const models = data.models.map(item => ({ ...item, provider: providerName(item.providerKey, item.providerLabel) }));
  const scatterData = data.scatterPoints.map(item => ({ ...item, provider: providerName(item.providerKey, item.providerLabel) }));
  const providers = data.providerCounts.map(item => ({ ...item, name: providerName(item.providerKey, item.label) }));
  const providerMax = Math.max(...providers.map(item => item.count));
  const efficiencyCards = (locale.scenes.efficiency.cards || []).map((item, i) => {
    const card = (data.cards && data.cards[i]) || {};
    return { ...item, title: card.name || item.title, value: card.value || item.value, color: card.color || item.color };
  });
  const tiers = (locale.scenes.tiers.rows || []).map((item, i) => ({
    ...item, count: (data.tierCounts && data.tierCounts[i]) || 0
  }));
  const compositionId = root.dataset.compositionId;
  const DURATION = 1800;

  document.body.style.fontFamily = locale.fontFamily;
  root.innerHTML = buildMarkup(locale.scenes);
  injectStyles();
  applyDynamicValues();
  buildBars();
  buildScatter();
  buildEfficiency();
  buildTiers();
  buildProviders();
  registerTimeline();

  function kicker(text) {
    return `<div class="kicker"><span class="kicker-dot"></span>${text}</div>`;
  }

  function buildMarkup(scenes) {
    return `
      <div class="bg-grid"></div>

      <div id="scene-intro" class="scene scene-intro">
        <div class="scene-header">${kicker(scenes.intro.kicker)}</div>
        <div id="intro-title" class="intro-title">
          <div class="hero-title">${scenes.intro.title}</div>
          <div class="hero-subtitle">${scenes.intro.subtitle}</div>
        </div>
        <div id="intro-metrics" class="intro-metrics">
          ${scenes.intro.metrics.map((item, i) => `
            <div class="metric" style="--accent:${item.color}">
              <div class="metric-label">${item.label}</div>
              <div class="metric-value" id="metric-val-${i}">${item.value}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div id="scene-ranking" class="scene">
        ${kicker(scenes.ranking.kicker)}
        <div class="scene-title">${scenes.ranking.title}</div>
        <div class="scene-subtitle small">${scenes.ranking.subtitle}</div>
        <div id="bars-container" class="bars-container"></div>
      </div>

      <div id="scene-scatter" class="scene">
        ${kicker(scenes.scatter.kicker)}
        <div class="scene-title">${scenes.scatter.title}</div>
        <div class="scene-subtitle small">${scenes.scatter.subtitle}</div>
        <div id="scatter-container" class="scatter-container" data-x-axis="${scenes.scatter.xAxis}" data-y-axis="${scenes.scatter.yAxis}"></div>
        <div class="legend" id="scatter-legend"></div>
      </div>

      <div id="scene-efficiency" class="scene">
        ${kicker(scenes.efficiency.kicker)}
        <div class="scene-title wide">${scenes.efficiency.title}</div>
        <div class="scene-subtitle">${scenes.efficiency.subtitle}</div>
        <div class="insight-grid" id="efficiency-grid"></div>
      </div>

      <div id="scene-tiers" class="scene">
        ${kicker(scenes.tiers.kicker)}
        <div class="scene-title wide">${scenes.tiers.title}</div>
        <div class="scene-subtitle">${scenes.tiers.subtitle}</div>
        <div id="tier-list" class="tier-list"></div>
      </div>

      <div id="scene-providers" class="scene scene-providers">
        ${kicker(scenes.providers.kicker)}
        <div class="scene-title provider-title">${scenes.providers.title}</div>
        <div class="scene-subtitle">${scenes.providers.subtitle}</div>
        <div id="provider-list" class="provider-list"></div>
      </div>

      <div id="scene-outro" class="scene scene-outro">
        <div id="outro-content" class="outro-content">
          ${kicker(scenes.outro.kicker)}
          <div class="outro-title">${scenes.outro.title}</div>
          <div class="gradient-line" id="outro-line"></div>
          <div class="outro-bullets">
            ${scenes.outro.bullets.map(item => `<span>${item}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="timeline-bar"><div class="timeline-fill" id="timeline-fill"></div></div>`;
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; }
      body { background: #0F172A; color: #F8FAFC; }
      #root { width: 1080px; height: 1920px; position: relative; overflow: hidden; }
      .bg-grid {
        position: absolute; inset: 0; opacity: 0.15;
        background-image: linear-gradient(rgba(248,250,252,.06) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(248,250,252,.06) 1px, transparent 1px);
        background-size: 72px 72px;
        mask-image: linear-gradient(to bottom, transparent, black 10%, black 88%, transparent);
      }
      .scene {
        position: absolute; inset: 0; padding: 72px 64px 112px;
        display: flex; flex-direction: column; opacity: 0;
      }
      .scene-intro, .scene-outro { padding-top: 82px; }
      .scene-providers { padding-top: 58px; }
      .kicker {
        display: inline-flex; align-items: center; gap: 12px;
        padding: 12px 18px; border: 1px solid rgba(248,250,252,.15); border-radius: 8px;
        background: rgba(248,250,252,.08); color: #94A3B8; font-size: 28px; font-weight: 700;
      }
      .kicker-dot { width: 10px; height: 10px; border-radius: 20px; background: #10B981; }
      .intro-title { margin-top: 146px; }
      .hero-title { font-size: 108px; line-height: 1.02; font-weight: 900; }
      .hero-title span { color: #10B981; }
      .hero-subtitle { margin-top: 42px; width: 820px; font-size: 38px; line-height: 1.48; color: #94A3B8; font-weight: 600; }
      .intro-metrics { margin-top: auto; display: grid; gap: 24px; }
      .metric {
        border-top: 8px solid var(--accent); padding: 24px 28px;
        background: rgba(248,250,252,.06); box-shadow: 0 22px 70px rgba(0,0,0,.3);
      }
      .metric-label { font-size: 28px; color: #94A3B8; font-weight: 700; }
      .metric-value { font-size: 60px; font-weight: 900; margin-top: 8px; }
      .scene-title { font-size: 68px; line-height: 1.08; font-weight: 900; margin-top: 30px; }
      .scene-title.wide { font-size: 70px; }
      .provider-title { font-size: 72px; }
      .scene-subtitle { font-size: 28px; line-height: 1.42; color: #94A3B8; margin-top: 22px; font-weight: 650; }
      .scene-subtitle.small { font-size: 24px; font-weight: 700; margin-top: 18px; }
      .bars-container { margin-top: 42px; display: grid; gap: 16px; }
      .bar-row { display: grid; grid-template-columns: 62px 1fr 132px; gap: 18px; align-items: center; }
      .bar-rank {
        width: 54px; height: 54px; display: grid; place-items: center;
        color: white; font-size: 27px; font-weight: 900;
      }
      .bar-track { height: 35px; background: rgba(248,250,252,.08); margin-top: 9px; overflow: hidden; }
      .bar-fill { height: 100%; }
      .bar-name { font-size: 28px; font-weight: 800; }
      .bar-provider { font-size: 22px; color: #94A3B8; font-weight: 600; }
      .bar-score { font-size: 28px; font-weight: 800; text-align: right; }
      .scatter-container { position: relative; margin-top: 32px; flex: 1; }
      .scatter-dot { position: absolute; border-radius: 50%; transition: transform 0.2s; }
      .scatter-label { position: absolute; font-size: 18px; font-weight: 700; white-space: nowrap; pointer-events: none; }
      .legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 24px; }
      .legend-item { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; color: #94A3B8; }
      .legend-dot { width: 12px; height: 12px; border-radius: 50%; }
      .insight-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; margin-top: 58px; }
      .insight-card {
        min-height: 196px; padding: 24px;
        background: rgba(248,250,252,.07); border: 1px solid rgba(248,250,252,.12);
      }
      .insight-label { font-size: 22px; color: #94A3B8; font-weight: 700; }
      .insight-title { font-size: 34px; line-height: 1.1; font-weight: 900; margin-top: 18px; }
      .insight-value { font-size: 46px; font-weight: 900; margin-top: 22px; }
      .tier-list { display: grid; gap: 30px; margin-top: 64px; }
      .tier-row { display: grid; grid-template-columns: 138px 1fr 92px; gap: 18px; align-items: center; }
      .tier-label { font-size: 30px; font-weight: 900; }
      .tier-note { font-size: 21px; color: #94A3B8; font-weight: 650; margin-top: 6px; }
      .tier-track { height: 34px; background: rgba(248,250,252,.08); overflow: hidden; }
      .tier-fill { height: 100%; width: 0%; }
      .tier-count { font-size: 34px; font-weight: 900; text-align: right; }
      .provider-list { display: grid; gap: 22px; margin-top: 44px; }
      .provider-bar { height: 30px; background: rgba(248,250,252,.08); margin-top: 10px; }
      .provider-fill { height: 100%; }
      .provider-row-label { font-size: 32px; font-weight: 800; }
      .provider-row-value { font-size: 36px; font-weight: 800; }
      .outro-content { margin-top: 130px; }
      .outro-title { font-size: 86px; line-height: 1.1; font-weight: 900; margin-top: 58px; }
      .outro-bullets { margin-top: 58px; display: grid; gap: 20px; font-size: 36px; color: #94A3B8; font-weight: 700; }
      .gradient-line { height: 12px; margin-top: 58px; width: 0%; background: linear-gradient(90deg, #3B82F6, #10B981, #F59E0B); }
      .timeline-bar { position: absolute; left: 64px; right: 64px; bottom: 48px; height: 7px; background: rgba(248,250,252,.12); }
      .timeline-fill { height: 100%; background: #10B981; }
    `;
    document.head.appendChild(style);
  }

  function applyDynamicValues() {
    const m = data.metrics || {};
    const fill = (id, value) => {
      const el = document.getElementById(id);
      if (el && value) el.textContent = value;
    };
    fill("metric-val-0", m.totalModels);
    fill("metric-val-1", m.topModel);
    fill("metric-val-2", m.fastestModel);
    document.querySelectorAll("#outro-content .outro-bullets span").forEach(el => {
      el.textContent = el.textContent.replace("{{total}}", String(m.totalModels || "").replace("+", ""));
    });
  }

  function buildBars() {
    const container = document.getElementById("bars-container");
    models.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.id = "bar-" + i;
      row.innerHTML = `
        <div class="bar-rank" style="background:${item.color}">${item.rank}</div>
        <div>
          <div style="display:flex;justify-content:space-between;gap:20px">
            <div class="bar-name">${item.name}</div>
            <div class="bar-provider">${item.provider}</div>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:0%;background:linear-gradient(90deg,${item.color},${item.color}B8)"></div></div>
        </div>
        <div class="bar-score">${item.score}</div>`;
      container.appendChild(row);
    });
  }

  function buildScatter() {
    const container = document.getElementById("scatter-container");
    const width = 952;
    const height = 800;
    container.style.width = width + "px";
    container.style.height = height + "px";

    const axes = document.createElement("div");
    axes.style.cssText = "position:absolute;inset:0;";
    axes.innerHTML = `
      <div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(248,250,252,.2)"></div>
      <div style="position:absolute;top:0;bottom:0;left:0;width:2px;background:rgba(248,250,252,.2)"></div>
      <div style="position:absolute;bottom:-32px;left:50%;transform:translateX(-50%);font-size:20px;color:#94A3B8;font-weight:600">${container.dataset.xAxis}</div>
      <div style="position:absolute;left:-48px;top:50%;transform:rotate(-90deg) translateX(-50%);font-size:20px;color:#94A3B8;font-weight:600;white-space:nowrap">${container.dataset.yAxis}</div>
    `;
    container.appendChild(axes);

    scatterData.forEach((item, i) => {
      const x = (item.speed / 800) * (width - 120) + 60;
      const y = height - ((item.score - 20) / 40) * (height - 120) - 60;
      const dot = document.createElement("div");
      dot.id = "scatter-" + i;
      dot.className = "scatter-dot";
      dot.style.cssText = `left:${x}px;top:${y}px;width:24px;height:24px;background:${item.color};opacity:0;transform:translate(-50%,-50%) scale(0);`;
      container.appendChild(dot);

      const label = document.createElement("div");
      label.id = "slabel-" + i;
      label.className = "scatter-label";
      label.style.cssText = `left:${x + 16}px;top:${y - 8}px;color:${item.color};opacity:0;`;
      label.textContent = item.name;
      container.appendChild(label);
    });

    const legend = document.getElementById("scatter-legend");
    [...new Set(scatterData.map(item => item.provider))].forEach(name => {
      const item = scatterData.find(candidate => candidate.provider === name);
      const el = document.createElement("div");
      el.className = "legend-item";
      el.innerHTML = `<div class="legend-dot" style="background:${item.color}"></div>${name}`;
      legend.appendChild(el);
    });
  }

  function buildEfficiency() {
    const container = document.getElementById("efficiency-grid");
    efficiencyCards.forEach((item, i) => {
      const card = document.createElement("div");
      card.id = "ecard-" + i;
      card.className = "insight-card";
      card.style.borderTop = `8px solid ${item.color}`;
      card.innerHTML = `
        <div class="insight-label">${item.label}</div>
        <div class="insight-title">${item.title}</div>
        <div class="insight-value" style="color:${item.color}">${item.value}</div>`;
      container.appendChild(card);
    });
  }

  function buildTiers() {
    const container = document.getElementById("tier-list");
    const max = Math.max(...tiers.map(item => item.count));
    tiers.forEach((item, i) => {
      const row = document.createElement("div");
      row.id = "tier-" + i;
      row.className = "tier-row";
      row.innerHTML = `
        <div>
          <div class="tier-label">${item.label}</div>
          <div class="tier-note">${item.note}</div>
        </div>
        <div class="tier-track"><div class="tier-fill" style="background:${item.color}" data-target="${item.count / max * 100}"></div></div>
        <div class="tier-count" id="tval-${i}">0</div>`;
      container.appendChild(row);
    });
  }

  function buildProviders() {
    const container = document.getElementById("provider-list");
    providers.forEach((item, i) => {
      const row = document.createElement("div");
      row.id = "prow-" + i;
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between">
          <div class="provider-row-label">${item.name}</div>
          <div class="provider-row-value" id="pval-${i}">0</div>
        </div>
        <div class="provider-bar"><div class="provider-fill" style="width:0%;background:${item.color}"></div></div>`;
      container.appendChild(row);
    });
  }

  function sceneOpacity(frame, start, end) {
    const fadeIn = gsap.utils.clamp(0, 1, (frame - start) / 18);
    const fadeOut = gsap.utils.clamp(0, 1, (end - frame) / 18);
    return Math.min(fadeIn, fadeOut);
  }

  function registerTimeline() {
    const scenes = [
      { id: "scene-intro", start: 0, end: 240 },
      { id: "scene-ranking", start: 210, end: 510 },
      { id: "scene-scatter", start: 480, end: 780 },
      { id: "scene-efficiency", start: 750, end: 1050 },
      { id: "scene-tiers", start: 1020, end: 1320 },
      { id: "scene-providers", start: 1290, end: 1560 },
      { id: "scene-outro", start: 1530, end: DURATION }
    ];
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });

    tl.to({ frame: 0 }, {
      frame: DURATION,
      duration: DURATION / 30,
      ease: "none",
      onUpdate: function () {
        const frame = this.targets()[0].frame;
        const progress = frame / DURATION;

        scenes.forEach(scene => {
          const el = document.getElementById(scene.id);
          el.style.opacity = sceneOpacity(frame, scene.start, scene.end);
        });

        const titleEnter = gsap.utils.clamp(0, 1, frame / 36);
        const introTitle = document.getElementById("intro-title");
        introTitle.style.opacity = titleEnter;
        introTitle.style.transform = `translateY(${(1 - titleEnter) * 76}px)`;
        document.getElementById("intro-metrics").style.opacity = gsap.utils.clamp(0, 1, (frame - 24) / 24);

        const local = frame - 220;
        models.forEach((item, i) => {
          const enter = gsap.utils.clamp(0, 1, (local - i * 5) / 30);
          const row = document.getElementById("bar-" + i);
          row.style.opacity = enter;
          row.style.transform = `translateX(${(1 - enter) * -60}px)`;
          row.querySelector(".bar-fill").style.width = (enter * (item.score / models[0].score) * 100) + "%";
        });

        const slocal = frame - 520;
        scatterData.forEach((item, i) => {
          const enter = gsap.utils.clamp(0, 1, (slocal - i * 6) / 30);
          const dot = document.getElementById("scatter-" + i);
          const label = document.getElementById("slabel-" + i);
          dot.style.opacity = enter * 0.85;
          dot.style.transform = `translate(-50%,-50%) scale(${enter})`;
          label.style.opacity = enter;
        });

        const elocal = frame - 770;
        efficiencyCards.forEach((item, i) => {
          const enter = gsap.utils.clamp(0, 1, (elocal - i * 12) / 32);
          const card = document.getElementById("ecard-" + i);
          card.style.opacity = enter;
          card.style.transform = `translateY(${(1 - enter) * 42}px)`;
        });

        const tlocal = frame - 1040;
        tiers.forEach((item, i) => {
          const enter = gsap.utils.clamp(0, 1, (tlocal - i * 12) / 34);
          const row = document.getElementById("tier-" + i);
          row.style.opacity = enter;
          row.style.transform = `translateX(${(1 - enter) * -50}px)`;
          document.getElementById("tval-" + i).textContent = Math.round(item.count * enter);
          const fill = row.querySelector(".tier-fill");
          fill.style.width = (enter * Number(fill.dataset.target)) + "%";
        });

        const plocal = frame - 1310;
        providers.forEach((item, i) => {
          const enter = gsap.utils.clamp(0, 1, (plocal - i * 8) / 30);
          const row = document.getElementById("prow-" + i);
          row.style.opacity = enter;
          row.style.transform = `translateY(${(1 - enter) * 36}px)`;
          document.getElementById("pval-" + i).textContent = Math.round(item.count * enter);
          row.querySelector(".provider-fill").style.width = (enter * (item.count / providerMax) * 100) + "%";
        });

        const olocal = frame - 1540;
        const reveal = gsap.utils.clamp(0, 1, olocal / 24);
        const outroContent = document.getElementById("outro-content");
        outroContent.style.opacity = reveal;
        outroContent.style.transform = `translateY(${(1 - reveal) * 54}px)`;
        document.getElementById("outro-line").style.width = gsap.utils.clamp(0, 100, (olocal - 12) / 22 * 100) + "%";
        document.getElementById("timeline-fill").style.width = (progress * 100) + "%";
      }
    }, 0);

    window.__timelines[compositionId] = tl;
  }
})();
