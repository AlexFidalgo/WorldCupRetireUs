export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type BestOddResponse = {
  team: string;
  best_platform: string;
  best_odd: number;
  market: string;
};

export type ScenarioRow = {
  team: string;
  odds: Record<string, number>;
  best_company: string | null;
  best_odd: number;
  weight: number;
  bet_amount: number;
  gross_return: number;
  net_result: number;
};

export type ScenarioCalculateResponse = {
  base_amount: number;
  total_bet: number;
  rows: ScenarioRow[];
};

export type ScenarioCalculateFromOddsRequest = {
  name?: string;
  teams: string[];
  bet_weights: Record<string, number>;
  base_amount: number;
  market: string;
};

export type ScenarioSaveResponse = {
  id: number;
  name: string;
  base_amount: number;
  total_bet: number;
  data: Record<string, unknown>;
};

export type UserResponse = {
  id: number;
  username: string;
};