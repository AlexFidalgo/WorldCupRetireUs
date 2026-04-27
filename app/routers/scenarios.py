from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.services.scenario_calculator import ScenarioService, get_scenario_service

from sqlmodel import Session, select

from app.models import Scenario

from app.database import get_session

from app.schemas import (
    ScenarioCalculateRequest,
    ScenarioCalculateResponse,
    ScenarioSaveResponse,
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


@router.post("/save", response_model=ScenarioSaveResponse)
def save_scenario_endpoint(
    request: ScenarioCalculateRequest,
    session: Session = Depends(get_session),
    service: ScenarioService = Depends(get_scenario_service),
):
    result = service.calculate(
        teams=request.teams,
        odds=request.odds,
        bet_weights=request.bet_weights,
        base_amount=request.base_amount,
    )

    scenario = Scenario(
        base_amount=result["base_amount"],
        total_bet=result["total_bet"],
        data=result,
    )

    session.add(scenario)
    session.commit()
    session.refresh(scenario)

    return scenario

@router.get("/", response_model=List[ScenarioSaveResponse])
def list_scenarios_endpoint(
    session: Session = Depends(get_session),
):
    scenarios = session.exec(select(Scenario)).all()
    return scenarios


@router.get("/{scenario_id}", response_model=ScenarioSaveResponse)
def get_scenario_endpoint(
    scenario_id: int,
    session: Session = Depends(get_session),
):
    scenario = session.get(Scenario, scenario_id)

    if scenario is None:
        raise HTTPException(
            status_code=404,
            detail="Scenario not found",
        )

    return scenario

@router.delete("/{scenario_id}")
def delete_scenario_endpoint(
    scenario_id: int,
    session: Session = Depends(get_session),
):
    scenario = session.get(Scenario, scenario_id)

    if scenario is None:
        raise HTTPException(
            status_code=404,
            detail="Scenario not found",
        )

    session.delete(scenario)
    session.commit()

    return {"message": "Scenario deleted successfully"}

@router.put("/{scenario_id}", response_model=ScenarioSaveResponse)
def update_scenario_endpoint(
    scenario_id: int,
    request: ScenarioCalculateRequest,
    session: Session = Depends(get_session),
    service: ScenarioService = Depends(get_scenario_service),
):
    scenario = session.get(Scenario, scenario_id)

    if scenario is None:
        raise HTTPException(
            status_code=404,
            detail="Scenario not found",
        )

    result = service.calculate(
        teams=request.teams,
        odds=request.odds,
        bet_weights=request.bet_weights,
        base_amount=request.base_amount,
    )

    scenario.base_amount = result["base_amount"]
    scenario.total_bet = result["total_bet"]
    scenario.data = result

    session.add(scenario)
    session.commit()
    session.refresh(scenario)

    return scenario