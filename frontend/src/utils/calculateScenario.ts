import type { BestOddResponse, ScenarioCalculateResponse } from "../types/api";

export function calculateLocally(
  teams: string[],
  weights: Record<string, number>,
  baseAmount: number,
  bestOdds: BestOddResponse[],
): ScenarioCalculateResponse | null {
  if (teams.length === 0 || baseAmount <= 0) return null;

  const oddMap = Object.fromEntries(bestOdds.map((o) => [o.team, o.best_odd]));
  const platformMap = Object.fromEntries(bestOdds.map((o) => [o.team, o.best_platform]));

  const rows = teams.map((team) => {
    const weight = weights[team] ?? 0;
    const best_odd = oddMap[team] ?? 0;
    const bet_amount = baseAmount * weight;
    const gross_return = bet_amount * best_odd;
    return {
      team,
      odds: {},
      best_company: platformMap[team] ?? null,
      best_odd,
      weight,
      bet_amount,
      gross_return,
      net_result: 0,
    };
  });

  const total_bet = rows.reduce((sum, r) => sum + r.bet_amount, 0);

  return {
    base_amount: baseAmount,
    total_bet,
    rows: rows.map((r) => ({ ...r, net_result: r.gross_return - total_bet })),
  };
}
