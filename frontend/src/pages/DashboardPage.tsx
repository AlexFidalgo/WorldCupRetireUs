import { useEffect, useState } from "react";
import { getCurrentUsername } from "../api/client";
import { getBestOdds } from "../api/odds";
import {
  calculateScenarioFromOdds,
  saveScenarioFromOdds,
} from "../api/scenarios";
import { DirectBetForm } from "../components/DirectBetForm";
import { OddsBestTable } from "../components/OddsBestTable";
import { ScenarioForm } from "../components/ScenarioForm";
import { ScenarioResult } from "../components/ScenarioResult";
import { ScenariosList } from "../components/ScenariosList";
import { Toast } from "../components/Toast";
import type {
  BestOddResponse,
  ScenarioCalculateFromOddsRequest,
  ScenarioCalculateResponse,
} from "../types/api";

type DashboardPageProps = {
  onLogout: () => void;
};

type View = "apostas" | "cenarios";
type ScenarioMode = "pesos" | "direto";

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const username = getCurrentUsername() ?? "utilizador";
  const [view, setView] = useState<View>("apostas");
  const [isLoadingOdds, setIsLoadingOdds] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bestOdds, setBestOdds] = useState<BestOddResponse[]>([]);
  const [scenarioResult, setScenarioResult] =
    useState<ScenarioCalculateResponse | null>(null);
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>("pesos");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    void loadBestOdds();
  }, []);

  async function loadBestOdds() {
    setIsLoadingOdds(true);
    try {
      const data = await getBestOdds("winner");
      setBestOdds(data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Falha ao carregar odds.",
        "error",
      );
    } finally {
      setIsLoadingOdds(false);
    }
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  async function handleCalculateScenario(
    payload: ScenarioCalculateFromOddsRequest,
  ) {
    setIsCalculating(true);
    try {
      const result = await calculateScenarioFromOdds(payload);
      setScenarioResult(result);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Falha ao calcular cenário.",
        "error",
      );
    } finally {
      setIsCalculating(false);
    }
  }

  async function handleSaveScenario(payload: ScenarioCalculateFromOddsRequest) {
    setIsSaving(true);
    try {
      await saveScenarioFromOdds(payload);
      const result = await calculateScenarioFromOdds(payload);
      setScenarioResult(result);
      showToast("Cenário salvo com sucesso.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Falha ao salvar cenário.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="text-lg">⚽</span>
            <span className="font-semibold text-slate-100 text-sm">
              WorldCup<span className="text-emerald-400">RetireUs</span>
            </span>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setView("apostas")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === "apostas"
                  ? "bg-slate-700 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Apostas
            </button>
            <button
              type="button"
              onClick={() => setView("cenarios")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === "cenarios"
                  ? "bg-slate-700 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Cenários
            </button>
          </nav>

          {/* Sign out */}
          <button
            type="button"
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 font-medium flex-shrink-0"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Apostas view ── */}
        {view === "apostas" && (
          <>
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

            {/* Scenario calculator */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h2 className="font-semibold text-slate-100 text-sm mb-3">
                    Calcular Cenário
                  </h2>
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
                      username={username}
                      onCalculate={handleCalculateScenario}
                      onSave={handleSaveScenario}
                      isCalculating={isCalculating}
                      isSaving={isSaving}
                    />
                  ) : (
                    <DirectBetForm
                      username={username}
                      onCalculate={handleCalculateScenario}
                      onSave={handleSaveScenario}
                      isCalculating={isCalculating}
                      isSaving={isSaving}
                    />
                  )}
                </div>
              </div>

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
          </>
        )}

        {/* ── Cenários view ── */}
        {view === "cenarios" && <ScenariosList />}
      </main>

      {/* Fixed toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
