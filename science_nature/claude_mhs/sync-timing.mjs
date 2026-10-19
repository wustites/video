// 按 public/voiceover/segment-durations.json 改写 index.html 中各场景、旁白和根节点的时长。
// 场景 clip 前后各多留 FADE 秒用于交叉淡化，与原 Remotion 版本的 @video/core 时间轴一致。
import {readFileSync, writeFileSync} from 'node:fs';

const FADE = 0.38;
const TAIL = 2.6;
const durations = JSON.parse(readFileSync(new URL('./public/voiceover/segment-durations.json', import.meta.url), 'utf8'));
const htmlUrl = new URL('./index.html', import.meta.url);
let html = readFileSync(htmlUrl, 'utf8');
const sceneCount = [...html.matchAll(/data-scene="\d+"/g)].length;
if (durations.length !== sceneCount) throw new Error(`旁白段落数 ${durations.length} 与场景数 ${sceneCount} 不一致`);

const r = (n) => Number(n.toFixed(3));
const audioEnd = durations.reduce((a, b) => a + b, 0);
const total = audioEnd + TAIL;
let t = 0;
durations.forEach((d, i) => {
  const start = i === 0 ? 0 : t - FADE;
  const end = i === durations.length - 1 ? total : t + d + FADE;
  html = html.replace(new RegExp(`(data-scene="${i}" data-start=")[^"]*(" data-duration=")[^"]*"`), `$1${r(start)}$2${r(end - start)}"`);
  t += d;
});
html = html.replace(/(id="root"[^>]*data-duration=")[^"]*"/, `$1${r(total)}"`);
html = html.replace(/(id="narration"[^>]*data-duration=")[^"]*"/, `$1${r(audioEnd)}"`);
writeFileSync(htmlUrl, html);
console.log(`synced ${durations.length} scenes, total ${r(total)}s`);
