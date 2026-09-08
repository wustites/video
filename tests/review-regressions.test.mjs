import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import ts from '../population_cn/node_modules/typescript/lib/typescript.js';

const root = fileURLToPath(new URL('../', import.meta.url));
async function loadTs(source) {
  const js = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022}}).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}

test('population frames retain a sorted top 15 and reach the final year', async () => {
  const d = await loadTs(readFileSync(path.join(root, 'population_cn/src/data.ts'), 'utf8'));
  const component = readFileSync(path.join(root, 'population_cn/src/PopulationCn.tsx'), 'utf8');
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
  test(`${project}: setup updates the data consumed by Remotion and preserves fallback`, async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'video-rankings-'));
    try {
      for (const sub of ['scripts', 'src', 'public']) mkdirSync(path.join(dir, sub));
      copyFileSync(path.join(root, project, 'scripts/setup.mjs'), path.join(dir, 'scripts/setup.mjs'));
      copyFileSync(path.join(root, project, 'src/snapshot.json'), path.join(dir, 'src/snapshot.json'));
      const rows = Array.from({length: 100}, (_, i) => ({date: '2030-01-01', model_permaslug: `openai/test-${i}`, total_completion_tokens: 1e12 + i, total_prompt_tokens: 1e12, change: 0.1}));
      const html = '<tr></tr><tr></tr>' + Array.from({length: 60}, (_, i) => `<tr>${[`Test Model ${i}`, '', 'OpenAI', 80 - i, '', 100 + i, '', ''].map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
      const mock = path.join(dir, 'mock.mjs');
      writeFileSync(mock, `globalThis.fetch = async () => ({ok:true,json:async()=>(${JSON.stringify({data: rows})}),text:async()=>${JSON.stringify(html)}});`);
      const run = () => execFileSync(process.execPath, ['--import', mock, 'scripts/setup.mjs'], {cwd: dir, stdio: 'pipe'});
      run();
      const snapshotText = readFileSync(path.join(dir, 'src/snapshot.json'), 'utf8');
      const snapshot = JSON.parse(snapshotText);
      const adapter = readFileSync(path.join(root, project, 'src/data.ts'), 'utf8').replace("import snapshot from './snapshot.json';", `const snapshot = ${snapshotText};`);
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
