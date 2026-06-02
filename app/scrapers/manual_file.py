import csv
from pathlib import Path

from app import config
from app.config import TARGET_TEAMS, resolve_team_name
from app.schemas import OddCreateRequest
from app.scrapers.base import OddsProvider


class ManualFileOddsProvider(OddsProvider):
    def __init__(self, file_path: Path | None = None):
        self.file_path = Path(file_path) if file_path is not None else config.MANUAL_ODDS_FILE

    def fetch_winner_odds(self) -> list[OddCreateRequest]:
        raw_odds = self._load_raw_odds()
        results = []

        for item in raw_odds:
            raw_team_name = item["team"]
            canonical_team = resolve_team_name(raw_team_name)

            if canonical_team is None or canonical_team not in TARGET_TEAMS:
                continue

            results.append(
                OddCreateRequest(
                    team=canonical_team,
                    platform=item["platform"],
                    market=item.get("market", "winner"),
                    odd=item["odd"],
                    source_url=item.get("source_url"),
                )
            )

        return results

    def _load_raw_odds(self) -> list[dict]:
        if not self.file_path.exists():
            raise FileNotFoundError(f"Manual odds file not found: {self.file_path}")

        with self.file_path.open("r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            data = list(reader)

        required_columns = {"team", "platform", "odd"}
        if not reader.fieldnames or not required_columns.issubset(set(reader.fieldnames)):
            raise ValueError("Manual odds file must contain the columns: team, platform, odd")

        for item in data:
            item["odd"] = float(item["odd"])
            item["market"] = item.get("market") or "winner"
            item["source_url"] = item.get("source_url") or None

        return data
