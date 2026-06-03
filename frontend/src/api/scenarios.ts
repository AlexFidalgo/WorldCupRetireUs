import { buildHeaders, getApiBaseUrl } from "./client";
import type {
  ScenarioCalculateFromOddsRequest,
  ScenarioCalculateResponse,
  ScenarioSaveResponse,
} from "../types/api";

export async function calculateScenarioFromOdds(
  payload: ScenarioCalculateFromOddsRequest,
): Promise<ScenarioCalculateResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/scenarios/calculate-from-odds`,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.detail ?? "Falha ao calcular cenário com odds salvas";
    throw new Error(message);
  }

  return response.json() as Promise<ScenarioCalculateResponse>;
}

export async function saveScenarioFromOdds(
  payload: ScenarioCalculateFromOddsRequest,
): Promise<ScenarioSaveResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/scenarios/save-from-odds`,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail ?? "Falha ao salvar cenário";
    throw new Error(message);
  }

  return response.json() as Promise<ScenarioSaveResponse>;
}
