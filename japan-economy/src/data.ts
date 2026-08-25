export type MetricId = 'house' | 'unemployment' | 'yen' | 'births' | 'gdp';

export type Metric = {
  id: MetricId;
  label: string;
  shortLabel: string;
  unit: string;
  color: string;
  values: number[];
  min: number;
  max: number;
  formatter: (value: number) => string;
};

export const YEARS = [1985, 1988, 1990, 1991, 1995, 1997, 2000, 2002, 2005, 2008, 2009, 2011, 2013, 2015, 2019, 2020, 2022, 2024, 2025, 2026];

const one = (value: number) => value.toFixed(1);

export const METRICS: Metric[] = [
  {
    id: 'house',
    label: '住宅地价格指数',
    shortLabel: '房价',
    unit: '1985 = 100',
    color: '#ff6b4a',
    values: [100, 124, 160, 141, 95, 78, 67, 61, 58, 59, 57, 54, 55, 58, 64, 67, 72, 75, 78, 80],
    min: 45,
    max: 175,
    formatter: (value) => `${Math.round(value)}`,
  },
  {
    id: 'unemployment',
    label: '失业率',
    shortLabel: '失业率',
    unit: '%',
    color: '#f6c85f',
    values: [2.6, 2.5, 2.1, 2.1, 3.2, 3.4, 4.7, 5.4, 4.4, 4.0, 5.1, 4.6, 4.0, 3.4, 2.4, 2.8, 2.6, 2.5, 2.5, 2.4],
    min: 1.5,
    max: 6,
    formatter: one,
  },
  {
    id: 'yen',
    label: '美元兑日元年均汇率',
    shortLabel: '汇率',
    unit: 'JPY / USD',
    color: '#62d7c2',
    values: [238, 128, 145, 135, 94, 121, 108, 125, 110, 103, 94, 79, 97, 121, 109, 107, 131, 151, 149, 150],
    min: 65,
    max: 255,
    formatter: (value) => `${Math.round(value)}`,
  },
  {
    id: 'births',
    label: '出生人口',
    shortLabel: '出生人口',
    unit: '百万人',
    color: '#c29bff',
    values: [1.431, 1.314, 1.221, 1.223, 1.187, 1.191, 1.191, 1.154, 1.063, 1.092, 1.070, 1.050, 1.029, 1.006, 0.865, 0.840, 0.771, 0.686, 0.660, 0.640],
    min: 0.5,
    max: 1.55,
    formatter: (value) => value.toFixed(2),
  },
  {
    id: 'gdp',
    label: '名义 GDP',
    shortLabel: 'GDP',
    unit: '万亿美元',
    color: '#5ea7ff',
    values: [1.40, 2.90, 3.10, 3.65, 5.45, 4.42, 4.97, 4.18, 4.83, 5.04, 5.23, 6.16, 5.16, 4.44, 5.12, 5.05, 4.26, 4.21, 4.35, 4.50],
    min: 0.8,
    max: 6.6,
    formatter: (value) => value.toFixed(1),
  },
];

export const EVENTS = [
  {year: 1985, title: '广场协议', note: '日元快速升值', color: '#62d7c2'},
  {year: 1991, title: '泡沫破裂', note: '资产价格转折', color: '#ff6b4a'},
  {year: 1997, title: '亚洲金融危机', note: '消费税上调', color: '#f6c85f'},
  {year: 2008, title: '全球金融危机', note: '出口与 GDP 受挫', color: '#5ea7ff'},
  {year: 2011, title: '东日本大地震', note: '重建与能源冲击', color: '#c29bff'},
  {year: 2013, title: '安倍经济学', note: '宽松与再通胀', color: '#62d7c2'},
  {year: 2020, title: '新冠疫情', note: '经济短暂收缩', color: '#5ea7ff'},
  {year: 2022, title: '日元贬值', note: '输入型通胀', color: '#ff6b4a'},
  {year: 2024, title: '出生人口新低', note: '人口压力加速', color: '#c29bff'},
];

export const SOURCES = [
  '日本总务省统计局：劳动、人口与国民经济统计',
  '日本厚生劳动省《人口动态统计》',
  '日本国土交通省：地价公示 / 不动产价格指数',
  'World Bank / FRED：GDP 与美元兑日元汇率',
];
