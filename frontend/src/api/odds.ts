import { buildHeaders, getApiBaseUrl } from "./client";
import type { BestOddResponse } from "../types/api";

export async function importManualOdds(): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/odds/import/manual`, {
    method: "POST",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to import manual odds");
  }
}

export async function getBestOdds(market: string = "winner"): Promise<BestOddResponse[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/odds/best?market=${encodeURIComponent(market)}`,
    {
      method: "GET",
      headers: buildHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load best odds");
  }

  const data: BestOddResponse[] = await response.json();

  return data;
}