import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import type { BestOddResponse, ScenarioCalculateFromOddsRequest, ScenarioCalculateResponse } from "../types/api";
import { calculateLocally } from "../utils/calculateScenario";

export type ScenarioFormHandle = {
  applyGoalSeek: (team: string, value: number) => void;
};

type ScenarioFormProps = {
  username: string;
  bestOdds: BestOddResponse[];
  onLiveResult: (result: ScenarioCalculateResponse | null) => void;
  onSave: (payload: ScenarioCalculateFromOddsRequest) => Promise<void>;
  isSaving: boolean;
};

const ALL_TEAMS = [
  "brasil",
  "argentina",
  "alemanha",
  "espanha",
  "inglaterra",
  "franca",
  "portugal",
  "holanda",
  "noruega",
];

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

export const ScenarioForm = forwardRef<ScenarioFormHandle, ScenarioFormProps>(
function ScenarioForm({
  username,
  bestOdds,
  onLiveResult,
  onSave,
  isSaving,
}: ScenarioFormProps, ref) {
  const oddMap = Object.fromEntries(bestOdds.map((o) => [o.team, o.best_odd]));
  const platformMap = Object.fromEntries(bestOdds.map((o) => [o.team, o.best_platform]));
  const sortedTeams = [...ALL_TEAMS].sort(
    (a, b) => (oddMap[a] ?? Infinity) - (oddMap[b] ?? Infinity),
  );

  const [name, setName] = useState(`${username} é foda`);
  const [baseAmount, setBaseAmount] = useState("10");
  const [market] = useState("winner");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, string>>({});

  useImperativeHandle(ref, () => ({
    applyGoalSeek(team: string, value: number) {
      setWeights((w) => ({ ...w, [team]: value.toFixed(4) }));
    },
  }));

  const liveResult = useMemo(
    () =>
      calculateLocally(
        selectedTeams,
        Object.fromEntries(selectedTeams.map((t) => [t, Number(weights[t] ?? 0)])),
        Number(baseAmount),
        bestOdds,
      ),
    [selectedTeams, weights, baseAmount, bestOdds],
  );

  useEffect(() => {
    onLiveResult(liveResult);
  }, [liveResult, onLiveResult]);

  function handleTeamToggle(team: string) {
    setSelectedTeams((current) => {
      if (current.includes(team)) {
        const nextTeams = current.filter((item) => item !== team);
        setWeights((w) => {
          const next = { ...w };
          delete next[team];
          return next;
        });
        return nextTeams;
      }
      setWeights((w) => ({ ...w, [team]: "1" }));
      return [...current, team];
    });
  }

  function handleWeightChange(team: string, value: string) {
    setWeights((current) => ({ ...current, [team]: value }));
  }

  function buildPayload(): ScenarioCalculateFromOddsRequest {
    return {
      name,
      teams: selectedTeams,
      bet_weights: Object.fromEntries(
        selectedTeams.map((team) => [team, Number(weights[team] ?? "0")]),
      ),
      base_amount: Number(baseAmount),
      market,
    };
  }

  const totalWeight = selectedTeams.reduce(
    (sum, team) => sum + Number(weights[team] ?? 0),
    0,
  );

  return (
    <div className="space-y-5">
      {/* Scenario name */}
      <div>
        <label
          htmlFor="scenario-name"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
        >
          Nome do cenário
        </label>
        <input
          id="scenario-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Base amount + market row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="base-amount"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Valor base (R$)
          </label>
          <input
            id="base-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
            disabled={isSaving}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Mercado
          </label>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-slate-500 text-sm capitalize">
            {market}
          </div>
        </div>
      </div>

      {/* Save button */}
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
            Seleções e pesos
          </span>
          {selectedTeams.length > 0 && (
            <span className="text-xs text-slate-500">
              {selectedTeams.length} selecionadas · peso total {totalWeight.toFixed(2)}
            </span>
          )}
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-3 px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span className="flex-1">Seleção</span>
          <span className="w-12 text-right">Odd</span>
          <span className="w-24 text-right">Casa</span>
          <span className="w-20 text-right">Peso</span>
        </div>

        <div className="space-y-1.5">
          {sortedTeams.map((team) => {
            const isSelected = selectedTeams.includes(team);
            return (
              <div
                key={team}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-emerald-500/8 border-emerald-500/30"
                    : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                }`}
              >
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

                <span className="w-12 text-right font-mono text-sm text-slate-300 flex-shrink-0">
                  {oddMap[team] != null ? oddMap[team].toFixed(2) : "—"}
                </span>

                <span className="w-24 text-right text-xs text-slate-500 flex-shrink-0 truncate">
                  {platformMap[team] ?? "—"}
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={weights[team] ?? ""}
                  onChange={(e) => handleWeightChange(team, e.target.value)}
                  disabled={!isSelected || isSaving}
                  placeholder="Peso"
                  className="w-20 flex-shrink-0 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
