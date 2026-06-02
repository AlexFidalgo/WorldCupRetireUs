import { FormEvent, useState } from "react";
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
    setWeights((current) => ({
      ...current,
      [team]: value,
    }));
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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="scenario-name">Scenario name</label>
        <input
          id="scenario-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label htmlFor="base-amount">Base amount</label>
        <input
          id="base-amount"
          type="number"
          min="0.01"
          step="0.01"
          value={baseAmount}
          onChange={(event) => setBaseAmount(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label>Market</label>
        <input type="text" value={market} disabled readOnly />
      </div>

      <fieldset>
        <legend>Teams and weights</legend>

        {DEFAULT_TEAMS.map((team) => {
          const isSelected = selectedTeams.includes(team);

          return (
            <div key={team}>
              <label>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleTeamToggle(team)}
                  disabled={isSubmitting}
                />
                {team}
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={weights[team] ?? ""}
                onChange={(event) => handleWeightChange(team, event.target.value)}
                disabled={!isSelected || isSubmitting}
                placeholder="Weight"
              />
            </div>
          );
        })}
      </fieldset>

      <button type="submit" disabled={isSubmitting || selectedTeams.length === 0}>
        {isSubmitting ? "Calculating..." : "Calculate Scenario"}
      </button>
    </form>
  );
}