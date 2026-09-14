// Updated by npm run setup; bundled locally without render-time network requests.
import snapshot from './snapshot.json';

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

export const SOURCE = snapshot.source;
export const FETCHED_AT = snapshot.fetchedAt;
export const TOTAL_EVALUATED = snapshot.totalEvaluated;
export const METRICS = snapshot.metrics;
export const MODELS: ModelEntry[] = snapshot.models;
export const SCATTER_POINTS: ScatterPoint[] = snapshot.scatterPoints.map((point) => ({
  ...point,
  rank: MODELS.find((model) => model.name === point.name)?.rank ?? 0,
}));
export const PROVIDER_COUNTS: ProviderCount[] = snapshot.providerCounts;
export const TIER_COUNTS: number[] = snapshot.tierCounts;
export const CARDS: InsightCard[] = snapshot.cards;
