/**
 * 2026 Fortune Global 500 (fiscal years ending on or before 2026-03-31). Every figure is from
 * Fortune's press release (2026-07-28) or the published 2026 ranking table; see README.
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
  {rank: 1, nameZh: '亚马逊', revenue: 716924, profit: 77670, color: '#2563EB', country: '美国'},
  {rank: 2, nameZh: '沃尔玛', revenue: 713163, profit: 21893, color: '#2563EB', country: '美国'},
  {rank: 3, nameZh: '国家电网', revenue: 555371, profit: 11116, color: '#EF4444', country: '中国'},
  {rank: 4, nameZh: '联合健康', revenue: 447567, profit: 12056, color: '#2563EB', country: '美国'},
  {rank: 5, nameZh: '沙特阿美', revenue: 445529, profit: 92785, color: '#10B981', country: '沙特'},
  {rank: 6, nameZh: '苹果', revenue: 416161, profit: 112010, color: '#2563EB', country: '美国'},
  {rank: 7, nameZh: '麦克森', revenue: 403430, profit: 4762, color: '#2563EB', country: '美国'},
  {rank: 8, nameZh: 'Alphabet', revenue: 402836, profit: 132170, color: '#2563EB', country: '美国'},
  {rank: 9, nameZh: 'CVS Health', revenue: 402067, profit: 1768, color: '#2563EB', country: '美国'},
  {rank: 10, nameZh: '中国石油', revenue: 401927, profit: 21159, color: '#EF4444', country: '中国'},
];

export const TOTALS = {
  revenueTrillion: 43.1,
  profitTrillion: 3.4,
  employeesMillion: 70.2,
  womenCeos: 34,
  countries: 36,
  walmartStreak: 12,
};

/** Companies by headquarters; Greater China includes Taiwan. */
export const COUNTRY_SPLIT = [
  {name: '美国', count: 141, color: '#2563EB', note: '2008 年以来最多'},
  {name: '中国', count: 122, color: '#EF4444', note: '含台湾地区，比上年少 8 家'},
  {name: '其他 34 个国家和地区', count: 237, color: '#94A3B8', note: ''},
];

/** Fortune's five largest sectors by company count; together 61% of companies, 66% of revenue. */
export const SECTORS = [
  {name: '金融', count: 123, color: '#2563EB'},
  {name: '能源', count: 77, color: '#F97316'},
  {name: '科技', count: 38, color: '#8B5CF6'},
  {name: '汽车及零部件', count: 35, color: '#10B981'},
  {name: '医疗', count: 31, color: '#EC4899'},
];
export const SECTOR_OTHER = 500 - SECTORS.reduce((s, x) => s + x.count, 0);

/** Most profitable companies in the 2026 list. */
export const PROFIT_LEADERS = [
  {nameZh: 'Alphabet', profit: 132170, color: '#2563EB'},
  {nameZh: '英伟达', profit: 120067, color: '#10B981'},
  {nameZh: '苹果', profit: 112010, color: '#64748B'},
  {nameZh: '微软', profit: 101832, color: '#0EA5E9'},
];

/** USD millions → "6,810 亿" (hundreds of millions, the usual Chinese unit). */
export const yi = (millions: number) => `${Math.round(millions / 100).toLocaleString('en-US')} 亿`;

export const MAX_REVENUE = COMPANIES[0].revenue;
