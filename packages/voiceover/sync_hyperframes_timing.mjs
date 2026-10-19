// 按旁白段落时长改写 HyperFrames 项目 index.html 中各场景、旁白和根节点的时长。
// 用法（在项目目录执行）：node ../../packages/voiceover/sync_hyperframes_timing.mjs [--fade 0.38] [--tail 2.6]
//
// 约定：
// - 场景元素带 data-scene="<序号>" data-start="…" data-duration="…"（三个属性按此顺序相邻）；
// - 根节点 id="root"，旁白 <audio id="narration">；
// - 场景 clip 前后各多留 fade 秒用于交叉淡化，最后一个场景延续到旁白结束后 tail 秒。
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';

const {values} = parseArgs({options: {fade: {type: 'string', default: '0.38'}, tail: {type: 'string', default: '2.6'}}});
const FADE = Number(values.fade);
const TAIL = Number(values.tail);
const projectDir = process.cwd();
const durations = JSON.parse(readFileSync(path.join(projectDir, 'public/voiceover/segment-durations.json'), 'utf8'));
const htmlPath = path.join(projectDir, 'index.html');
let html = readFileSync(htmlPath, 'utf8');
const sceneCount = [...html.matchAll(/data-scene="\d+"/g)].length;
if (durations.length !== sceneCount) throw new Error(`旁白段落数 ${durations.length} 与场景数 ${sceneCount} 不一致`);

const r = (n) => Number(n.toFixed(3));
const audioEnd = durations.reduce((a, b) => a + b, 0);
const total = audioEnd + TAIL;
let t = 0;
durations.forEach((d, i) => {
  const start = i === 0 ? 0 : t - FADE;
  const end = i === durations.length - 1 ? total : t + d + FADE;
  const pattern = new RegExp(`(data-scene="${i}" data-start=")[^"]*(" data-duration=")[^"]*"`);
  if (!pattern.test(html)) throw new Error(`场景 ${i} 缺少相邻的 data-start / data-duration`);
  html = html.replace(pattern, `$1${r(start)}$2${r(end - start)}"`);
  t += d;
});
html = html.replace(/(id="root"[^>]*data-duration=")[^"]*"/, `$1${r(total)}"`);
html = html.replace(/(id="narration"[^>]*data-duration=")[^"]*"/, `$1${r(audioEnd)}"`);
writeFileSync(htmlPath, html);
console.log(`synced ${durations.length} scenes, total ${r(total)}s`);
