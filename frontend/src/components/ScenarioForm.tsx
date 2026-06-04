import { useState, type FormEvent } from "react";
import type { BestOddResponse, ScenarioCalculateFromOddsRequest } from "../types/api";

type ScenarioFormProps = {
  username: string;
  bestOdds: BestOddResponse[];
  onCalculate: (payload: ScenarioCalculateFromOddsRequest) => Promise<void>;
  onSave: (payload: ScenarioCalculateFromOddsRequest) => Promise<void>;
  isCalculating: boolean;
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

export function ScenarioForm({
  username,
  bestOdds,
  onCalculate,
  onSave,
  isCalculating,
  isSaving,
}: ScenarioFormProps) {
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

  const isSubmitting = isCalculating || isSaving;

  function handleTeamToggle(team: string) {
    setSelectedTeams((current) => {
      if (current.includes(team)) {
        const nextTeams = current.filter((item) => item !== team);
        setWeights((currentWeights) => {
          const nextWeights = { ...currentWeights };
          delete nextWeights[team];
          return nextWeights;
        });
        return nextTeams;
      }

      setWeights((currentWeights) => ({
        ...currentWeights,
        [team]: "1",
      }));

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCalculate(buildPayload());
  }

  async function handleSave() {
    await onSave(buildPayload());
  }

  const totalWeight = selectedTeams.reduce(
    (sum, team) => sum + Number(weights[team] ?? 0),
    0,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          disabled={isSubmitting}
          required
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
            disabled={isSubmitting}
            required
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

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || selectedTeams.length === 0}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isCalculating ? "Calculando..." : "Calcular"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting || selectedTeams.length === 0}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2.5 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>

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
                    disabled={isSubmitting}
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
                  disabled={!isSelected || isSubmitting}
                  placeholder="Peso"
                  className="w-20 flex-shrink-0 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                />
              </div>
            );
          })}
        </div>
      </div>

    </form>
  );
}
