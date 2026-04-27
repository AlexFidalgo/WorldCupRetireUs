from fastapi import APIRouter, Depends
from app.services.scenario_calculator import ScenarioService, get_scenario_service

from app.schemas import (
    ScenarioCalculateRequest,
    ScenarioCalculateResponse,
)


router = APIRouter(
    prefix="/scenarios",
    tags=["scenarios"],
)


@router.post("/calculate", response_model=ScenarioCalculateResponse)
def calculate_scenario_endpoint(
    request: ScenarioCalculateRequest,
    service: ScenarioService = Depends(get_scenario_service),
):
    return service.calculate(
        teams=request.teams,
        odds=request.odds,
        bet_weights=request.bet_weights,
        base_amount=request.base_amount,
    )