from typing import Optional

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON

from datetime import datetime, timezone



class Scenario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    name: str

    base_amount: float
    total_bet: float

    # store full scenario result as JSON
    data: dict = Field(sa_column=Column(JSON))

    user_id: int = Field(foreign_key="user.id")


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    username: str = Field(index=True, unique=True)
    hashed_password: str

class Odd(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    team: str = Field(index=True)
    platform: str = Field(index=True)
    market: str = Field(default="winner", index=True)

    odd: float

    source_url: Optional[str] = None
    scraped_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
