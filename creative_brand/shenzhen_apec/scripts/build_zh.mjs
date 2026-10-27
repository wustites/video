// 由 index.html 生成中文旁白版 index.zh.html：场景时长、字幕时间、旁白音频换成 timing.zh.json / narration.zh.mp3，
// 字幕改为中文在上。用法（在项目目录执行）：node scripts/build_zh.mjs [--fade 0.38] [--tail 2.6]
// 场景时间公式与 packages/voiceover/sync_hyperframes_timing.mjs 一致。
import {readFileSync, writeFileSync} from 'node:fs';
import {parseArgs} from 'node:util';

const {values} = parseArgs({options: {fade: {type: 'string', default: '0.38'}, tail: {type: 'string', default: '2.6'}}});
const FADE = Number(values.fade);
const TAIL = Number(values.tail);
const vo = 'public/voiceover';
const cues = JSON.parse(readFileSync(`${vo}/cues.json`, 'utf8'));
const timing = JSON.parse(readFileSync(`${vo}/timing.zh.json`, 'utf8'));
const r = (n) => Number(n.toFixed(3));

let html = readFileSync('index.html', 'utf8');
const durations = timing.durations;
const sceneCount = [...html.matchAll(/data-scene="\d+"/g)].length;
if (durations.length !== sceneCount) throw new Error(`中文旁白段落数 ${durations.length} 与场景数 ${sceneCount} 不一致`);

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

const out = timing.cues.map((q) => {
  const [en, zh] = cues[q.p]?.[q.c] ?? [];
  if (zh === undefined) throw new Error(`timing.zh.json 的 cue ${q.p}.${q.c} 在 cues.json 中不存在`);
  return {...q, en, zh};
});
if (out.length !== cues.flat().length) throw new Error('timing.zh.json 与 cues.json 的字幕条数不一致，请重新运行 voiceover:zh');

const replaceOnce = (pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`index.html 中找不到 ${pattern}`);
  html = html.replace(pattern, replacement);
};
replaceOnce(/<html lang="en">/, '<html lang="zh-CN">');
replaceOnce(/(id="root"[^>]*data-duration=")[^"]*"/, `$1${r(total)}"`);
replaceOnce(/id="root"/, 'id="root" class="zh-first"');
replaceOnce(/(id="narration" src=")[^"]*(")/, `$1${vo}/narration.zh.mp3$2`);
replaceOnce(/(id="narration"[^>]*data-duration=")[^"]*"/, `$1${r(audioEnd)}"`);
replaceOnce(/(\/\* CUES:BEGIN \*\/)[\s\S]*?(\/\* CUES:END \*\/)/, `$1 ${JSON.stringify(out)} $2`);
writeFileSync('index.zh.html', html);
console.log(`wrote index.zh.html: ${out.length} cues, total ${r(total)}s`);
