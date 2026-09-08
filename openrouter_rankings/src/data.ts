// Updated by npm run setup; bundled locally without render-time network requests.
import snapshot from './snapshot.json';

export interface RankModel {
  rank: number;
  name: string;
  provider: string;
  country: string;
  tokens: number;
  growth: number;
  color: string;
}

export interface ProviderShare {
  name: string;
  tokens: number;
  pct: number;
  color: string;
}

export interface GrowthModel {
  name: string;
  provider: string;
  growth: number;
  color: string;
}

export interface RankingsData {
  source: string;
  fetchedAt: string;
  dateRange: {start: string; end: string};
  totalTokens: number;
  topModel: string;
  topTokens: number;
  topGrowth: {model: string; provider: string; growth: number};
  cnCount: number;
  cnProviders: string[];
  leaderGap: boolean;
  top6Pct: number;
  models: RankModel[];
  providers: ProviderShare[];
  growthModels: GrowthModel[];
}

export const DATA: RankingsData = snapshot;
