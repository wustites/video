import data from './data.json';

/** MHLW Vital Statistics (final), via e-Stat: births of Japanese nationals in Japan, by child's residence. */
export const YEARS: number[] = data.years;
export const FIRST = YEARS[0];
export const LAST = YEARS[YEARS.length - 1];
export const RETRIEVED = data.retrieved;

/** Official national totals (47 prefectures + residence abroad). */
export const NATIONAL: {year: number; births: number}[] = data.national;
export const nationalAt = (year: number) => NATIONAL.find((r) => r.year === year)!.births;

export type Prefecture = {code: string; ja: string; zh: string; jaFull: string; zhFull: string; births: number[]; first: number; last: number; prev: number; ratio: number};

/** Short display names, by prefecture code. */
const ZH: Record<string, string> = {
  '01': '北海道', '02': '青森', '03': '岩手', '04': '宫城', '05': '秋田', '06': '山形', '07': '福岛', '08': '茨城',
  '09': '栃木', '10': '群马', '11': '埼玉', '12': '千叶', '13': '东京', '14': '神奈川', '15': '新潟', '16': '富山',
  '17': '石川', '18': '福井', '19': '山梨', '20': '长野', '21': '岐阜', '22': '静冈', '23': '爱知', '24': '三重',
  '25': '滋贺', '26': '京都', '27': '大阪', '28': '兵库', '29': '奈良', '30': '和歌山', '31': '鸟取', '32': '岛根',
  '33': '冈山', '34': '广岛', '35': '山口', '36': '德岛', '37': '香川', '38': '爱媛', '39': '高知', '40': '福冈',
  '41': '佐贺', '42': '长崎', '43': '熊本', '44': '大分', '45': '宫崎', '46': '鹿儿岛', '47': '冲绳',
};

export const PREFECTURES: Prefecture[] = data.prefectures.map((p) => {
  const first = p.births[0];
  const last = p.births[p.births.length - 1];
  return {
    code: p.code,
    ja: p.name === '北海道' ? p.name : p.name.replace(/[都府県]$/, ''),
    zh: ZH[p.code],
    jaFull: p.name,
    zhFull: ZH[p.code] + ({'01': '', '13': '都', '26': '府', '27': '府'}[p.code] ?? '县'),
    births: p.births,
    first,
    last,
    prev: p.births[p.births.length - 2],
    ratio: last / first,
  };
});
export const byCode = (code: string) => PREFECTURES.find((p) => p.code === code)!;

export const RANKED = [...PREFECTURES].sort((a, b) => b.last - a.last);
const byRatio = [...PREFECTURES].sort((a, b) => a.ratio - b.ratio);

export const FACTS = {
  first: nationalAt(FIRST),
  last: nationalAt(LAST),
  /** Percent drop FIRST → LAST, rounded. */
  drop: Math.round((1 - nationalAt(LAST) / nationalAt(FIRST)) * 100),
  /** First year under one million. */
  belowMillion: NATIONAL.find((r) => r.births < 1_000_000)!.year,
  /** Every year from belowMillion to LAST is lower than the year before. */
  fallingStreak: LAST - NATIONAL.find((r) => r.births < 1_000_000)!.year,
  top: RANKED[0],
  topShare: Math.round((RANKED[0].last / nationalAt(LAST)) * 1000) / 10,
  allDown: PREFECTURES.every((p) => p.last < p.first),
  underHalf: PREFECTURES.filter((p) => p.ratio < 0.5).length,
  steepest: byRatio[0],
  mildest: byRatio[byRatio.length - 1],
  smallest: RANKED[RANKED.length - 1],
  under5000: PREFECTURES.filter((p) => p.last < 5000).length,
  risers: PREFECTURES.filter((p) => p.last > p.prev).sort((a, b) => (b.last - b.prev) - (a.last - a.prev)),
};

/** Tile-grid map of Japan: [code, column, row] on a 13 × 12 grid. */
export const TILES: [string, number, number][] = [
  ['01', 12, 0],
  ['02', 12, 2],
  ['05', 11, 3], ['03', 12, 3],
  ['17', 8, 4], ['16', 9, 4], ['15', 10, 4], ['06', 11, 4], ['04', 12, 4],
  ['32', 3, 5], ['31', 4, 5], ['18', 7, 5], ['21', 8, 5], ['20', 9, 5], ['10', 10, 5], ['09', 11, 5], ['07', 12, 5],
  ['35', 2, 6], ['34', 3, 6], ['33', 4, 6], ['28', 5, 6], ['26', 6, 6], ['25', 7, 6], ['23', 8, 6], ['19', 9, 6], ['11', 10, 6], ['08', 11, 6],
  ['41', 0, 7], ['40', 1, 7], ['27', 5, 7], ['29', 6, 7], ['24', 7, 7], ['22', 8, 7], ['14', 9, 7], ['13', 10, 7], ['12', 11, 7],
  ['42', 0, 8], ['43', 1, 8], ['44', 2, 8], ['38', 3, 8], ['37', 4, 8], ['36', 5, 8], ['30', 6, 8],
  ['46', 0, 9], ['45', 1, 9], ['39', 4, 9],
  ['47', 0, 11],
];
