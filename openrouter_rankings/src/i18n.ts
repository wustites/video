import {DATA} from './data';

export type Locale = 'en' | 'zh';

const PROVIDER_ZH: Record<string, string> = {
  DeepSeek: 'DeepSeek',
  Tencent: '腾讯',
  OpenAI: 'OpenAI',
  Google: 'Google',
  Anthropic: 'Anthropic',
  'Z AI': '智谱 AI',
  Xiaomi: '小米',
  MiniMax: 'MiniMax',
  'Moonshot AI': '月之暗面',
  StepFun: '阶跃星辰',
  NVIDIA: 'NVIDIA',
  Poolside: 'Poolside',
  Meta: 'Meta',
  xAI: 'xAI',
  'Inclusion AI': 'Inclusion AI',
  Mistral: 'Mistral',
  Cohere: 'Cohere',
  Other: '其他',
};

export const zhName = (name: string): string => PROVIDER_ZH[name] ?? name;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function fmtDate(iso: string, locale: Locale): string {
  if (locale === 'zh') {
    return iso.replace(/-/g, '.');
  }
  const [y, m, d] = iso.split('-');
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

export interface Insight {
  text: string;
  sub: string;
  color: string;
  ic: string;
}

export function getInsights(locale: Locale): Insight[] {
  if (locale === 'zh') {
    return [
      {
        text: `Top 10 中有 ${DATA.cnCount} 个是中国模型`,
        sub: `${DATA.cnProviders.map(zhName).slice(0, 3).join('、')}${DATA.cnProviders.length > 3 ? ' 等' : ''}`,
        color: '#F43F5E',
        ic: '中',
      },
      {
        text: `${DATA.topModel} 达 ${DATA.topTokens} 万亿`,
        sub: DATA.leaderGap ? '超过第二名与第三名之和' : '领跑榜单使用量',
        color: '#3B82F6',
        ic: '1',
      },
      {
        text: `${DATA.topGrowth.model} 涨幅最大`,
        sub: `${DATA.topGrowth.growth >= 0 ? '+' : ''}${DATA.topGrowth.growth}% 环比上期`,
        color: '#10B981',
        ic: '↑',
      },
      {
        text: '数据来源 openrouter.ai/rankings',
        sub: `使用量快照 · ${fmtDate(DATA.dateRange.end, 'zh')}`,
        color: '#8B5CF6',
        ic: 'ℹ',
      },
    ];
  }
  return [
    {
      text: `${DATA.cnCount} of the Top 10 are Chinese models`,
      sub: `${DATA.cnProviders.slice(0, 3).join(', ')}${DATA.cnProviders.length > 3 ? ' and more' : ''}`,
      color: '#F43F5E',
      ic: 'CN',
    },
    {
      text: `${DATA.topModel}: ${DATA.topTokens}T tokens`,
      sub: DATA.leaderGap ? 'more than the next two models combined' : 'leads weekly token usage',
      color: '#3B82F6',
      ic: '1',
    },
    {
      text: `${DATA.topGrowth.model} rose the fastest`,
      sub: `${DATA.topGrowth.growth >= 0 ? '+' : ''}${DATA.topGrowth.growth}% day-over-day`,
      color: '#10B981',
      ic: '↑',
    },
    {
      text: 'Data: openrouter.ai/rankings',
      sub: `usage snapshot, ${fmtDate(DATA.dateRange.end, 'en')}`,
      color: '#8B5CF6',
      ic: 'ℹ',
    },
  ];
}

export interface Copy {
  kickerIntro: string;
  introTitleA: string;
  introTitleB: string;
  introDesc: string;
  chipWeek: string;
  metricTotalLabel: string;
  metricTotalUnit: string;
  metricTotalSub: string;
  metricTopLabel: string;
  metricTopSub: string;
  metricRiserLabel: string;
  metricRiserSub: string;
  kickerRanking: string;
  rankTitleB: string;
  rankSubPrefix: string;
  rankSubSuffix: string;
  cnChip: string;
  usChip: string;
  tokenUnit: string;
  kickerProviders: string;
  provSub: string;
  donutLabel: string;
  provFooterA: string;
  provFooterB: string;
  kickerGrowth: string;
  growthTitleA: string;
  growthTitleB: string;
  growthSub: string;
  kickerOutro: string;
  outroTitleA: string;
  outroTitleB: string;
}

export function getCopy(locale: Locale): Copy {
  const date = fmtDate(DATA.dateRange.end, locale);
  if (locale === 'zh') {
    return {
      kickerIntro: 'OpenRouter 本周排名',
      introTitleA: '本周',
      introTitleB: '热门 AI 模型',
      introDesc: '来自数百万开发者通过 OpenRouter 调度大模型流量的真实使用数据。',
      chipWeek: `${date} 快照`,
      metricTotalLabel: '榜单 Token 总量',
      metricTotalUnit: '万亿',
      metricTotalSub: 'OpenRouter 全部模型一周用量',
      metricTopLabel: '最热门模型',
      metricTopSub: `${DATA.topTokens} 万亿 Token · 榜单第一`,
      metricRiserLabel: '增长最快',
      metricRiserSub: '环比上周 Token 变化',
      kickerRanking: 'Token 使用量 Top 10',
      rankTitleB: `以 ${DATA.topTokens} 万亿领跑`,
      rankSubPrefix: 'OpenRouter 本周 Token 使用量 · ',
      rankSubSuffix: ' = 模型所属国家',
      cnChip: '中',
      usChip: '美',
      tokenUnit: '万亿',
      kickerProviders: '供应商分布',
      provSub: '各模型供应商在 OpenRouter 的 Token 占比',
      donutLabel: '榜单 Token 总量',
      provFooterA: 'Top 6 供应商合计占',
      provFooterB: '',
      kickerGrowth: '增长最快',
      growthTitleA: '这些模型',
      growthTitleB: '涨幅最大',
      growthSub: 'Top 20 模型环比 Token 增长',
      kickerOutro: '核心发现',
      outroTitleA: '排名格局',
      outroTitleB: '正在洗牌。',
    };
  }
  return {
    kickerIntro: 'OpenRouter Weekly Rankings',
    introTitleA: "This Week's",
    introTitleB: 'Top AI Models',
    introDesc: 'Real usage from millions of developers routing LLM traffic through OpenRouter.',
    chipWeek: `Snapshot · ${date}`,
    metricTotalLabel: 'Weekly Tokens',
    metricTotalUnit: 'Trillion',
    metricTotalSub: 'across all models on OpenRouter',
    metricTopLabel: 'Top Model',
    metricTopSub: `${DATA.topTokens}T tokens · #1 of the week`,
    metricRiserLabel: 'Fastest Riser',
    metricRiserSub: 'vs previous snapshot',
    kickerRanking: 'Top 10 by Token Usage',
    rankTitleB: `Leads with ${DATA.topTokens}T`,
    rankSubPrefix: 'Weekly token usage across OpenRouter · ',
    rankSubSuffix: ' = model origin',
    cnChip: 'CN',
    usChip: 'US',
    tokenUnit: 'T',
    kickerProviders: 'Provider Distribution',
    provSub: 'Share of weekly tokens by model provider across OpenRouter',
    donutLabel: 'ranked tokens',
    provFooterA: 'Top 6 providers',
    provFooterB: 'of weekly tokens',
    kickerGrowth: 'Fastest Risers',
    growthTitleA: 'These Models',
    growthTitleB: 'Gained the Most',
    growthSub: 'Day-over-day token growth in the Top 20',
    kickerOutro: 'Key Insights',
    outroTitleA: 'The rankings',
    outroTitleB: 'are shifting.',
  };
}

export const displayProvider = (name: string, locale: Locale): string =>
  locale === 'zh' ? zhName(name) : name;
