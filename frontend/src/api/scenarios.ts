import { buildHeaders, getApiBaseUrl } from "./client";
import type {
  ScenarioCalculateFromOddsRequest,
  ScenarioCalculateResponse,
} from "../types/api";

export async function calculateScenarioFromOdds(
  payload: ScenarioCalculateFromOddsRequest,
): Promise<ScenarioCalculateResponse> {
  const response = await fetch(`${getApiBaseUrl()}/scenarios/calculate-from-odds`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.detail ?? "Failed to calculate scenario from stored odds";

    throw new Error(message);
  }

  const data: ScenarioCalculateResponse = await response.json();

  return data;
}