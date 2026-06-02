import type { ScenarioCalculateResponse } from "../types/api";

type ScenarioResultProps = {
  result: ScenarioCalculateResponse | null;
};

export function ScenarioResult({ result }: ScenarioResultProps) {
  if (!result) {
    return <p>No scenario calculated yet.</p>;
  }

  return (
    <section>
      <h3>Scenario Result</h3>
      <p>Base amount: {result.base_amount}</p>
      <p>Total bet: {result.total_bet}</p>

      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Best Platform</th>
            <th>Best Odd</th>
            <th>Weight</th>
            <th>Bet Amount</th>
            <th>Gross Return</th>
            <th>Net Result</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => (
            <tr key={row.team}>
              <td>{row.team}</td>
              <td>{row.best_company ?? "-"}</td>
              <td>{row.best_odd}</td>
              <td>{row.weight}</td>
              <td>{row.bet_amount}</td>
              <td>{row.gross_return}</td>
              <td>{row.net_result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}