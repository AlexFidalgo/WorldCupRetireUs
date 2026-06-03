import os
import csv
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

import unicodedata


def normalize_text(value: str) -> str:
    value = value.strip().lower()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return " ".join(value.split())

def resolve_team_name(raw_name: str) -> str | None:
    normalized_name = normalize_text(raw_name)
    return TEAM_NAME_ALIASES.get(normalized_name)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
ADMIN_SECRET = os.getenv("ADMIN_SECRET")
APP_DIR = Path(__file__).resolve().parent
MANUAL_ODDS_FILE = APP_DIR / "data" / "manual_winner_odds.csv"
PLATFORM_PRIORITY_FILE = APP_DIR / "data" / "platform_priority.csv"

TARGET_TEAMS = [
    "brasil",
    "argentina",
    "alemanha",
    "espanha",
    "inglaterra",
    "franca",
    "portugal",
    "holanda",
    "noruega"
]

TEAM_NAME_ALIASES = {
    "brasil": "brasil",
    "brazil": "brasil",
    "argentina": "argentina",
    "alemanha": "alemanha",
    "germany": "alemanha",
    "espanha": "espanha",
    "spain": "espanha",
    "inglaterra": "inglaterra",
    "england": "inglaterra",
    "franca": "franca",
    "frança": "franca",
    "france": "franca",
    "portugal": "portugal",
    "noruega": "noruega",
    "norway": "noruega",
    "países baixos": "holanda",
    "paises baixos": "holanda",
    "holanda": "holanda",
    "netherlands": "holanda",
    "holland": "holanda",
}


def load_platform_priorities() -> dict[str, int]:
    priorities = {}

    with PLATFORM_PRIORITY_FILE.open("r", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for row in reader:
            if not row["platform"] or not row["priority"]:
                continue
            priorities[row["platform"]] = int(row["priority"])

    return priorities


PLATFORM_PRIORITIES = load_platform_priorities()


def get_platform_priority(platform: str) -> int:
    return PLATFORM_PRIORITIES.get(platform, 9999)
