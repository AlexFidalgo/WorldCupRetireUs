import { useEffect, useState } from "react";
import { getBestOdds, importManualOdds } from "../api/odds";
import { calculateScenarioFromOdds } from "../api/scenarios";
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

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingOdds, setIsLoadingOdds] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [bestOdds, setBestOdds] = useState<BestOddResponse[]>([]);
  const [scenarioResult, setScenarioResult] =
    useState<ScenarioCalculateResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadBestOdds() {
    setIsLoadingOdds(true);

    try {
      const data = await getBestOdds("winner");
      setBestOdds(data);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to load best odds.");
      }
    } finally {
      setIsLoadingOdds(false);
    }
  }

  useEffect(() => {
    void loadBestOdds();
  }, []);

  async function handleImportManualOdds() {
    setIsImporting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await importManualOdds();
      await loadBestOdds();
      setStatusMessage("Odds imported successfully.");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to import manual odds.");
      }
    } finally {
      setIsImporting(false);
    }
  }

  async function handleCalculateScenario(
    payload: ScenarioCalculateFromOddsRequest,
  ) {
    setIsCalculating(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const result = await calculateScenarioFromOdds(payload);
      setScenarioResult(result);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to calculate scenario.");
      }
    } finally {
      setIsCalculating(false);
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
            Sign out
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
            {isImporting ? "Importing..." : "Import Odds"}
          </button>

          {statusMessage && (
            <div className="inline-flex items-center gap-1.5 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
                Best Winner Odds
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Best available odds per team across platforms
              </p>
            </div>
            {!isLoadingOdds && bestOdds.length > 0 && (
              <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
                {bestOdds.length} teams
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
                Loading odds...
              </div>
            ) : (
              <OddsBestTable odds={bestOdds} />
            )}
          </div>
        </div>

        {/* Scenario section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100 text-sm">
                Calculate Scenario
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Configure teams and bet weights
              </p>
            </div>
            <div className="p-6">
              <ScenarioForm
                onSubmit={handleCalculateScenario}
                isSubmitting={isCalculating}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100 text-sm">
                Scenario Result
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Projected returns and breakdown
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
