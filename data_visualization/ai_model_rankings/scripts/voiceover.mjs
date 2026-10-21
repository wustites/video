#!/usr/bin/env node
/**
 * voiceover.mjs — write the narration for every locale from src/snapshot.json, then
 * synthesize it with Edge TTS (packages/voiceover/edge_narration.py).
 *
 * One paragraph per scene (intro, ranking, scatter, efficiency, tiers, providers, outro).
 * All locales are generated on every run because each composition needs its own
 * durations at bundle time.
 *
 *   npm run voiceover
 */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VO = path.join(ROOT, 'public', 'voiceover');
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'snapshot.json'), 'utf8'));

const VOICES = {en: 'en-US-AriaNeural', zh: 'zh-CN-XiaoxiaoNeural', ja: 'ja-JP-NanamiNeural'};
const PROVIDER_ZH = {deepseek: '深度求索', alibaba: '阿里云', kimi: '月之暗面', xiaomi: '小米', stepfun: '阶跃星辰'};

/** Spoken model name: drop the "(max with fallback)" effort tag shown on screen. */
const spoken = (name) => name.replace(/\s*\([^)]*\)$/, '');
const total = d.totalEvaluated;
const top = d.models[0];
const [tierFrontier, tierChallenger, , tierEntry] = d.tierCounts;
const frontierMin = d.tierMins[0];
const frontierTop15 = d.models.filter((m) => m.score >= frontierMin).length;
const [, fastest, balanced] = d.cards;
const [balScore, balSpeed] = balanced.value.split(' · ');
const fastestSpeed = fastest.value.replace(/\s*tok\/s/, '');
const [p0, p1] = d.providerCounts;
const pName = (p, lang) => (lang === 'zh' ? PROVIDER_ZH[p.providerKey] ?? p.label : p.label);
// Only claim the top scorer is not the fastest when the plotted data says so.
const topNotFastest = d.scatterPoints.some((p) => (p.speed ?? 0) > (top.speed ?? 0));

const NARRATION = {
  en: [
    `Who leads the AI race? We compared ${total} models on intelligence and speed, using data from Artificial Analysis.`,
    `On the Intelligence Index, ${spoken(top.name)} ranks first with a score of ${top.score}. ${frontierTop15} models reach the frontier tier, at ${frontierMin} points or more.`,
    topNotFastest
      ? `Plot speed against intelligence, and the leaders spread out. The highest scorer is not the fastest.`
      : `Plot speed against intelligence, and the top scorer is also among the fastest.`,
    `So the best model depends on the job. ${spoken(fastest.name)} is the fastest, at ${fastestSpeed} tokens per second, while ${spoken(balanced.name)} pairs a score of ${balScore} with ${balSpeed} tokens per second.`,
    `Across all ${total} models, only ${tierFrontier} sit in the frontier tier. ${tierChallenger} are challengers, and the long tail holds ${tierEntry}.`,
    `In the top twenty, ${p0.label} has ${p0.count} models, followed by ${p1.label} with ${p1.count}.`,
    `The AI race is more competitive than ever.`,
  ],
  zh: [
    `谁在领跑 AI 竞赛？我们用 Artificial Analysis 的数据，比较了 ${total} 个模型的智能与速度。`,
    `在智能指数上，${spoken(top.name)} 以 ${top.score} 分排名第一。共有 ${frontierTop15} 个模型达到 ${frontierMin} 分以上，进入前沿层。`,
    topNotFastest
      ? `把速度和智能放在一起看，头部模型明显分散开来：得分最高的，并不是最快的。`
      : `把速度和智能放在一起看，得分最高的模型同样跑得很快。`,
    `所以，最佳模型取决于任务。${spoken(fastest.name)} 速度最快，每秒 ${fastestSpeed} 个 Token；${spoken(balanced.name)} 则在 ${balScore} 分的同时，达到每秒 ${balSpeed} 个 Token。`,
    `在全部 ${total} 个模型中，只有 ${tierFrontier} 个属于前沿层，${tierChallenger} 个属于挑战层，长尾还有 ${tierEntry} 个。`,
    `前 20 名里，${pName(p0, 'zh')} 有 ${p0.count} 个模型，${pName(p1, 'zh')} 有 ${p1.count} 个。`,
    `AI 格局的竞争，从未如此激烈。`,
  ],
  ja: [
    `AI競争をリードするのは誰か。Artificial Analysis のデータで、${total}のモデルを知能と速度で比べました。`,
    `知能指数では、${spoken(top.name)} が${top.score}点で首位です。${frontierMin}点以上のフロンティア層には、${frontierTop15}モデルが入りました。`,
    topNotFastest
      ? `速度と知能を並べると、上位モデルは大きく散らばります。最高スコアのモデルが、最速とは限りません。`
      : `速度と知能を並べると、最高スコアのモデルは速度でも上位です。`,
    `つまり、最適なモデルは用途次第です。最速は ${spoken(fastest.name)} で毎秒${fastestSpeed}トークン。${spoken(balanced.name)} は${balScore}点で、毎秒${balSpeed}トークンを両立しています。`,
    `全${total}モデルのうち、フロンティア層は${tierFrontier}モデルだけ。挑戦層が${tierChallenger}、ロングテールには${tierEntry}モデルがあります。`,
    `上位20では、${p0.label}が${p0.count}モデル、${p1.label}が${p1.count}モデルです。`,
    `AIの競争は、かつてないほど激しくなっています。`,
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
