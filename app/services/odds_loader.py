from fastapi import HTTPException
from sqlmodel import Session, select

from app.models import Odd


def build_odds_dict_from_db(
    session: Session,
    teams: list[str],
    market: str,
) -> dict[str, dict[str, float]]:
    statement = select(Odd).where(Odd.market == market)
    odds_in_market = session.exec(statement).all()

    odds = {}

    for odd in odds_in_market:
        if odd.team not in teams:
            continue

        if odd.team not in odds:
            odds[odd.team] = {}

        odds[odd.team][odd.platform] = odd.odd

    missing_teams = [
        team for team in teams
        if team not in odds or not odds[team]
    ]

    if missing_teams:
        raise HTTPException(
            status_code=400,
            detail=f"Missing odds for teams: {', '.join(missing_teams)}",
        )

    return odds