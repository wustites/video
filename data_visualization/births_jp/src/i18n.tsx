import React from 'react';
import {FACTS, FIRST, LAST} from './data';
import type {SceneId} from './timing';

export type Locale = 'zh' | 'ja';

const n = (v: number) => v.toLocaleString('en-US');
const zhWan = (v: number) => `${(v / 1e4).toFixed(1)}万`;
const jaMan = (v: number) => `${Math.floor(v / 1e4)}万${v % 1e4 ? n(v % 1e4) : ''}`;

/** Words in each locale's narration that trigger on-screen reveals (Edge TTS WordBoundary). */
type Cues = {[S in SceneId]: Record<string, string>};
export const CUES: Record<Locale, Cues> = {
  zh: {
    intro: {last: '67.1万', first: '119.1万', drop: '44%'},
    trend: {million: '100万', streak: '此后', low: '新低'},
    ranking: {top: '东京都', share: '12.7%', oneIn8: '每', rest: '大阪'},
    map: {all: '全部', half: '一半', steepest: '秋田', mildest: '东京'},
    small: {smallest: '鸟', count: '2973', under: '5000'},
    risers: {few: '4个', top: '东京', others: '石川', rest: '43个'},
    outro: {source: '数据'},
  },
  ja: {
    intro: {last: '67万', first: '119万', drop: '44%'},
    trend: {million: '100万人', streak: 'その', low: '過去'},
    ranking: {top: '東京都', share: '12.7%', oneIn8: 'およそ', rest: '大阪'},
    map: {all: 'すべて', half: '半分', steepest: '秋田', mildest: '東京都'},
    small: {smallest: '鳥取', count: '2973', under: '5000'},
    risers: {few: 'わずか', top: '東京都', others: '石川', rest: '43'},
    outro: {source: 'データ'},
  },
};

const pct = (r: number) => `${Math.round(r * 100)}%`;

export const TEXT = {
  zh: {
    num: n,
    big: zhWan,
    unit: '人',
    intro: {kicker: '日本出生人口', title: <>日本一年<br />出生多少人？</>, year: (y: number) => `${y} 年`, drop: `26 年间减少 ${FACTS.drop}%`},
    trend: {kicker: `全国 · ${FIRST}–${LAST}`, title: <>{FACTS.belowMillion} 年跌破 100 万<br />此后连续 {FACTS.fallingStreak} 年减少</>, million: '100 万', low: '历史新低'},
    ranking: {kicker: `${LAST} 年 · 出生人数前十`, title: <>每 8 个新生儿<br />就有 1 个在东京</>, share: `东京占全国 ${FACTS.topShare}%`},
    map: {kicker: `${LAST} 年 ÷ ${FIRST} 年`, title: <>47 个都道府县<br />全部减少</>, half: `${FACTS.underHalf} 个不到一半`, legend: [`不到 50%`, `50–70%`, `70% 以上`], steepest: `${FACTS.steepest.zhFull} ${pct(FACTS.steepest.ratio)}`, mildest: `${FACTS.mildest.zhFull} ${pct(FACTS.mildest.ratio)}`},
    small: {kicker: `${LAST} 年 · 出生最少`, title: <>{FACTS.under5000} 个县<br />一年不满 5000 人</>, line: '5000 人'},
    risers: {kicker: `${LAST} 年比 ${LAST - 1} 年`, title: <>只有 {FACTS.risers.length} 个<br />出生人数增加</>, rest: `其余 ${47 - FACTS.risers.length} 个继续减少`},
    outro: {title: <>少子化不是一地的问题<br /><span style={{color: '#ff6b6b'}}>而是整个日本的现实</span></>, source: <>数据：厚生劳动省《人口动态统计》确定数，经 e-Stat 获取<br />口径：日本境内出生的日本人，按孩子住所划分都道府县<br />全国数含住所在国外者</>},
  },
  ja: {
    num: n,
    big: jaMan,
    unit: '人',
    intro: {kicker: '日本の出生数', title: <>1年に何人<br />生まれている？</>, year: (y: number) => `${y}年`, drop: `26年で ${FACTS.drop}% 減`},
    trend: {kicker: `全国 · ${FIRST}–${LAST}`, title: <>{FACTS.belowMillion}年に100万人割れ<br />その後{FACTS.fallingStreak}年連続減少</>, million: '100万人', low: '過去最少'},
    ranking: {kicker: `${LAST}年 · 出生数トップ10`, title: <>およそ8人に1人が<br />東京生まれ</>, share: `東京都が全国の ${FACTS.topShare}%`},
    map: {kicker: `${LAST}年 ÷ ${FIRST}年`, title: <>47都道府県<br />すべてで減少</>, half: `${FACTS.underHalf}道県で半分未満`, legend: ['50%未満', '50–70%', '70%以上'], steepest: `${FACTS.steepest.jaFull} ${pct(FACTS.steepest.ratio)}`, mildest: `${FACTS.mildest.jaFull} ${pct(FACTS.mildest.ratio)}`},
    small: {kicker: `${LAST}年 · 出生数が少ない県`, title: <>{FACTS.under5000}県で<br />年間5000人未満</>, line: '5000人'},
    risers: {kicker: `${LAST}年 vs ${LAST - 1}年`, title: <>増えたのは<br />わずか{FACTS.risers.length}都県</>, rest: `残る${47 - FACTS.risers.length}道府県は減少`},
    outro: {title: <>少子化は一部の地域ではなく<br /><span style={{color: '#ff6b6b'}}>日本全体の現実</span></>, source: <>データ：厚生労働省「人口動態統計」確定数（e-Stat）<br />日本における日本人の出生数、子の住所地別<br />全国値は住所地「外国」を含む</>},
  },
} satisfies Record<Locale, unknown>;
