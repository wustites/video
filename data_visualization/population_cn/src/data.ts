export type ProvinceValue = {p: string; b: number};

export type YearData = {year: number; data: ProvinceValue[]};

export const populationData: YearData[] = [
  { year: 2000, data: [
    {p:"广东",b:108},{p:"河南",b:113},{p:"山东",b:110},{p:"四川",b:85},{p:"河北",b:78},
    {p:"湖南",b:74},{p:"安徽",b:72},{p:"江苏",b:68},{p:"湖北",b:65},{p:"广西",b:62},
    {p:"浙江",b:52},{p:"云南",b:55},{p:"贵州",b:50},{p:"江西",b:58},{p:"福建",b:42},
    {p:"陕西",b:40},{p:"重庆",b:32},{p:"辽宁",b:38},{p:"黑龙江",b:35},{p:"山西",b:36},
    {p:"甘肃",b:30},{p:"吉林",b:28},{p:"内蒙古",b:24},{p:"新疆",b:28},{p:"上海",b:9},
    {p:"北京",b:8},{p:"天津",b:8},{p:"海南",b:10},{p:"宁夏",b:9},{p:"青海",b:8},{p:"西藏",b:5}
  ]},
  { year: 2005, data: [
    {p:"广东",b:112},{p:"河南",b:105},{p:"山东",b:108},{p:"四川",b:78},{p:"河北",b:75},
    {p:"湖南",b:70},{p:"安徽",b:68},{p:"江苏",b:72},{p:"湖北",b:58},{p:"广西",b:60},
    {p:"浙江",b:55},{p:"云南",b:52},{p:"贵州",b:48},{p:"江西",b:55},{p:"福建",b:45},
    {p:"陕西",b:38},{p:"重庆",b:28},{p:"辽宁",b:32},{p:"黑龙江",b:30},{p:"山西",b:35},
    {p:"甘肃",b:28},{p:"吉林",b:25},{p:"内蒙古",b:22},{p:"新疆",b:30},{p:"上海",b:10},
    {p:"北京",b:12},{p:"天津",b:8},{p:"海南",b:10},{p:"宁夏",b:9},{p:"青海",b:7},{p:"西藏",b:5}
  ]},
  { year: 2010, data: [
    {p:"广东",b:118},{p:"河南",b:100},{p:"山东",b:112},{p:"四川",b:72},{p:"河北",b:82},
    {p:"湖南",b:68},{p:"安徽",b:70},{p:"江苏",b:78},{p:"湖北",b:55},{p:"广西",b:58},
    {p:"浙江",b:58},{p:"云南",b:50},{p:"贵州",b:45},{p:"江西",b:52},{p:"福建",b:48},
    {p:"陕西",b:36},{p:"重庆",b:26},{p:"辽宁",b:28},{p:"黑龙江",b:25},{p:"山西",b:38},
    {p:"甘肃",b:26},{p:"吉林",b:22},{p:"内蒙古",b:20},{p:"新疆",b:32},{p:"上海",b:16},
    {p:"北京",b:18},{p:"天津",b:10},{p:"海南",b:11},{p:"宁夏",b:10},{p:"青海",b:7},{p:"西藏",b:5}
  ]},
  { year: 2015, data: [
    {p:"广东",b:145},{p:"河南",b:135},{p:"山东",b:125},{p:"四川",b:82},{p:"河北",b:88},
    {p:"湖南",b:78},{p:"安徽",b:80},{p:"江苏",b:82},{p:"湖北",b:68},{p:"广西",b:65},
    {p:"浙江",b:62},{p:"云南",b:58},{p:"贵州",b:52},{p:"江西",b:60},{p:"福建",b:52},
    {p:"陕西",b:42},{p:"重庆",b:32},{p:"辽宁",b:30},{p:"黑龙江",b:28},{p:"山西",b:42},
    {p:"甘肃",b:30},{p:"吉林",b:22},{p:"内蒙古",b:22},{p:"新疆",b:35},{p:"上海",b:20},
    {p:"北京",b:22},{p:"天津",b:12},{p:"海南",b:14},{p:"宁夏",b:12},{p:"青海",b:8},{p:"西藏",b:6}
  ]},
  { year: 2020, data: [
    {p:"广东",b:132},{p:"河南",b:82},{p:"山东",b:72},{p:"四川",b:60},{p:"河北",b:58},
    {p:"湖南",b:52},{p:"安徽",b:52},{p:"江苏",b:58},{p:"湖北",b:42},{p:"广西",b:48},
    {p:"浙江",b:48},{p:"云南",b:45},{p:"贵州",b:42},{p:"江西",b:42},{p:"福建",b:38},
    {p:"陕西",b:32},{p:"重庆",b:25},{p:"辽宁",b:22},{p:"黑龙江",b:18},{p:"山西",b:28},
    {p:"甘肃",b:22},{p:"吉林",b:15},{p:"内蒙古",b:16},{p:"新疆",b:28},{p:"上海",b:15},
    {p:"北京",b:14},{p:"天津",b:8},{p:"海南",b:10},{p:"宁夏",b:8},{p:"青海",b:6},{p:"西藏",b:5}
  ]},
  { year: 2023, data: [
    {p:"广东",b:103},{p:"河南",b:62},{p:"山东",b:55},{p:"四川",b:48},{p:"河北",b:42},
    {p:"湖南",b:38},{p:"安徽",b:38},{p:"江苏",b:45},{p:"湖北",b:32},{p:"广西",b:38},
    {p:"浙江",b:42},{p:"云南",b:38},{p:"贵州",b:35},{p:"江西",b:32},{p:"福建",b:32},
    {p:"陕西",b:25},{p:"重庆",b:20},{p:"辽宁",b:18},{p:"黑龙江",b:12},{p:"山西",b:22},
    {p:"甘肃",b:18},{p:"吉林",b:10},{p:"内蒙古",b:12},{p:"新疆",b:22},{p:"上海",b:12},
    {p:"北京",b:12},{p:"天津",b:6},{p:"海南",b:8},{p:"宁夏",b:6},{p:"青海",b:5},{p:"西藏",b:4}
  ]}
];

export const regionColors: Record<string, string> = {
  "广东":"#e6194b","河南":"#3cb44b","山东":"#4363d8","四川":"#f58231","河北":"#911eb4",
  "湖南":"#42d4f4","安徽":"#f032e6","江苏":"#bfef45","湖北":"#fabed4","广西":"#469990",
  "浙江":"#dcbeff","云南":"#9A6324","贵州":"#fffac8","江西":"#800000","福建":"#aaffc3",
  "陕西":"#808000","重庆":"#ffd8b1","辽宁":"#000075","黑龙江":"#a9a9a9","山西":"#e6beff",
  "甘肃":"#aa6e28","吉林":"#808080","内蒙古":"#ffe119","新疆":"#000000","上海":"#ffffff",
  "北京":"#fabebe","天津":"#000000","海南":"#000000","宁夏":"#000000","青海":"#000000","西藏":"#000000"
};

export const TOP_N = 15;
export const START_YEAR = 2000;
export const END_YEAR = 2023;
export const DURATION_SECONDS = 40;
export const FPS = 30;
export const TOTAL_FRAMES = DURATION_SECONDS * FPS;

export const ALL_PROVINCES: string[] = [...new Set(populationData.flatMap((d) => d.data.map((x) => x.p)))];

export function interpolateData(currentYear: number): ProvinceValue[] {
  const years = populationData.map(d => d.year).sort((a, b) => a - b);
  const firstYear = years[0] as number;
  const lastYear = years[years.length - 1] as number;
  const firstData = populationData.find(d => d.year === firstYear)?.data ?? [];
  const lastData = populationData.find(d => d.year === lastYear)?.data ?? [];
  if (currentYear <= firstYear) return [...firstData].sort((a, b) => b.b - a.b).slice(0, TOP_N);
  if (currentYear >= lastYear) return [...lastData].sort((a, b) => b.b - a.b).slice(0, TOP_N);
  let prevYear = firstYear, nextYear = lastYear;
  for (let i = 0; i < years.length - 1; i++) {
    const a = years[i] as number, b = years[i + 1] as number;
    if (currentYear >= a && currentYear <= b) {
      prevYear = a; nextYear = b; break;
    }
  }
  const prevData = populationData.find(d => d.year === prevYear)?.data ?? [];
  const nextData = populationData.find(d => d.year === nextYear)?.data ?? [];
  const t = (currentYear - prevYear) / (nextYear - prevYear);
  const provinces = [...new Set([...prevData.map(d => d.p), ...nextData.map(d => d.p)])];
  return provinces.map(province => {
    const prevVal = prevData.find(d => d.p === province)?.b ?? 0;
    const nextVal = nextData.find(d => d.p === province)?.b ?? 0;
    return { p: province, b: Math.round(prevVal + (nextVal - prevVal) * t) };
  }).sort((a, b) => b.b - a.b).slice(0, TOP_N);
}
