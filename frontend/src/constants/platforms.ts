// Matches platform_priority.csv — update both together when adding/removing platforms
export const PLATFORMS = [
  "Betano",
  "Sportingbet",
  "Novibet",
  "Superbet",
  "Bet365",
  "Segurobet",
  "Betfair",
] as const;

export type Platform = (typeof PLATFORMS)[number];
