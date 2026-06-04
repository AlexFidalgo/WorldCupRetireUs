import { useState } from "react";
import type { ScenarioCalculateResponse } from "../types/api";
import { ImageSlideshow } from "./ImageSlideshow";

const imageModules = import.meta.glob<string>("../assets/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});
const FUNNY_IMAGES = Object.values(imageModules);

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
  brasil: "Brasil",
  argentina: "Argentina",
  alemanha: "Alemanha",
  espanha: "Espanha",
  inglaterra: "Inglaterra",
  franca: "França",
  portugal: "Portugal",
  holanda: "Holanda",
  noruega: "Noruega",
};

type ScenarioResultProps = {
  result: ScenarioCalculateResponse | null;
  onGoalSeek?: (team: string, targetNet: number) => void;
};

function fmtBRL(n: number) {
  return `R$${n.toFixed(2).replace(".", ",")}`;
}

export function ScenarioResult({ result, onGoalSeek }: ScenarioResultProps) {
  const [seekTeam, setSeekTeam] = useState<string | null>(null);
  const [seekInput, setSeekInput] = useState("");
  if (!result) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-500">
          <span className="text-4xl opacity-30">📊</span>
          <div className="text-center">
            <p className="text-sm font-medium">Nenhum cenário calculado ainda</p>
            <p className="text-xs mt-0.5 text-slate-600">
              Configure e calcule um cenário para ver os resultados aqui
            </p>
          </div>
        </div>
        <ImageSlideshow images={FUNNY_IMAGES} />
      </div>
    );
  }


  return (
    <div className="space-y-5 pb-2">
      {/* Summary */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
          Total Apostado
        </div>
        <div className="text-xl font-mono font-semibold text-slate-100">
          {fmtBRL(result.total_bet)}
        </div>
      </div>

      {/* Breakdown table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Seleção
              </th>
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Odd
              </th>
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Aposta
              </th>
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Retorno
              </th>
              <th className="pb-3 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Ret. %
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Líquido
                {onGoalSeek && (
                  <span className="ml-1 text-slate-600" title="Clica num valor para definir alvo">
                    🎯
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => {
              const retPct =
                result.total_bet > 0
                  ? (row.net_result / result.total_bet) * 100
                  : null;
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
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-slate-400">
                    {row.best_odd != null ? row.best_odd.toFixed(2) : "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-slate-300">
                    {fmtBRL(row.bet_amount)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-slate-300">
                    {fmtBRL(row.gross_return)}
                  </td>
                  <td
                    className={`py-2.5 pr-3 text-right font-mono ${
                      retPct == null
                        ? "text-slate-500"
                        : retPct >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                    }`}
                  >
                    {retPct == null
                      ? "—"
                      : `${retPct >= 0 ? "+" : ""}${retPct.toFixed(1)}%`}
                  </td>
                  <td className="py-2.5 text-right">
                    {onGoalSeek && seekTeam === row.team ? (
                      <input
                        autoFocus
                        type="text"
                        value={seekInput}
                        onChange={(e) => setSeekInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = parseFloat(seekInput.replace(",", "."));
                            if (!isNaN(val)) onGoalSeek(row.team, val);
                            setSeekTeam(null);
                          }
                          if (e.key === "Escape") setSeekTeam(null);
                        }}
                        onBlur={() => setSeekTeam(null)}
                        className="w-28 bg-slate-700 border border-emerald-500/50 rounded px-2 py-0.5 text-right text-slate-100 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="alvo"
                      />
                    ) : (
                      <span
                        onClick={() => {
                          if (!onGoalSeek) return;
                          setSeekTeam(row.team);
                          setSeekInput(
                            row.net_result.toFixed(2).replace(".", ","),
                          );
                        }}
                        className={`font-mono font-semibold ${
                          row.net_result >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        } ${onGoalSeek ? "cursor-pointer hover:underline hover:underline-offset-2" : ""}`}
                        title={onGoalSeek ? "Clica para definir alvo" : undefined}
                      >
                        {row.net_result >= 0 ? "+" : ""}
                        {fmtBRL(row.net_result)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ImageSlideshow images={FUNNY_IMAGES} />
    </div>
  );
}
