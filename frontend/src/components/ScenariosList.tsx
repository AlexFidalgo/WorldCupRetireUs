import { useEffect, useState } from "react";
import { getScenarios } from "../api/scenarios";
import type { ScenarioPublicResponse } from "../types/api";

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

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-orange-500",
];

function avatarColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function fmtBRL(n: number) {
  return `R$${n.toFixed(2).replace(".", ",")}`;
}

export function ScenariosList() {
  const [scenarios, setScenarios] = useState<ScenarioPublicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getScenarios();
      setScenarios(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar cenários");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function toggleExpand(id: number) {
    setExpanded((current) => (current === id ? null : id));
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-100 text-sm">
            Cenários Salvos
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Todos os cenários calculados e guardados pelos utilizadores
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
              {scenarios.length} cenário{scenarios.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            type="button"
            onClick={load}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm px-6 py-8">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Carregando cenários...
          </div>
        )}

        {error && (
          <div className="px-6 py-4 text-red-400 text-sm">{error}</div>
        )}

        {!isLoading && !error && scenarios.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-500">
            <span className="text-4xl opacity-30">📂</span>
            <div className="text-center">
              <p className="text-sm font-medium">Nenhum cenário guardado</p>
              <p className="text-xs mt-0.5 text-slate-600">
                Calcule e guarde um cenário para que apareça aqui
              </p>
            </div>
          </div>
        )}

        {!isLoading && scenarios.length > 0 && (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-2.5 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Cenário</span>
              <span className="text-right w-24">Seleções</span>
              <span className="text-right w-24">Valor Base</span>
              <span className="text-right w-24">Total</span>
              <span className="w-5" />
            </div>

            {/* Rows */}
            {scenarios.map((scenario) => {
              const isOpen = expanded === scenario.id;
              const rows = scenario.data?.rows ?? [];

              return (
                <div key={scenario.id} className="border-b border-slate-800/50 last:border-0">
                  {/* Main row */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(scenario.id)}
                    className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3.5 hover:bg-slate-800/30 transition-colors text-left items-center"
                  >
                    {/* Name + creator */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarColor(scenario.username)}`}
                      >
                        {scenario.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-100 truncate">
                          {scenario.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {scenario.username}
                        </div>
                      </div>
                    </div>

                    {/* Teams count */}
                    <div className="text-right w-24">
                      <span className="text-xs text-slate-400">
                        {rows.length} seleç{rows.length !== 1 ? "ões" : "ão"}
                      </span>
                    </div>

                    {/* Base amount */}
                    <div className="text-right font-mono text-sm text-slate-300 w-24">
                      {fmtBRL(scenario.base_amount)}
                    </div>

                    {/* Total bet */}
                    <div className="text-right font-mono text-sm font-medium text-slate-100 w-24">
                      {fmtBRL(scenario.total_bet)}
                    </div>

                    {/* Chevron */}
                    <div className="w-5 flex justify-center">
                      <svg
                        className={`w-4 h-4 text-slate-500 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && rows.length > 0 && (
                    <div className="px-6 pb-4">
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700/50">
                              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Seleção
                              </th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Odd
                              </th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Aposta
                              </th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Retorno
                              </th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Líquido
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr
                                key={row.team}
                                className="border-b border-slate-700/30 last:border-0"
                              >
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base leading-none">
                                      {TEAM_FLAGS[row.team] ?? "🏳"}
                                    </span>
                                    <span className="text-slate-200 font-medium">
                                      {TEAM_DISPLAY[row.team] ?? row.team}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-slate-400">
                                  {row.best_odd?.toFixed(2) ?? "—"}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                                  {fmtBRL(row.bet_amount)}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                                  {fmtBRL(row.gross_return)}
                                </td>
                                <td
                                  className={`px-4 py-2.5 text-right font-mono font-semibold ${
                                    row.net_result >= 0 ? "text-emerald-400" : "text-red-400"
                                  }`}
                                >
                                  {row.net_result >= 0 ? "+" : ""}
                                  {fmtBRL(row.net_result)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
