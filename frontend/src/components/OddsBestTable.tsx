import type { BestOddResponse } from "../types/api";

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

type OddsBestTableProps = {
  odds: BestOddResponse[];
};

export function OddsBestTable({ odds }: OddsBestTableProps) {
  if (odds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm gap-2">
        <span className="text-3xl opacity-50">📋</span>
        <p>No odds loaded yet. Import odds to get started.</p>
      </div>
    );
  }

  const sorted = [...odds].sort((a, b) => b.best_odd - a.best_odd);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-slate-800">
            <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Team
            </th>
            <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Platform
            </th>
            <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
              Best Odd
            </th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
              Market
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, idx) => (
            <tr
              key={`${item.team}-${item.market}`}
              className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">
                    {TEAM_FLAGS[item.team] ?? "🏳"}
                  </span>
                  <span
                    className={`font-medium ${idx === 0 ? "text-emerald-400" : "text-slate-200"}`}
                  >
                    {TEAM_DISPLAY[item.team] ?? item.team}
                  </span>
                  {idx === 0 && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-medium">
                      Best
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 pr-4 text-slate-400">{item.best_platform}</td>
              <td className="py-3 pr-4 text-right font-mono font-semibold text-slate-100">
                {item.best_odd.toFixed(2)}
              </td>
              <td className="py-3 text-right">
                <span className="inline-block bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-400 capitalize">
                  {item.market}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
