import type { ScenarioCalculateResponse } from "../types/api";

const TEAM_FLAGS: Record<string, string> = {
  brasil: "🇧🇷",
  argentina: "🇦🇷",
  alemanha: "🇩🇪",
  espanha: "🇪🇸",
  inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  franca: "🇫🇷",
  portugal: "🇵🇹",
  holanda: "🇳🇱",
  noruega: "🇳🇴",
};

const TEAM_DISPLAY: Record<string, string> = {
  brasil: "Brazil",
  argentina: "Argentina",
  alemanha: "Germany",
  espanha: "Spain",
  inglaterra: "England",
  franca: "France",
  portugal: "Portugal",
  holanda: "Netherlands",
  noruega: "Norway",
};

type ScenarioResultProps = {
  result: ScenarioCalculateResponse | null;
};

function fmt(n: number) {
  return `€${n.toFixed(2)}`;
}

export function ScenarioResult({ result }: ScenarioResultProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
        <span className="text-4xl opacity-30">📊</span>
        <div className="text-center">
          <p className="text-sm font-medium">No scenario calculated yet</p>
          <p className="text-xs mt-0.5 text-slate-600">
            Configure and calculate a scenario to see results
          </p>
        </div>
      </div>
    );
  }

  const bestNet = Math.max(...result.rows.map((r) => r.net_result));

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Base Amount
          </div>
          <div className="text-xl font-mono font-semibold text-slate-100">
            {fmt(result.base_amount)}
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Total Bet
          </div>
          <div className="text-xl font-mono font-semibold text-slate-100">
            {fmt(result.total_bet)}
          </div>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Team
              </th>
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Odd
              </th>
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Bet
              </th>
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Gross
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Net
              </th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => {
              const isBestNet = row.net_result === bestNet;
              return (
                <tr
                  key={row.team}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">
                        {TEAM_FLAGS[row.team] ?? "🏳"}
                      </span>
                      <span className="text-slate-200 font-medium">
                        {TEAM_DISPLAY[row.team] ?? row.team}
                      </span>
                      {isBestNet && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-medium">
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-slate-400">
                    {row.best_odd != null ? row.best_odd.toFixed(2) : "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-slate-300">
                    {fmt(row.bet_amount)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-slate-300">
                    {fmt(row.gross_return)}
                  </td>
                  <td
                    className={`py-2.5 text-right font-mono font-semibold ${
                      row.net_result >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {row.net_result >= 0 ? "+" : ""}
                    {fmt(row.net_result)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
