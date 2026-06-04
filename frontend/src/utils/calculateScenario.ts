import type { BestOddResponse, ScenarioCalculateResponse } from "../types/api";

/**
 * Given a desired net_result for a team, return the weight (or amount for
 * valor-direto where base=1) that achieves it, or null if unsolvable.
 *
 * net = base × w × odd − base × (w + sumOther)
 *     = base × w × (odd − 1) − base × sumOther
 * → w = (target/base + sumOther) / (odd − 1)
 */
export function solveForWeight(
  targetNet: number,
  baseAmount: number,
  odd: number,
  sumOtherWeights: number,
): number | null {
  if (odd <= 1) return null; // indeterminate
  const w = (targetNet / baseAmount + sumOtherWeights) / (odd - 1);
  return w >= 0 ? w : null; // negative weight is meaningless
}

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
