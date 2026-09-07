export interface Company {
  rank: number;
  nameEn: string;
  nameZh: string;
  revenue: number;
  profit: number;
  color: string;
  country: string;
}

export interface CountryCount {
  country: string;
  count: number;
  color: string;
}

export interface IndustrySlice {
  name: string;
  value: number;
  label: string;
  color: string;
}

export interface ProfitLeader {
  nameEn: string;
  nameZh: string;
  profit: number;
  color: string;
}

/** Top 10 by revenue (财富 2025 / 2024 fiscal year, unit: USD millions). Order mirrors index.html. */
export const COMPANIES: Company[] = [
  {rank: 1, nameEn: 'Walmart', nameZh: '沃尔玛', revenue: 648125, profit: 15511, color: '#2563EB', country: '美国'},
  {rank: 2, nameEn: 'Amazon', nameZh: '亚马逊', revenue: 574785, profit: 30425, color: '#FF9900', country: '美国'},
  {rank: 3, nameEn: 'State Grid', nameZh: '国家电网', revenue: 545948, profit: 8832, color: '#10B981', country: '中国'},
  {rank: 4, nameEn: 'Saudi Aramco', nameZh: '沙特阿美', revenue: 493726, profit: 120903, color: '#EAB308', country: '沙特'},
  {rank: 5, nameEn: 'China Petrochemical', nameZh: '中国石化', revenue: 483019, profit: 8346, color: '#EF4444', country: '中国'},
  {rank: 6, nameEn: 'Apple', nameZh: '苹果', revenue: 383285, profit: 93736, color: '#64748B', country: '美国'},
  {rank: 7, nameEn: 'CNPC', nameZh: '中国石油', revenue: 475213, profit: 20158, color: '#F97316', country: '中国'},
  {rank: 8, nameEn: 'UnitedHealth', nameZh: '联合健康', revenue: 371622, profit: 14407, color: '#8B5CF6', country: '美国'},
  {rank: 9, nameEn: 'Berkshire Hathaway', nameZh: '伯克希尔', revenue: 364482, profit: 96223, color: '#D97706', country: '美国'},
  {rank: 10, nameEn: 'CVS Health', nameZh: 'CVS健康', revenue: 357774, profit: 4613, color: '#EC4899', country: '美国'},
];

export const COUNTRY_COUNTS: CountryCount[] = [
  {country: '美国', count: 138, color: '#2563EB'},
  {country: '中国', count: 130, color: '#EF4444'},
  {country: '日本', count: 41, color: '#F97316'},
  {country: '德国', count: 29, color: '#10B981'},
  {country: '法国', count: 24, color: '#8B5CF6'},
  {country: '英国', count: 18, color: '#EC4899'},
  {country: '韩国', count: 16, color: '#EAB308'},
  {country: '其他', count: 104, color: '#64748B'},
];

export const INDUSTRY_MIX: IndustrySlice[] = [
  {name: '银行', value: 58, label: '58家 · 金融核心', color: '#2563EB'},
  {name: '汽车', value: 34, label: '34家 · 电动转型', color: '#10B981'},
  {name: '能源', value: 32, label: '32家 · 传统底盘', color: '#F97316'},
  {name: '保险', value: 28, label: '28家 · 风险定价', color: '#8B5CF6'},
  {name: '科技', value: 24, label: '24家 · 最高利润弹性', color: '#EC4899'},
  {name: '零售', value: 22, label: '22家 · 消费终端', color: '#EAB308'},
  {name: '电信', value: 16, label: '16家 · 基础设施', color: '#14B8A6'},
  {name: '其他', value: 286, label: '286家 · 多元产业', color: '#64748B'},
];

export const PROFIT_LEADERS: ProfitLeader[] = [
  {nameEn: 'Saudi Aramco', nameZh: '沙特阿美', profit: 120903, color: '#EAB308'},
  {nameEn: 'Apple', nameZh: '苹果', profit: 93736, color: '#64748B'},
  {nameEn: 'Berkshire Hathaway', nameZh: '伯克希尔', profit: 96223, color: '#D97706'},
  {nameEn: 'Alphabet', nameZh: '谷歌母公司', profit: 73795, color: '#2563EB'},
];

export function formatRevenue(v: number): string {
  return (v / 1000).toFixed(0) + 'B';
}

export function formatProfit(v: number): string {
  return (v / 1000).toFixed(1) + 'B$';
}

export const FPS = 30;
export const TOTAL_SECONDS = 29;
export const DURATION_IN_FRAMES = TOTAL_SECONDS * FPS; // 870

/** Scene windows in frames (mirrors the GSAP timeline in index.html). */
export const SCENES = [
  {id: 'scene-intro', start: 0, end: 150},
  {id: 'scene-topbars', start: 120, end: 330},
  {id: 'scene-country', start: 300, end: 500},
  {id: 'scene-industry', start: 470, end: 650},
  {id: 'scene-profit', start: 620, end: 780},
  {id: 'scene-outro', start: 748, end: 870},
] as const;

export const MAX_REVENUE = COMPANIES[0].revenue;
export const MAX_COUNTRY = Math.max(...COUNTRY_COUNTS.map((c) => c.count));
export const MAX_INDUSTRY = Math.max(...INDUSTRY_MIX.map((i) => i.value));
export const COUNTRY_TOTAL = COUNTRY_COUNTS.reduce((s, c) => s + c.count, 0);
export const DOT_COUNT = 50;
