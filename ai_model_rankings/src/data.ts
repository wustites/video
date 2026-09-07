// Snapshot of public/data.js (fetched 2026-08-16T16:57:09.047Z from
// https://artificialanalysis.ai/leaderboards/models). Static import so
// renders never fetch at render time. Refresh via `npm run setup`.
export type ModelEntry = {
  rank: number;
  name: string;
  providerKey: string;
  providerLabel: string;
  score: number;
  speed: number | null;
  color: string;
};

export type ScatterPoint = ModelEntry & {inTop15: boolean};

export type ProviderCount = {
  providerKey: string;
  label: string;
  count: number;
  color: string;
};

export type InsightCard = {name: string; value: string; color: string};

export const SOURCE = 'https://artificialanalysis.ai/leaderboards/models';
export const FETCHED_AT = '2026-08-16T16:57:09.047Z';
export const TOTAL_EVALUATED = 110;

export const METRICS = {
  totalModels: '110+',
  topModel: 'Claude Opus 5 (max)',
  topScore: 63,
  fastestModel: 'Mercury 2',
  fastestSpeed: 940,
};

export const MODELS: ModelEntry[] = [
  {rank: 1, name: 'Claude Opus 5 (max)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 63, speed: 57, color: '#D97706'},
  {rank: 2, name: 'Claude Opus 5 (xhigh)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 63, speed: 57, color: '#D97706'},
  {rank: 3, name: 'Claude Fable 5 (with fallback)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 62, speed: 68, color: '#D97706'},
  {rank: 4, name: 'GPT-5.6 Sol (max)', providerKey: 'openai', providerLabel: 'OpenAI', score: 61, speed: 74, color: '#10B981'},
  {rank: 5, name: 'Grok 4.6 (high)', providerKey: 'xai', providerLabel: 'SpaceXAI', score: 61, speed: 61, color: '#A855F7'},
  {rank: 6, name: 'Claude Opus 5 (high)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 61, speed: 58, color: '#D97706'},
  {rank: 7, name: 'Kimi K3 (max)', providerKey: 'kimi', providerLabel: 'Kimi', score: 60, speed: 39, color: '#EF4444'},
  {rank: 8, name: 'GPT-5.6 Sol (xhigh)', providerKey: 'openai', providerLabel: 'OpenAI', score: 59, speed: 69, color: '#10B981'},
  {rank: 9, name: 'Claude Opus 5 (medium)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 59, speed: 58, color: '#D97706'},
  {rank: 10, name: 'Qwen3.8 2.4T A95B', providerKey: 'alibaba', providerLabel: 'Alibaba', score: 58, speed: 48, color: '#EC4899'},
  {rank: 11, name: 'Qwen3.8 Max', providerKey: 'alibaba', providerLabel: 'Alibaba', score: 58, speed: 47, color: '#EC4899'},
  {rank: 12, name: 'GPT-5.6 Terra (max)', providerKey: 'openai', providerLabel: 'OpenAI', score: 57, speed: 122, color: '#10B981'},
  {rank: 13, name: 'GPT-5.6 Sol (high)', providerKey: 'openai', providerLabel: 'OpenAI', score: 57, speed: 70, color: '#10B981'},
  {rank: 14, name: 'Muse Spark 1.2 (xhigh)', providerKey: 'meta', providerLabel: 'Meta', score: 57, speed: null, color: '#6366F1'},
  {rank: 15, name: 'GPT-5.6 Sol (medium)', providerKey: 'openai', providerLabel: 'OpenAI', score: 56, speed: 67, color: '#10B981'},
];

export const SCATTER_POINTS: ScatterPoint[] = [
  {name: 'Claude Opus 5 (max)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 63, speed: 57, color: '#D97706', inTop15: true, rank: 1},
  {name: 'Claude Opus 5 (xhigh)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 63, speed: 57, color: '#D97706', inTop15: true, rank: 2},
  {name: 'Claude Fable 5 (with fallback)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 62, speed: 68, color: '#D97706', inTop15: true, rank: 3},
  {name: 'GPT-5.6 Sol (max)', providerKey: 'openai', providerLabel: 'OpenAI', score: 61, speed: 74, color: '#10B981', inTop15: true, rank: 4},
  {name: 'Grok 4.6 (high)', providerKey: 'xai', providerLabel: 'SpaceXAI', score: 61, speed: 61, color: '#A855F7', inTop15: true, rank: 5},
  {name: 'Claude Opus 5 (high)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 61, speed: 58, color: '#D97706', inTop15: true, rank: 6},
  {name: 'Kimi K3 (max)', providerKey: 'kimi', providerLabel: 'Kimi', score: 60, speed: 39, color: '#EF4444', inTop15: true, rank: 7},
  {name: 'GPT-5.6 Sol (xhigh)', providerKey: 'openai', providerLabel: 'OpenAI', score: 59, speed: 69, color: '#10B981', inTop15: true, rank: 8},
  {name: 'Claude Opus 5 (medium)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 59, speed: 58, color: '#D97706', inTop15: true, rank: 9},
  {name: 'Qwen3.8 2.4T A95B', providerKey: 'alibaba', providerLabel: 'Alibaba', score: 58, speed: 48, color: '#EC4899', inTop15: true, rank: 10},
  {name: 'Qwen3.8 Max', providerKey: 'alibaba', providerLabel: 'Alibaba', score: 58, speed: 47, color: '#EC4899', inTop15: true, rank: 11},
  {name: 'GPT-5.6 Terra (max)', providerKey: 'openai', providerLabel: 'OpenAI', score: 57, speed: 122, color: '#10B981', inTop15: true, rank: 12},
  {name: 'GPT-5.6 Sol (high)', providerKey: 'openai', providerLabel: 'OpenAI', score: 57, speed: 70, color: '#10B981', inTop15: true, rank: 13},
  {name: 'GPT-5.6 Sol (medium)', providerKey: 'openai', providerLabel: 'OpenAI', score: 56, speed: 67, color: '#10B981', inTop15: true, rank: 15},
  {name: 'Grok 4.5 (high)', providerKey: 'xai', providerLabel: 'SpaceXAI', score: 56, speed: 66, color: '#A855F7', inTop15: false, rank: 0},
  {name: 'Claude Sonnet 5 (max)', providerKey: 'anthropic', providerLabel: 'Anthropic', score: 55, speed: 69, color: '#D97706', inTop15: false, rank: 0},
];

export const PROVIDER_COUNTS: ProviderCount[] = [
  {providerKey: 'anthropic', label: 'Anthropic', count: 6, color: '#D97706'},
  {providerKey: 'openai', label: 'OpenAI', count: 6, color: '#10B981'},
  {providerKey: 'xai', label: 'SpaceXAI', count: 2, color: '#A855F7'},
  {providerKey: 'alibaba', label: 'Alibaba', count: 2, color: '#EC4899'},
  {providerKey: 'kimi', label: 'Kimi', count: 1, color: '#EF4444'},
  {providerKey: 'meta', label: 'Meta', count: 1, color: '#6366F1'},
  {providerKey: 'google', label: 'Google', count: 1, color: '#3B82F6'},
  {providerKey: 'zai', label: 'Z AI', count: 1, color: '#8B5CF6'},
];

export const TIER_COUNTS: number[] = [7, 23, 19, 61];

export const CARDS: InsightCard[] = [
  {name: 'Claude Opus 5 (max)', value: '63 index', color: '#D97706'},
  {name: 'Mercury 2', value: '940 tok/s', color: '#FB7185'},
  {name: 'GPT-5.6 Terra (max)', value: '57 · 122', color: '#10B981'},
  {name: 'GLM-5.2 (max)', value: '53 · 136', color: '#8B5CF6'},
];
