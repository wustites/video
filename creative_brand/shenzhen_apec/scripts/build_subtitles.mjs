// 用 Edge TTS WordBoundary（word-marks.json）为 cues.json 的每条中英字幕计算起止时间，写入 index.html 的 CUES 标记之间。
// 用法（在项目目录执行）：node scripts/build_subtitles.mjs
import {readFileSync, writeFileSync} from 'node:fs';

const vo = 'public/voiceover';
const cues = JSON.parse(readFileSync(`${vo}/cues.json`, 'utf8'));
const marks = JSON.parse(readFileSync(`${vo}/word-marks.json`, 'utf8'));
const durations = JSON.parse(readFileSync(`${vo}/segment-durations.json`, 'utf8'));
if (cues.length !== marks.length) throw new Error(`cues ${cues.length} 段与 word-marks ${marks.length} 段不一致`);

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const r = (n) => Number(n.toFixed(3));
const out = [];
let offset = 0;
cues.forEach((paragraph, p) => {
  const words = marks[p];
  let w = 0;
  const starts = paragraph.map(([en]) => {
    const start = words[w].start;
    let need = norm(en);
    while (need.length > 0) {
      const token = norm(words[w]?.text ?? '');
      if (!need.startsWith(token)) throw new Error(`段 ${p} 对齐失败：「${en}」在 "${words[w]?.text}"`);
      need = need.slice(token.length);
      w++;
    }
    return start;
  });
  paragraph.forEach(([en, zh], c) => {
    const end = c + 1 < paragraph.length ? starts[c + 1] - 0.05 : durations[p] - 0.1;
    out.push({p, c, start: r(offset + starts[c]), end: r(offset + end), en, zh});
  });
  offset += durations[p];
});

const htmlPath = 'index.html';
const html = readFileSync(htmlPath, 'utf8');
const pattern = /(\/\* CUES:BEGIN \*\/)[\s\S]*?(\/\* CUES:END \*\/)/;
if (!pattern.test(html)) throw new Error('index.html 缺少 CUES:BEGIN / CUES:END 标记');
writeFileSync(htmlPath, html.replace(pattern, `$1 ${JSON.stringify(out)} $2`));
console.log(`wrote ${out.length} cues`);
