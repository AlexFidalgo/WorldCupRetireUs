import { useEffect, useState } from "react";
import { getBestOdds, importManualOdds } from "../api/odds";
import {
  calculateScenarioFromOdds,
  saveScenarioFromOdds,
} from "../api/scenarios";
import { DirectBetForm } from "../components/DirectBetForm";
import { OddsBestTable } from "../components/OddsBestTable";
import { ScenarioForm } from "../components/ScenarioForm";
import { ScenarioResult } from "../components/ScenarioResult";
import type {
  BestOddResponse,
  ScenarioCalculateFromOddsRequest,
  ScenarioCalculateResponse,
} from "../types/api";

type DashboardPageProps = {
  onLogout: () => void;
};

type ScenarioMode = "pesos" | "direto";

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingOdds, setIsLoadingOdds] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bestOdds, setBestOdds] = useState<BestOddResponse[]>([]);
  const [scenarioResult, setScenarioResult] =
    useState<ScenarioCalculateResponse | null>(null);
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>("pesos");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadBestOdds() {
    setIsLoadingOdds(true);

    try {
      const data = await getBestOdds("winner");
      setBestOdds(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao carregar odds.",
      );
    } finally {
      setIsLoadingOdds(false);
    }
  }

  useEffect(() => {
    void loadBestOdds();
  }, []);

  function clearMessages() {
    setStatusMessage("");
    setErrorMessage("");
  }

  async function handleImportManualOdds() {
    setIsImporting(true);
    clearMessages();

    try {
      await importManualOdds();
      await loadBestOdds();
      setStatusMessage("Odds importadas com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao importar odds.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  async function handleCalculateScenario(
    payload: ScenarioCalculateFromOddsRequest,
  ) {
    setIsCalculating(true);
    clearMessages();

    try {
      const result = await calculateScenarioFromOdds(payload);
      setScenarioResult(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao calcular cenário.",
      );
    } finally {
      setIsCalculating(false);
    }
  }

  async function handleSaveScenario(payload: ScenarioCalculateFromOddsRequest) {
    setIsSaving(true);
    clearMessages();

    try {
      await saveScenarioFromOdds(payload);
      const result = await calculateScenarioFromOdds(payload);
      setScenarioResult(result);
      setStatusMessage("Cenário salvo com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao salvar cenário.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚽</span>
            <span className="font-semibold text-slate-100 text-sm">
              WorldCup<span className="text-emerald-400">RetireUs</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleImportManualOdds}
            disabled={isImporting}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            {isImporting ? "Importando..." : "Importar Odds"}
          </button>

          {statusMessage && (
            <div className="inline-flex items-center gap-1.5 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="inline-flex items-center gap-1.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Best Odds */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-100 text-sm">
                Melhores Odds — Vencedor
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Melhores odds disponíveis por seleção nas casas de aposta
              </p>
            </div>
            {!isLoadingOdds && bestOdds.length > 0 && (
              <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
                {bestOdds.length} seleções
              </span>
            )}
          </div>
          <div className="p-6">
            {isLoadingOdds ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Carregando odds...
              </div>
            ) : (
              <OddsBestTable odds={bestOdds} />
            )}
          </div>
        </div>

        {/* Scenario section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: form with mode tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100 text-sm mb-3">
                Calcular Cenário
              </h2>
              {/* Mode tabs */}
              <div className="inline-flex rounded-lg bg-slate-800 p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => setScenarioMode("pesos")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    scenarioMode === "pesos"
                      ? "bg-slate-700 text-slate-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Por pesos
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioMode("direto")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    scenarioMode === "direto"
                      ? "bg-slate-700 text-slate-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Valor direto
                </button>
              </div>
            </div>
            <div className="p-6">
              {scenarioMode === "pesos" ? (
                <ScenarioForm
                  onCalculate={handleCalculateScenario}
                  onSave={handleSaveScenario}
                  isCalculating={isCalculating}
                  isSaving={isSaving}
                />
              ) : (
                <DirectBetForm
                  onCalculate={handleCalculateScenario}
                  onSave={handleSaveScenario}
                  isCalculating={isCalculating}
                  isSaving={isSaving}
                />
              )}
            </div>
          </div>

          {/* Right: result */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100 text-sm">
                Resultado do Cenário
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Retornos projetados e detalhamento por seleção
              </p>
            </div>
            <div className="p-6">
              <ScenarioResult result={scenarioResult} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
