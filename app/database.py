import os
from pathlib import Path
from sqlmodel import SQLModel, Session, create_engine

from app import models  # noqa: F401


_PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_PROJECT_ROOT / 'worldcup_retire_us.db'}")

engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DB_ECHO", "false").lower() == "true",
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
