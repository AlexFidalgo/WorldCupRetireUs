from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.services.scenario_calculator import ScenarioService, get_scenario_service

from sqlmodel import Session, select

from app.models import Scenario, User

from app.database import get_session

from app.schemas import (
    ScenarioCalculateRequest,
    ScenarioCalculateResponse,
    ScenarioSaveResponse,
    ScenarioPublicResponse,
)

from app.auth.dependencies import get_current_user

from app.services.scenario_mapper import scenario_to_public_response


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
    current_user: User = Depends(get_current_user),
):
    result = service.calculate(
        teams=request.teams,
        odds=request.odds,
        bet_weights=request.bet_weights,
        base_amount=request.base_amount,
    )

    scenario = Scenario(
        name=request.name,
        base_amount=result["base_amount"],
        total_bet=result["total_bet"],
        data=result,
        user_id=current_user.id,
    )

    session.add(scenario)
    session.commit()
    session.refresh(scenario)

    return scenario

@router.get("/", response_model=List[ScenarioPublicResponse])
def list_scenarios_endpoint(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
):
    statement = (
        select(Scenario, User)
        .where(Scenario.user_id == User.id)
        .offset(offset)
        .limit(limit)
    )

    results = session.exec(statement).all()

    return [
        scenario_to_public_response(scenario, user.username)
        for scenario, user in results
    ]


@router.get("/{scenario_id}", response_model=ScenarioPublicResponse)
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

    user = session.get(User, scenario.user_id)

    return scenario_to_public_response(scenario, user.username)

@router.delete("/{scenario_id}")
def delete_scenario_endpoint(
    scenario_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    scenario = session.get(Scenario, scenario_id)

    if scenario.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to delete this scenario",
        )

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
    current_user: User = Depends(get_current_user),
):
    scenario = session.get(Scenario, scenario_id)

    if scenario.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to modify this scenario",
        )

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

    scenario.name = request.name
    scenario.base_amount = result["base_amount"]
    scenario.total_bet = result["total_bet"]
    scenario.data = result

    session.add(scenario)
    session.commit()
    session.refresh(scenario)

    return scenario