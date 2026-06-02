import os
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

TARGET_TEAMS = [
    "brasil",
    "argentina",
    "alemanha",
    "espanha",
    "inglaterra",
    "franca",
    "portugal",
    "paises_baixos",
    "noruega"
]

TEAM_NAME_ALIASES = {
    "brasil": "brasil",
    "argentina": "argentina",
    "alemanha": "alemanha",
    "espanha": "espanha",
    "inglaterra": "inglaterra",
    "frança": "franca",
    "portugal": "portugal",
    "noruega": "noruega",
    "países baixos": "paises_baixos",
    "paises baixos": "paises_baixos",
    "holanda": "paises_baixos",
}