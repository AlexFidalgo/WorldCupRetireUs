import { useEffect, useMemo, useState } from "react";
import type { BestOddResponse, ScenarioCalculateFromOddsRequest, ScenarioCalculateResponse } from "../types/api";
import { calculateLocally } from "../utils/calculateScenario";

type DirectBetFormProps = {
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

function fmtBRL(n: number) {
  return `R$${n.toFixed(2).replace(".", ",")}`;
}

export function DirectBetForm({
  username,
  bestOdds,
  onLiveResult,
  onSave,
  isSaving,
}: DirectBetFormProps) {
  const oddMap = Object.fromEntries(bestOdds.map((o) => [o.team, o.best_odd]));
  const platformMap = Object.fromEntries(bestOdds.map((o) => [o.team, o.best_platform]));
  const sortedTeams = [...ALL_TEAMS].sort(
    (a, b) => (oddMap[a] ?? Infinity) - (oddMap[b] ?? Infinity),
  );

  const [name, setName] = useState(`${username} é foda`);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const liveResult = useMemo(
    () =>
      calculateLocally(
        selectedTeams,
        Object.fromEntries(selectedTeams.map((t) => [t, Number(amounts[t] ?? 0)])),
        1,
        bestOdds,
      ),
    [selectedTeams, amounts, bestOdds],
  );

  useEffect(() => {
    onLiveResult(liveResult);
  }, [liveResult, onLiveResult]);

  function handleTeamToggle(team: string) {
    setSelectedTeams((current) => {
      if (current.includes(team)) {
        const nextTeams = current.filter((t) => t !== team);
        setAmounts((a) => {
          const next = { ...a };
          delete next[team];
          return next;
        });
        return nextTeams;
      }
      setAmounts((a) => ({ ...a, [team]: "10" }));
      return [...current, team];
    });
  }

  function handleAmountChange(team: string, value: string) {
    setAmounts((a) => ({ ...a, [team]: value }));
  }

  function buildPayload(): ScenarioCalculateFromOddsRequest {
    return {
      name,
      teams: selectedTeams,
      bet_weights: Object.fromEntries(
        selectedTeams.map((team) => [team, Number(amounts[team] ?? "0")]),
      ),
      base_amount: 1,
      market: "winner",
    };
  }

  const totalAmount = selectedTeams.reduce(
    (sum, team) => sum + Number(amounts[team] ?? 0),
    0,
  );

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="direct-scenario-name"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
        >
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
            Valor por seleção (R$)
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
          <span className="w-24 text-right">Valor (R$)</span>
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
                  min="0.01"
                  step="0.01"
                  value={amounts[team] ?? ""}
                  onChange={(e) => handleAmountChange(team, e.target.value)}
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
}
