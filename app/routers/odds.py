from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Odd
from app.schemas import OddCreateRequest, OddResponse, BestOddResponse

from datetime import datetime, timezone



router = APIRouter(
    prefix="/odds",
    tags=["odds"],
)


@router.post("/", response_model=OddResponse)
def create_odd_endpoint(
    request: OddCreateRequest,
    session: Session = Depends(get_session),
):
    statement = select(Odd).where(
        Odd.team == request.team,
        Odd.platform == request.platform,
        Odd.market == request.market,
    )

    existing_odd = session.exec(statement).first()

    if existing_odd is not None:
        existing_odd.odd = request.odd
        existing_odd.source_url = request.source_url
        existing_odd.scraped_at = datetime.now(timezone.utc)

        session.add(existing_odd)
        session.commit()
        session.refresh(existing_odd)

        return existing_odd

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
    team: Optional[str] = Query(default=None),
    platform: Optional[str] = Query(default=None),
    market: Optional[str] = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    sort_by: str = Query(default="scraped_at"),
    sort_order: str = Query(default="desc"),
    session: Session = Depends(get_session),
):
    allowed_sort_fields = {
        "id": Odd.id,
        "team": Odd.team,
        "platform": Odd.platform,
        "market": Odd.market,
        "odd": Odd.odd,
        "scraped_at": Odd.scraped_at,
    }

    if sort_by not in allowed_sort_fields:
        raise HTTPException(status_code=400, detail="Invalid sort_by value")

    if sort_order not in ["asc", "desc"]:
        raise HTTPException(status_code=400, detail="Invalid sort_order value")

    sort_column = allowed_sort_fields[sort_by]

    if sort_order == "desc":
        sort_column = sort_column.desc()

    statement = select(Odd)

    if team is not None:
        statement = statement.where(Odd.team == team)

    if platform is not None:
        statement = statement.where(Odd.platform == platform)

    if market is not None:
        statement = statement.where(Odd.market == market)

    statement = (
        statement
        .order_by(sort_column)
        .offset(offset)
        .limit(limit)
    )

    odds = session.exec(statement).all()

    return odds


@router.get("/best", response_model=List[BestOddResponse])
def list_best_odds_endpoint(
    market: str = Query(default="winner"),
    session: Session = Depends(get_session),
):
    statement = select(Odd).where(Odd.market == market)
    odds = session.exec(statement).all()

    best_by_team = {}

    for odd in odds:
        current_best = best_by_team.get(odd.team)

        if current_best is None or odd.odd > current_best.odd:
            best_by_team[odd.team] = odd

    return [
        BestOddResponse(
            team=odd.team,
            best_platform=odd.platform,
            best_odd=odd.odd,
            market=odd.market,
        )
        for odd in best_by_team.values()
    ]
