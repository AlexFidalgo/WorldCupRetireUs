from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import Odd
from app.schemas import OddCreateRequest, OddResponse


router = APIRouter(
    prefix="/odds",
    tags=["odds"],
)


@router.post("/", response_model=OddResponse)
def create_odd_endpoint(
    request: OddCreateRequest,
    session: Session = Depends(get_session),
):
    odd = Odd(
        team=request.team,
        platform=request.platform,
        market=request.market,
        odd=request.odd,
        source_url=request.source_url,
    )

    session.add(odd)
    session.commit()
    session.refresh(odd)

    return odd

@router.get("/", response_model=List[OddResponse])
def list_odds_endpoint(
    session: Session = Depends(get_session),
):
    statement = select(Odd)
    odds = session.exec(statement).all()
    return odds

@router.get("/", response_model=List[OddResponse])
def list_odds_endpoint(
    team: Optional[str] = Query(default=None),
    platform: Optional[str] = Query(default=None),
    market: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    statement = select(Odd)

    if team is not None:
        statement = statement.where(Odd.team == team)

    if platform is not None:
        statement = statement.where(Odd.platform == platform)

    if market is not None:
        statement = statement.where(Odd.market == market)

    odds = session.exec(statement).all()

    return odds