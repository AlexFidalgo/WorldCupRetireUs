from typing import Optional

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON


class Scenario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    base_amount: float
    total_bet: float

    # store full scenario result as JSON
    data: dict = Field(sa_column=Column(JSON))