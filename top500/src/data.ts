export type Company = {
  rank: number;
  nameZh: string;
  nameEn: string;
  revenue: number;
  profit: number;
  country: string;
  industry: string;
  color: string;
};

export const companies: Company[] = [
  {
    rank: 1,
    nameZh: '沃尔玛',
    nameEn: 'Walmart',
    revenue: 680985,
    profit: 19436,
    country: '美国',
    industry: '零售',
    color: '#3B82F6',
  },
  {
    rank: 2,
    nameZh: '亚马逊',
    nameEn: 'Amazon',
    revenue: 637959,
    profit: 59248,
    country: '美国',
    industry: '互联网零售',
    color: '#F59E0B',
  },
  {
    rank: 3,
    nameZh: '国家电网',
    nameEn: 'State Grid',
    revenue: 548414.4,
    profit: 10044.9,
    country: '中国',
    industry: '能源',
    color: '#10B981',
  },
  {
    rank: 4,
    nameZh: '沙特阿美',
    nameEn: 'Saudi Aramco',
    revenue: 480193.5,
    profit: 104982.3,
    country: '沙特阿拉伯',
    industry: '石油天然气',
    color: '#14B8A6',
  },
  {
    rank: 5,
    nameZh: '中国石油',
    nameEn: 'CNPC',
    revenue: 412645.3,
    profit: 22424,
    country: '中国',
    industry: '石油',
    color: '#EF4444',
  },
  {
    rank: 6,
    nameZh: '中国石化',
    nameEn: 'Sinopec',
    revenue: 407490.1,
    profit: 8036.4,
    country: '中国',
    industry: '石油化工',
    color: '#F97316',
  },
  {
    rank: 7,
    nameZh: '联合健康',
    nameEn: 'UnitedHealth',
    revenue: 400278,
    profit: 14405,
    country: '美国',
    industry: '医疗健康',
    color: '#06B6D4',
  },
  {
    rank: 8,
    nameZh: '苹果',
    nameEn: 'Apple',
    revenue: 391035,
    profit: 93736,
    country: '美国',
    industry: '科技',
    color: '#A855F7',
  },
  {
    rank: 9,
    nameZh: 'CVS Health',
    nameEn: 'CVS Health',
    revenue: 372809,
    profit: 4614,
    country: '美国',
    industry: '医疗健康',
    color: '#E11D48',
  },
  {
    rank: 10,
    nameZh: '伯克希尔',
    nameEn: 'Berkshire Hathaway',
    revenue: 371433,
    profit: 88995,
    country: '美国',
    industry: '投资保险',
    color: '#64748B',
  },
];

export const countryCounts = [
  {country: '美国', count: 138, revenueShare: 35, color: '#3B82F6'},
  {country: '中国', count: 130, revenueShare: 26, color: '#EF4444'},
  {country: '日本', count: 38, revenueShare: 6, color: '#F59E0B'},
  {country: '其他国家和地区', count: 194, revenueShare: 33, color: '#94A3B8'},
];

export const industryMix = [
  {name: '金融', value: 94, label: '9.4万亿美元', color: '#2563EB'},
  {name: '能源', value: 78, label: '高收入核心', color: '#10B981'},
  {name: '汽车及零部件', value: 52, label: '制造业支柱', color: '#F97316'},
  {name: '科技', value: 34, label: '34家公司', color: '#8B5CF6'},
  {name: '医疗健康', value: 42, label: '稳定扩张', color: '#EC4899'},
];

export const facts = {
  totalRevenue: 41.7,
  totalEmployees: 70.14,
  chinaCompanies: 130,
  usCompanies: 138,
  femaleCeo: 32,
  stateOwned: 107,
};

export const formatRevenue = (value: number) => `$${(value / 1000).toFixed(1)}B`;
export const formatProfit = (value: number) => `$${(value / 1000).toFixed(1)}B`;
