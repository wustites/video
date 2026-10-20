/**
 * 2025 Fortune Global 500 (fiscal 2024 revenue). Every figure below is from Fortune's
 * 2025 press release (2025-07-29) or the published 2025 ranking table; see README for sources.
 * Unit for revenue/profit: USD millions.
 */

export interface Company {
  rank: number;
  nameZh: string;
  revenue: number;
  profit: number;
  color: string;
  country: '美国' | '中国' | '沙特';
}

export const COMPANIES: Company[] = [
  {rank: 1, nameZh: '沃尔玛', revenue: 680985, profit: 19436, color: '#2563EB', country: '美国'},
  {rank: 2, nameZh: '亚马逊', revenue: 637959, profit: 59248, color: '#2563EB', country: '美国'},
  {rank: 3, nameZh: '国家电网', revenue: 548414, profit: 10045, color: '#EF4444', country: '中国'},
  {rank: 4, nameZh: '沙特阿美', revenue: 480194, profit: 104982, color: '#10B981', country: '沙特'},
  {rank: 5, nameZh: '中国石油', revenue: 412645, profit: 22424, color: '#EF4444', country: '中国'},
  {rank: 6, nameZh: '中国石化', revenue: 407490, profit: 8036, color: '#EF4444', country: '中国'},
  {rank: 7, nameZh: '联合健康', revenue: 400278, profit: 14405, color: '#2563EB', country: '美国'},
  {rank: 8, nameZh: '苹果', revenue: 391035, profit: 93736, color: '#2563EB', country: '美国'},
  {rank: 9, nameZh: 'CVS Health', revenue: 372809, profit: 4614, color: '#2563EB', country: '美国'},
  {rank: 10, nameZh: '伯克希尔-哈撒韦', revenue: 371433, profit: 88995, color: '#2563EB', country: '美国'},
];

export const TOTALS = {
  revenueTrillion: 41.7,
  profitTrillion: 2.98,
  employeesMillion: 70.1,
  womenCeos: 33,
  countries: 36,
  top10RevenueTrillion: 4.7,
  walmartStreak: 12,
};

/** Companies by headquarters; Greater China = 124 mainland incl. Hong Kong + 6 Taiwan. */
export const COUNTRY_SPLIT = [
  {name: '美国', count: 138, color: '#2563EB', note: ''},
  {name: '中国', count: 130, color: '#EF4444', note: '含台湾地区 6 家'},
  {name: '其他 34 个国家和地区', count: 232, color: '#94A3B8', note: ''},
];

/** Fortune's five largest sectors by company count; together 60% of companies, 66% of revenue. */
export const SECTORS = [
  {name: '金融', count: 121, color: '#2563EB'},
  {name: '能源', count: 79, color: '#F97316'},
  {name: '汽车及零部件', count: 35, color: '#10B981'},
  {name: '科技', count: 34, color: '#8B5CF6'},
  {name: '医疗', count: 33, color: '#EC4899'},
];
export const SECTOR_OTHER = 500 - SECTORS.reduce((s, x) => s + x.count, 0);

/** Most profitable companies in the 2025 list. */
export const PROFIT_LEADERS = [
  {nameZh: '沙特阿美', profit: 104982, color: '#10B981'},
  {nameZh: 'Alphabet', profit: 100118, color: '#2563EB'},
  {nameZh: '苹果', profit: 93736, color: '#64748B'},
  {nameZh: '伯克希尔-哈撒韦', profit: 88995, color: '#D97706'},
];

/** USD millions → "6,810 亿" (hundreds of millions, the usual Chinese unit). */
export const yi = (millions: number) => `${Math.round(millions / 100).toLocaleString('en-US')} 亿`;

export const FPS = 30;
export const TOTAL_SECONDS = 36;
export const DURATION_IN_FRAMES = TOTAL_SECONDS * FPS;

/** Scene windows in frames; neighbours overlap by 30 frames for an out-then-in fade. */
export const SCENES = [
  {id: 'scene-intro', start: 0, end: 150},
  {id: 'scene-topbars', start: 120, end: 420},
  {id: 'scene-country', start: 390, end: 600},
  {id: 'scene-industry', start: 570, end: 780},
  {id: 'scene-profit', start: 750, end: 960},
  {id: 'scene-outro', start: 930, end: 1080},
] as const;

export const MAX_REVENUE = COMPANIES[0].revenue;
