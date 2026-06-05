import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { PLATFORMS } from "../constants/platforms";
import type {
  BestOddResponse,
  ScenarioCalculateFromOddsRequest,
  ScenarioCalculateResponse,
  ScenarioSavePayload,
} from "../types/api";
import { calculateLocally } from "../utils/calculateScenario";

export type DirectBetFormHandle = {
  applyGoalSeek: (team: string, value: number) => void;
};

type DirectBetFormProps = {
  username: string;
  bestOdds: BestOddResponse[];
  onLiveResult: (result: ScenarioCalculateResponse | null) => void;
  onSave: (payload: ScenarioSavePayload) => Promise<void>;
  isSaving: boolean;
};

type OddOverride = { odd: string; platform: string };

const ALL_TEAMS = [
  "brasil", "argentina", "alemanha", "espanha", "inglaterra",
  "franca", "portugal", "holanda", "noruega",
];

const TEAM_FLAGS: Record<string, string> = {
  brasil: "🇧🇷", argentina: "🇦🇷", alemanha: "🇩🇪", espanha: "🇪🇸",
  inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", franca: "🇫🇷", portugal: "🇵🇹", holanda: "🇳🇱", noruega: "🇳🇴",
};

const TEAM_DISPLAY: Record<string, string> = {
  brasil: "Brasil", argentina: "Argentina", alemanha: "Alemanha", espanha: "Espanha",
  inglaterra: "Inglaterra", franca: "França", portugal: "Portugal",
  holanda: "Holanda", noruega: "Noruega",
};

function fmtBRL(n: number) {
  return `R$${n.toFixed(2).replace(".", ",")}`;
}

export const DirectBetForm = forwardRef<DirectBetFormHandle, DirectBetFormProps>(
function DirectBetForm({ username, bestOdds, onLiveResult, onSave, isSaving }, ref) {
  const oddMap = Object.fromEntries(bestOdds.map((o) => [o.team, o.best_odd]));
  const platformMap = Object.fromEntries(bestOdds.map((o) => [o.team, o.best_platform]));
  const sortedTeams = [...ALL_TEAMS].sort(
    (a, b) => (oddMap[a] ?? Infinity) - (oddMap[b] ?? Infinity),
  );

  const [name, setName] = useState(`${username} é foda`);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Record<string, OddOverride>>({});

  useImperativeHandle(ref, () => ({
    applyGoalSeek(team: string, value: number) {
      setAmounts((a) => ({ ...a, [team]: value.toFixed(2) }));
    },
  }));

  const effectiveBestOdds = useMemo(
    () =>
      bestOdds.map((o) => {
        const ov = overrides[o.team];
        const ovOdd = ov ? Number(ov.odd) : 0;
        return ov && ovOdd > 0
          ? { ...o, best_odd: ovOdd, best_platform: ov.platform }
          : o;
      }),
    [bestOdds, overrides],
  );

  const liveResult = useMemo(
    () =>
      calculateLocally(
        selectedTeams,
        Object.fromEntries(selectedTeams.map((t) => [t, Number(amounts[t] ?? 0)])),
        1,
        effectiveBestOdds,
      ),
    [selectedTeams, amounts, effectiveBestOdds],
  );

  useEffect(() => {
    onLiveResult(liveResult);
  }, [liveResult, onLiveResult]);

  function handleTeamToggle(team: string) {
    setSelectedTeams((current) => {
      if (current.includes(team)) {
        const nextTeams = current.filter((t) => t !== team);
        setAmounts((a) => { const n = { ...a }; delete n[team]; return n; });
        setOverrides((ov) => { const n = { ...ov }; delete n[team]; return n; });
        return nextTeams;
      }
      setAmounts((a) => ({ ...a, [team]: "10" }));
      return [...current, team];
    });
  }

  function activateOverride(team: string) {
    setOverrides((ov) => ({
      ...ov,
      [team]: {
        odd: String(oddMap[team] ?? ""),
        platform: platformMap[team] ?? PLATFORMS[0],
      },
    }));
  }

  function clearOverride(team: string) {
    setOverrides((ov) => { const n = { ...ov }; delete n[team]; return n; });
  }

  function buildPayload(): ScenarioSavePayload {
    const activeOverrides = Object.fromEntries(
      Object.entries(overrides).filter(
        ([team, ov]) => selectedTeams.includes(team) && Number(ov.odd) > 0,
      ),
    );

    const base: ScenarioCalculateFromOddsRequest = {
      name,
      teams: selectedTeams,
      bet_weights: Object.fromEntries(
        selectedTeams.map((t) => [t, Number(amounts[t] ?? "0")]),
      ),
      base_amount: 1,
      market: "winner",
    };

    if (Object.keys(activeOverrides).length === 0) return base;

    const explicit_odds: Record<string, Record<string, number>> = {};
    for (const team of selectedTeams) {
      const ov = activeOverrides[team];
      if (ov) {
        explicit_odds[team] = { [ov.platform]: Number(ov.odd) };
      } else {
        const db = bestOdds.find((o) => o.team === team);
        if (db) explicit_odds[team] = { [db.best_platform]: db.best_odd };
      }
    }

    return { ...base, explicit_odds };
  }

  const totalAmount = selectedTeams.reduce(
    (sum, t) => sum + Number(amounts[t] ?? 0), 0,
  );
  const hasOverrides = Object.keys(overrides).some((t) => selectedTeams.includes(t));

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="direct-scenario-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Nome do cenário
        </label>
        <input
          id="direct-scenario-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={() => void onSave(buildPayload())}
        disabled={isSaving || selectedTeams.length === 0}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isSaving ? "Salvando..." : "Salvar cenário"}
      </button>

      {/* Teams */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Valor por seleção (R$)
            {hasOverrides && (
              <span className="ml-2 text-amber-400">· odds manuais</span>
            )}
          </span>
          {selectedTeams.length > 0 && (
            <span className="text-xs text-slate-500">
              {selectedTeams.length} selecionadas ·{" "}
              <span className="text-emerald-400 font-medium">{fmtBRL(totalAmount)}</span>{" "}
              total
            </span>
          )}
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-3 px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span className="flex-1">Seleção</span>
          <span className="w-12 text-right">Odd</span>
          <span className="w-24 text-right">Casa</span>
          <span className="w-6" />
          <span className="w-24 text-right">Valor (R$)</span>
        </div>

        <div className="space-y-1.5">
          {sortedTeams.map((team) => {
            const isSelected = selectedTeams.includes(team);
            const ov = overrides[team];
            const isOverriding = isSelected && !!ov;

            return (
              <div
                key={team}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                  isOverriding
                    ? "bg-amber-500/5 border-amber-500/30"
                    : isSelected
                      ? "bg-emerald-500/8 border-emerald-500/30"
                      : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                }`}
              >
                {/* Team label */}
                <label className="flex items-center gap-3 flex-1 cursor-pointer select-none min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTeamToggle(team)}
                    disabled={isSaving}
                    className="w-4 h-4 rounded accent-emerald-500 flex-shrink-0"
                  />
                  <span className="text-base leading-none flex-shrink-0">
                    {TEAM_FLAGS[team] ?? "🏳"}
                  </span>
                  <span className={`text-sm font-medium truncate ${isSelected ? "text-slate-100" : "text-slate-400"}`}>
                    {TEAM_DISPLAY[team] ?? team}
                  </span>
                </label>

                {/* Odd */}
                {isOverriding ? (
                  <input
                    type="number"
                    step="0.01"
                    value={ov.odd}
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [team]: { ...prev[team], odd: e.target.value },
                      }))
                    }
                    className="w-16 flex-shrink-0 bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-right text-amber-300 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                ) : (
                  <span className="w-12 text-right font-mono text-sm text-slate-300 flex-shrink-0">
                    {oddMap[team] != null ? oddMap[team].toFixed(2) : "—"}
                  </span>
                )}

                {/* Platform */}
                {isOverriding ? (
                  <select
                    value={ov.platform}
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [team]: { ...prev[team], platform: e.target.value },
                      }))
                    }
                    className="w-28 flex-shrink-0 bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-amber-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <span className="w-24 text-right text-xs text-slate-500 flex-shrink-0 truncate">
                    {platformMap[team] ?? "—"}
                  </span>
                )}

                {/* Override toggle */}
                <div className="w-6 flex-shrink-0 flex justify-center">
                  {isSelected && (
                    isOverriding ? (
                      <button
                        type="button"
                        onClick={() => clearOverride(team)}
                        className="text-amber-500 hover:text-slate-400 transition-colors"
                        title="Voltar às odds da base de dados"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => activateOverride(team)}
                        className="text-slate-600 hover:text-amber-400 transition-colors"
                        title="Usar odd manual"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )
                  )}
                </div>

                {/* Amount */}
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amounts[team] ?? ""}
                  onChange={(e) => setAmounts((a) => ({ ...a, [team]: e.target.value }))}
                  disabled={!isSelected || isSaving}
                  placeholder="0,00"
                  className="w-24 flex-shrink-0 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {selectedTeams.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Total apostado
          </span>
          <span className="text-lg font-mono font-semibold text-slate-100">
            {fmtBRL(totalAmount)}
          </span>
        </div>
      )}
    </div>
  );
});
