from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ScenarioCalculateRequest(BaseModel):
    teams: List[str]
    odds: Dict[str, Dict[str, float]]
    bet_weights: Dict[str, float]
    base_amount: float = Field(gt=0) #FastAPI will reject requests where base_amount <= 0


class ScenarioRow(BaseModel):
    team: str
    odds: Dict[str, float]
    best_company: Optional[str]
    best_odd: float
    weight: float
    bet_amount: float
    gross_return: float
    net_result: float


class ScenarioCalculateResponse(BaseModel):
    base_amount: float
    total_bet: float
    rows: List[ScenarioRow]

class ScenarioSaveResponse(BaseModel):
    id: int
    base_amount: float
    total_bet: float
    data: dict

class UserCreateRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str