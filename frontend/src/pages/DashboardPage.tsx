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
  const [scenarioResult, setScenarioResult] = useState<ScenarioCalculateResponse | null>(null);
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
      setStatusMessage("Manual odds imported successfully.");
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
      setStatusMessage("Scenario calculated successfully.");
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
    <main>
      <header>
        <h1>WorldCupRetireUs</h1>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section>
        <h2>Odds Import</h2>
        <button
          type="button"
          onClick={handleImportManualOdds}
          disabled={isImporting}
        >
          {isImporting ? "Importing..." : "Import Manual Odds"}
        </button>
      </section>

      <section>
        <h2>Best Winner Odds</h2>
        {isLoadingOdds ? <p>Loading odds...</p> : <OddsBestTable odds={bestOdds} />}
      </section>

      <section>
        <h2>Calculate Scenario</h2>
        <ScenarioForm
          onSubmit={handleCalculateScenario}
          isSubmitting={isCalculating}
        />
      </section>

      <section>
        <ScenarioResult result={scenarioResult} />
      </section>

      {statusMessage ? <p>{statusMessage}</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}
    </main>
  );
}