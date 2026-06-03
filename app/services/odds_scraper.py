from sqlalchemy import func
from sqlmodel import Session, select

from app.models import Odd
from app.scrapers.base import OddsProvider


class OddsScraperService:
    def scrape_winner_odds(
        self,
        provider: OddsProvider,
        session: Session,
    ) -> list[Odd]:
        scraped_odds = provider.fetch_winner_odds()

        saved_odds = []

        for scraped_odd in scraped_odds:
            statement = select(Odd).where(
                func.lower(Odd.team) == scraped_odd.team.lower(),
                Odd.platform == scraped_odd.platform,
                Odd.market == scraped_odd.market,
            )

            existing_odd = session.exec(statement).first()

            if existing_odd is not None:
                existing_odd.team = scraped_odd.team  # normalize casing
                existing_odd.odd = scraped_odd.odd
                existing_odd.source_url = scraped_odd.source_url
                session.add(existing_odd)
                saved_odds.append(existing_odd)
                continue

            odd = Odd(
                team=scraped_odd.team,
                platform=scraped_odd.platform,
                market=scraped_odd.market,
                odd=scraped_odd.odd,
                source_url=scraped_odd.source_url,
            )

            session.add(odd)
            saved_odds.append(odd)

        session.commit()

        for odd in saved_odds:
            session.refresh(odd)

        return saved_odds


def get_odds_scraper_service():
    return OddsScraperService()