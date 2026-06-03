import { buildHeaders, getApiBaseUrl } from "./client";
import type { BestOddResponse } from "../types/api";

export async function getBestOdds(market: string = "winner"): Promise<BestOddResponse[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/odds/best?market=${encodeURIComponent(market)}`,
    {
      method: "GET",
      headers: buildHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Falha ao carregar melhores odds");
  }

  return response.json() as Promise<BestOddResponse[]>;
}
