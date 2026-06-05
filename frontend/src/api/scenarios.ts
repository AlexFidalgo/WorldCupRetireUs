import { buildHeaders, getApiBaseUrl } from "./client";
import type {
  ScenarioCalculateFromOddsRequest,
  ScenarioPublicResponse,
  ScenarioSaveResponse,
  ScenarioSaveWithOddsRequest,
} from "../types/api";

export async function saveScenarioFromOdds(
  payload: ScenarioCalculateFromOddsRequest,
): Promise<ScenarioSaveResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/scenarios/save-from-odds`,
    {
      method: "POST",
      headers: buildHeaders(true),
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

export async function saveScenario(
  payload: ScenarioSaveWithOddsRequest,
): Promise<ScenarioSaveResponse> {
  const response = await fetch(`${getApiBaseUrl()}/scenarios/save`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail ?? "Falha ao salvar cenário";
    throw new Error(message);
  }

  return response.json() as Promise<ScenarioSaveResponse>;
}

export async function deleteScenario(id: number): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/scenarios/${id}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail ?? "Falha ao apagar cenário";
    throw new Error(message);
  }
}

export async function getScenarios(): Promise<ScenarioPublicResponse[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/scenarios/?sort_by=id&sort_order=desc&limit=100`,
    {
      method: "GET",
      headers: buildHeaders(true),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail ?? "Falha ao carregar cenários";
    throw new Error(message);
  }

  return response.json() as Promise<ScenarioPublicResponse[]>;
}
