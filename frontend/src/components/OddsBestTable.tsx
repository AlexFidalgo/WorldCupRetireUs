import type { BestOddResponse } from "../types/api";

type OddsBestTableProps = {
  odds: BestOddResponse[];
};

export function OddsBestTable({ odds }: OddsBestTableProps) {
  if (odds.length === 0) {
    return <p>No odds loaded yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>Best Platform</th>
          <th>Best Odd</th>
          <th>Market</th>
        </tr>
      </thead>
      <tbody>
        {odds.map((item) => (
          <tr key={`${item.team}-${item.market}`}>
            <td>{item.team}</td>
            <td>{item.best_platform}</td>
            <td>{item.best_odd}</td>
            <td>{item.market}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}