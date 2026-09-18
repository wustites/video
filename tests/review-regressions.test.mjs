import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
async function loadTs(source) {
  const js = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022}}).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}

// 有相对导入的模块：先递归把相对路径改写成 data: URL，再转译整体 import
const moduleUrls = new Map();
function moduleUrl(file) {
  const cached = moduleUrls.get(file);
  if (cached) return cached;
  let source = readFileSync(file, 'utf8');
  for (const [, spec] of source.matchAll(/(?:from|import)\s+'(\.[^']+)'/g)) {
    const target = path.resolve(path.dirname(file), /\.[cm]?[jt]sx?$/.test(spec) ? spec : `${spec}.ts`);
    source = source.replaceAll(`'${spec}'`, `'${moduleUrl(target)}'`);
  }
  const url = 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022}}).outputText).toString('base64');
  moduleUrls.set(file, url);
  return url;
}
const loadModule = (file) => import(moduleUrl(file));

test('population frames retain a sorted top 15 and reach the final year', async () => {
  const d = await loadTs(readFileSync(path.join(root, 'data_visualization/population_cn/src/data.ts'), 'utf8'));
  const component = readFileSync(path.join(root, 'data_visualization/population_cn/src/PopulationCn.tsx'), 'utf8');
  const range = component.match(/interpolate\(frame, \[0, ([^\]]+)\], \[START_YEAR, END_YEAR\]/);
  assert.ok(range);
  const end = Function('TOTAL_FRAMES', `return ${range[1]}`)(d.TOTAL_FRAMES);
  const original = JSON.stringify(d.populationData);
  for (let frame = 0; frame < d.TOTAL_FRAMES; frame++) {
    const year = d.START_YEAR + frame / end * (d.END_YEAR - d.START_YEAR);
    const rows = d.interpolateData(year);
    assert.equal(rows.length, 15);
    assert.ok(rows.every((r, i) => i === 0 || rows[i - 1].b >= r.b));
    if (frame === 0) assert.equal(rows[0].p, '河南');
    if (frame === d.TOTAL_FRAMES - 1) assert.equal(Math.floor(year), d.END_YEAR);
  }
  assert.equal(JSON.stringify(d.populationData), original);
});

for (const project of ['ai_model_rankings', 'openrouter_rankings']) {
  test(`${project}: data:update refreshes the data consumed by Remotion and preserves fallback`, async () => {
    const projectRoot = path.join(root, 'data_visualization', project);
    const dir = mkdtempSync(path.join(tmpdir(), 'video-rankings-'));
    try {
      for (const sub of ['scripts', 'src', 'public']) mkdirSync(path.join(dir, sub));
      copyFileSync(path.join(projectRoot, 'scripts/setup.mjs'), path.join(dir, 'scripts/setup.mjs'));
      copyFileSync(path.join(projectRoot, 'src/snapshot.json'), path.join(dir, 'src/snapshot.json'));
      const rows = Array.from({length: 100}, (_, i) => ({date: '2030-01-01', model_permaslug: `openai/test-${i}`, total_completion_tokens: 1e12 + i, total_prompt_tokens: 1e12, change: 0.1}));
      const html = '<tr></tr><tr></tr>' + Array.from({length: 60}, (_, i) => `<tr>${[`Test Model ${i}`, '', 'OpenAI', 80 - i, '', 100 + i, '', ''].map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
      const mock = path.join(dir, 'mock.mjs');
      writeFileSync(mock, `globalThis.fetch = async () => ({ok:true,json:async()=>(${JSON.stringify({data: rows})}),text:async()=>${JSON.stringify(html)}});`);
      const run = () => execFileSync(process.execPath, ['--import', mock, 'scripts/setup.mjs'], {cwd: dir, stdio: 'pipe'});
      run();
      const snapshotText = readFileSync(path.join(dir, 'src/snapshot.json'), 'utf8');
      const snapshot = JSON.parse(snapshotText);
      const adapter = readFileSync(path.join(projectRoot, 'src/data.ts'), 'utf8').replace("import snapshot from './snapshot.json';", `const snapshot = ${snapshotText};`);
      const data = await loadTs(adapter);
      if (project === 'ai_model_rankings') {
        assert.equal(data.METRICS.topScore, 80);
        assert.equal(data.MODELS[0].name, 'Test Model 0');
        assert.equal(data.SCATTER_POINTS[0].rank, 1);
      } else {
        assert.equal(data.DATA.dateRange.end, '2030-01-01');
        assert.equal(data.DATA.models.length, 10);
      }
      const legacy = readFileSync(path.join(dir, 'public/data.js'), 'utf8');
      assert.deepEqual(JSON.parse(legacy.slice(legacy.indexOf(' = ') + 3).trim().replace(/;$/, '')), snapshot);
      writeFileSync(mock, 'globalThis.fetch = async () => {throw new Error("offline")};');
      run();
      assert.equal(readFileSync(path.join(dir, 'src/snapshot.json'), 'utf8'), snapshotText);
      rmSync(path.join(dir, 'src/snapshot.json'));
      assert.throws(run);
    } finally {
      rmSync(dir, {recursive: true, force: true});
    }
  });
}

test('scatter keeps high scores, fast models and labels within the plot', async () => {
  const {layoutScatter, SCATTER_W, SCATTER_H} = await loadTs(readFileSync(path.join(root, 'data_visualization/ai_model_rankings/src/scatter.ts'), 'utf8'));
  const snapshot = JSON.parse(readFileSync(path.join(root, 'data_visualization/ai_model_rankings/src/snapshot.json'), 'utf8'));
  for (const points of [snapshot.scatterPoints, [{speed: 100, score: 80}, {speed: 940, score: 60}], [{speed: 0, score: 0}, {speed: null, score: 0}], []]) {
    const layout = layoutScatter(points);
    assert.equal(layout.length, points.length);
    for (const p of layout) {
      assert.ok(p.x >= 12 && p.x <= SCATTER_W - 12);
      assert.ok(p.y >= 12 && p.y <= SCATTER_H - 12);
      assert.ok(p.labelLeft >= 0 && p.labelLeft + p.labelWidth <= SCATTER_W);
    }
    if (points.length === 2 && points[0].score === 80) {
      assert.ok(layout[0].y < layout[1].y);
      assert.ok(layout[0].x < layout[1].x);
    }
  }
});

test('ranking and provider titles do not assert a fixed winner in any locale', async () => {
  const {LOCALES} = await loadTs(readFileSync(path.join(root, 'data_visualization/ai_model_rankings/src/i18n.ts'), 'utf8'));
  for (const locale of Object.values(LOCALES)) {
    assert.doesNotMatch(locale.scenes.ranking.title, /Claude|Opus/);
    assert.doesNotMatch(locale.scenes.providers.title, /Anthropic|OpenAI/);
  }
});

test('shandong scenes tile the narration and never leave an empty frame', async () => {
  const projectRoot = path.join(root, 'education/shandong_universities');
  const {buildTimeline, sceneOpacity} = await loadTs(readFileSync(path.join(projectRoot, 'src/scenes.ts'), 'utf8'));
  const {CITIES} = await loadTs(readFileSync(path.join(projectRoot, 'src/data.ts'), 'utf8'));
  const {GEO_CITIES} = await loadTs(readFileSync(path.join(projectRoot, 'src/shandongGeo.ts'), 'utf8'));
  const durations = JSON.parse(readFileSync(path.join(projectRoot, 'public/voiceover/segment-durations.json'), 'utf8'));
  const paragraphs = readFileSync(path.join(projectRoot, 'public/voiceover/narration.zh.txt'), 'utf8')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const ids = ['intro', ...CITIES.map((c) => c.name)];
  assert.equal(paragraphs.length, ids.length);
  assert.deepEqual(
    GEO_CITIES.map((c) => c.name),
    CITIES.map((c) => c.name),
  );

  const timeline = buildTimeline(ids, durations);
  const lastNarrationFrame = timeline.scenes[timeline.scenes.length - 1].endFrame;
  for (let i = 1; i < timeline.scenes.length; i++) {
    assert.equal(timeline.scenes[i].startFrame, timeline.scenes[i - 1].endFrame);
  }
  const cover = (frame) => Math.max(...timeline.scenes.map((s) => sceneOpacity(s, frame)));
  for (let frame = 0; frame <= lastNarrationFrame; frame++) {
    assert.equal(cover(frame), 1, `frame ${frame} has no fully visible scene`);
  }
  let previous = 1;
  for (let frame = lastNarrationFrame + 1; frame < timeline.totalFrames; frame++) {
    const current = cover(frame);
    assert.ok(current <= previous, `frame ${frame} brightens again during the end fade`);
    previous = current;
  }
  assert.equal(previous, 0);
  assert.throws(() => buildTimeline(ids, durations.slice(1)), /npm run voiceover/);

  CITIES.forEach((city, i) => {
    const text = paragraphs[i + 1].replace(/[（）()]/g, '');
    for (const school of city.schools) {
      assert.ok(text.includes(school.replace(/[（）()]/g, '')), `${city.name} 段落缺少 ${school}`);
    }
  });
});

test('shandong map camera focuses each city inside the map band without jumping', async () => {
  const projectRoot = path.join(root, 'education/shandong_universities');
  const load = (rel) => loadModule(path.join(projectRoot, rel));
  const {FPS, buildTimeline} = await load('src/scenes.ts');
  const {CITIES} = await load('src/data.ts');
  const {GEO_CITIES} = await load('src/shandongGeo.ts');
  const {PROVINCE_CAMERA, buildCameraKeys, cameraAt, focusAt, focusWeight, FRAME, MAP_BAND_BOTTOM, project, viewOf} = await load('src/mapCamera.ts');
  const durations = JSON.parse(readFileSync(path.join(projectRoot, 'public/voiceover/segment-durations.json'), 'utf8'));
  const ids = ['intro', ...CITIES.map((c) => c.name)];
  const timeline = buildTimeline(ids, durations);
  const keys = buildCameraKeys(ids, timeline.scenes, FPS);

  // 每个地市：聚焦期间整块真实边界都落在信息卡上方，且比全省视图更近
  GEO_CITIES.forEach((geo, i) => {
    const scene = keys[i + 1];
    assert.equal(scene.sceneId, geo.name);
    for (let frame = scene.startFrame + scene.fadeFrames; frame <= scene.endFrame - scene.fadeFrames; frame++) {
      const cam = cameraAt(frame, keys);
      assert.ok(cam.vbW < PROVINCE_CAMERA.vbW, `${geo.name} frame ${frame} 未推近`);
      const view = viewOf(cam);
      for (const x of [geo.bbox.x, geo.bbox.x + geo.bbox.w]) {
        for (const y of [geo.bbox.y, geo.bbox.y + geo.bbox.h]) {
          const {px, py} = project(view, x, y);
          assert.ok(px >= 0 && px <= FRAME.width && py >= 0 && py <= MAP_BAND_BOTTOM, `${geo.name} frame ${frame} 边界出画：${px.toFixed(0)},${py.toFixed(0)}`);
        }
      }
    }
  });

  // 全片相机连续：不允许单帧跳变（切换窗口写错时这里会失败）
  let maxCenterStep = 0;
  let maxZoomStep = 1;
  for (let frame = 0; frame < timeline.totalFrames; frame++) {
    const a = cameraAt(frame, keys);
    const b = cameraAt(frame + 1, keys);
    maxCenterStep = Math.max(maxCenterStep, Math.hypot(b.cx - a.cx, b.cy - a.cy) / a.vbW);
    maxZoomStep = Math.max(maxZoomStep, Math.max(b.vbW / a.vbW, a.vbW / b.vbW));
  }
  // 实测峰值出现在飞行中段（约 0.065 倍可见宽度 / 1.11 倍宽度），阈值留约 40% 余量；
  // 切换窗口写错时会退化成一次性跳变（远超 1 倍），因此这两个断言能兜住。
  assert.ok(maxCenterStep < 0.09, `单帧平移过大：${maxCenterStep.toFixed(3)} 倍可见宽度`);
  assert.ok(maxZoomStep < 1.15, `单帧缩放过大：${maxZoomStep.toFixed(3)}`);

  // 高亮权重始终归一：任一帧所有地市的权重之和不超过 1，且不会同时出现两个满权重
  const weights = (frame) => GEO_CITIES.map((g) => focusWeight(focusAt(frame, keys), g.name));
  for (let frame = 0; frame < timeline.totalFrames; frame++) {
    const sum = weights(frame).reduce((a, b) => a + b, 0);
    assert.ok(sum <= 1 + 1e-9, `frame ${frame} 高亮权重 ${sum}`);
  }
  assert.deepEqual(weights(keys[0].startFrame), weights(keys[0].startFrame).map(() => 0));
});
