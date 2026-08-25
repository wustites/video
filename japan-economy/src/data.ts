export type MetricId = 'house' | 'unemployment' | 'yen' | 'births' | 'gdp' | 'nikkei';

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
    label: '住宅地価格指数',
    shortLabel: '住宅価格',
    unit: '1985 = 100',
    color: '#ff6b4a',
    values: [100, 124, 160, 141, 95, 78, 67, 61, 58, 59, 57, 54, 55, 58, 64, 67, 72, 75, 78, 80],
    min: 45,
    max: 175,
    formatter: (value) => `${Math.round(value)}`,
  },
  {
    id: 'unemployment',
    label: '失業率',
    shortLabel: '失業率',
    unit: '%',
    color: '#f6c85f',
    values: [2.6, 2.5, 2.1, 2.1, 3.2, 3.4, 4.7, 5.4, 4.4, 4.0, 5.1, 4.6, 4.0, 3.4, 2.4, 2.8, 2.6, 2.5, 2.5, 2.4],
    min: 1.5,
    max: 6,
    formatter: one,
  },
  {
    id: 'yen',
    label: 'ドル円・年平均レート',
    shortLabel: '為替',
    unit: '円 / USD',
    color: '#62d7c2',
    values: [238, 128, 145, 135, 94, 121, 108, 125, 110, 103, 94, 79, 97, 121, 109, 107, 131, 151, 149, 150],
    min: 65,
    max: 255,
    formatter: (value) => `${Math.round(value)}`,
  },
  {
    id: 'births',
    label: '出生数',
    shortLabel: '出生数',
    unit: '百万人',
    color: '#c29bff',
    values: [1.431, 1.314, 1.221, 1.223, 1.187, 1.191, 1.191, 1.154, 1.063, 1.092, 1.070, 1.050, 1.029, 1.006, 0.865, 0.840, 0.771, 0.686, 0.660, 0.640],
    min: 0.5,
    max: 1.55,
    formatter: (value) => value.toFixed(2),
  },
  {
    id: 'gdp',
    label: '名目 GDP',
    shortLabel: 'GDP',
    unit: '兆ドル',
    color: '#5ea7ff',
    values: [1.40, 2.90, 3.10, 3.65, 5.45, 4.42, 4.97, 4.18, 4.83, 5.04, 5.23, 6.16, 5.16, 4.44, 5.12, 5.05, 4.26, 4.21, 4.35, 4.50],
    min: 0.8,
    max: 6.6,
    formatter: (value) => value.toFixed(1),
  },
  {
    id: 'nikkei',
    label: '日経平均株価',
    shortLabel: '日経平均',
    unit: '年末値 / 円',
    color: '#f29a5b',
    values: [13083, 30159, 23848, 22983, 19868, 15259, 13785, 8579, 16111, 8859, 10546, 8455, 16291, 19033, 23656, 27444, 26094, 39895, 50500, 55000],
    min: 5000,
    max: 58000,
    formatter: (value) => `${Math.round(value).toLocaleString('ja-JP')}`,
  },
];

export const EVENTS = [
  {year: 1985, title: 'プラザ合意', note: '円高が急速に進行', color: '#62d7c2'},
  {year: 1991, title: 'バブル崩壊', note: '資産価格の転換点', color: '#ff6b4a'},
  {year: 1997, title: 'アジア通貨危機', note: '消費税引き上げ', color: '#f6c85f'},
  {year: 2008, title: '世界金融危機', note: '輸出と GDP が減速', color: '#5ea7ff'},
  {year: 2011, title: '東日本大震災', note: '復興とエネルギー危機', color: '#c29bff'},
  {year: 2013, title: 'アベノミクス', note: '金融緩和と再インフレ', color: '#62d7c2'},
  {year: 2020, title: '新型コロナ', note: '経済が一時縮小', color: '#5ea7ff'},
  {year: 2022, title: '円安の進行', note: '輸入インフレ', color: '#ff6b4a'},
  {year: 2024, title: '出生数が過去最少', note: '人口圧力が加速', color: '#c29bff'},
];

export const SOURCES = [
  '総務省統計局：労働・人口・国民経済統計',
  '厚生労働省「人口動態統計」',
  '国土交通省：地価公示・不動産価格指数',
  'World Bank / FRED：GDP・ドル円レート',
  '日本取引所グループ / 日本経済新聞社：日経平均株価',
];
