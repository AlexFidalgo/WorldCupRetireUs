import { useState, type FormEvent } from "react";
import type { ScenarioCalculateFromOddsRequest } from "../types/api";

type ScenarioFormProps = {
  onSubmit: (payload: ScenarioCalculateFromOddsRequest) => Promise<void>;
  isSubmitting: boolean;
};

const DEFAULT_TEAMS = [
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

export function ScenarioForm({ onSubmit, isSubmitting }: ScenarioFormProps) {
  const [name, setName] = useState("Winner scenario");
  const [baseAmount, setBaseAmount] = useState("10");
  const [market] = useState("winner");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([
    "brasil",
    "argentina",
  ]);
  const [weights, setWeights] = useState<Record<string, string>>({
    brasil: "2",
    argentina: "1",
  });

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: ScenarioCalculateFromOddsRequest = {
      name,
      teams: selectedTeams,
      bet_weights: Object.fromEntries(
        selectedTeams.map((team) => [team, Number(weights[team] ?? "0")]),
      ),
      base_amount: Number(baseAmount),
      market,
    };

    await onSubmit(payload);
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
          Scenario name
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
            Base amount (€)
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
            Market
          </label>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-slate-500 text-sm capitalize">
            {market}
          </div>
        </div>
      </div>

      {/* Teams */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Teams & weights
          </span>
          {selectedTeams.length > 0 && (
            <span className="text-xs text-slate-500">
              {selectedTeams.length} selected · total weight {totalWeight}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {DEFAULT_TEAMS.map((team) => {
            const isSelected = selectedTeams.includes(team);

            return (
              <div
                key={team}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
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
                  <span
                    className={`text-sm font-medium truncate ${
                      isSelected ? "text-slate-100" : "text-slate-400"
                    }`}
                  >
                    {TEAM_DISPLAY[team] ?? team}
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={weights[team] ?? ""}
                  onChange={(e) => handleWeightChange(team, e.target.value)}
                  disabled={!isSelected || isSubmitting}
                  placeholder="Weight"
                  className="w-20 flex-shrink-0 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || selectedTeams.length === 0}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isSubmitting ? "Calculating..." : "Calculate Scenario"}
      </button>
    </form>
  );
}
