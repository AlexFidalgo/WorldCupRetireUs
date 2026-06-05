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

/** Used when saving a scenario with manually overridden odds (POST /scenarios/save). */
export type ScenarioSaveWithOddsRequest = {
  name?: string;
  teams: string[];
  odds: Record<string, Record<string, number>>;
  bet_weights: Record<string, number>;
  base_amount: number;
};

/** Extended payload that forms pass to onSave — includes explicit_odds when manual overrides are active. */
export type ScenarioSavePayload = ScenarioCalculateFromOddsRequest & {
  explicit_odds?: Record<string, Record<string, number>>;
};

export type ScenarioSaveResponse = {
  id: number;
  name: string;
  base_amount: number;
  total_bet: number;
  data: Record<string, unknown>;
};

export type ScenarioPublicResponse = {
  id: number;
  name: string;
  base_amount: number;
  total_bet: number;
  data: {
    base_amount: number;
    total_bet: number;
    rows: ScenarioRow[];
  };
  user_id: number;
  username: string;
};

export type UserResponse = {
  id: number;
  username: string;
};