#!/usr/bin/env node
/**
 * voiceover.mjs — write the narration for every locale from src/snapshot.json, then
 * synthesize it with Edge TTS (packages/voiceover/edge_narration.py).
 *
 * One paragraph per scene (intro, ranking, providers, growth, outro). All locales are
 * generated on every run because each composition needs its own durations at bundle time.
 *
 *   npm run voiceover
 */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VO = path.join(ROOT, 'public', 'voiceover');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'snapshot.json'), 'utf8'));

const VOICES = {en: 'en-US-AriaNeural', zh: 'zh-CN-XiaoxiaoNeural'};
const ZH = {Tencent: '腾讯', 'Z AI': '智谱', Xiaomi: '小米', 'Moonshot AI': '月之暗面', StepFun: '阶跃星辰'};

/** Spoken model name: drop the "(Sep)" release-month tag used to tell versions apart on screen. */
const spoken = (name) => name.replace(/\s*\([A-Z][a-z]{2}\)$/, '');
const top = data.providers[0];
const riser = data.topGrowth;
const sign = (g, up, down) => (g >= 0 ? up : down);

const NARRATION = {
  en: [
    `These are the most used AI models on OpenRouter this week. Developers sent ${data.totalTokens} trillion tokens through the platform.`,
    `${spoken(data.topModel)} leads with ${data.topTokens} trillion tokens. ${data.cnCount} of the top ten come from China.`,
    `By provider, ${top.name} takes ${top.pct} percent of all tokens. The top six providers together account for ${data.top6Pct} percent.`,
    `The fastest riser is ${spoken(riser.model)} from ${riser.provider}, ${sign(riser.growth, 'up', 'down')} ${Math.abs(riser.growth)} percent from last week.`,
    `The rankings keep reshuffling. Data from openrouter dot A I.`,
  ],
  zh: [
    `这是 OpenRouter 本周最热门的 AI 模型。开发者们这一周通过它调用了 ${data.totalTokens} 万亿个 Token。`,
    `${spoken(data.topModel)} 以 ${data.topTokens} 万亿 Token 位居第一。前十名中，有 ${data.cnCount} 个来自中国。`,
    `按厂商看，${ZH[top.name] ?? top.name} 占全部用量的 ${top.pct}%，排名第一；前六家厂商合计占 ${data.top6Pct}%。`,
    `增长最快的是${ZH[riser.provider] ?? riser.provider}的 ${spoken(riser.model)}，比上周${sign(riser.growth, '增长', '下降')} ${Math.abs(riser.growth)}%。`,
    `排名格局，正在不断洗牌。数据来自 OpenRouter 官网。`,
  ],
};

fs.mkdirSync(VO, {recursive: true});
for (const [lang, paragraphs] of Object.entries(NARRATION)) {
  fs.writeFileSync(path.join(VO, `narration.${lang}.txt`), paragraphs.join('\n\n') + '\n');
  const r = spawnSync(
    'python3',
    [
      path.join(ROOT, '..', '..', 'packages', 'voiceover', 'edge_narration.py'),
      '--voice', VOICES[lang], '--lang', lang, '--expected', String(paragraphs.length),
      '--word-marks', '--per-language-outputs',
    ],
    {cwd: ROOT, stdio: 'inherit'},
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}
