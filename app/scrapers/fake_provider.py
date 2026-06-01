from app.schemas import OddCreateRequest
from app.scrapers.base import OddsProvider


class FakeOddsProvider(OddsProvider):
    def fetch_winner_odds(self) -> list[OddCreateRequest]:
        return [
            OddCreateRequest(
                team="Brazil",
                platform="FakeBook",
                market="winner",
                odd=6.5,
                source_url="https://example.com/fake/brazil",
            ),
            OddCreateRequest(
                team="Argentina",
                platform="FakeBook",
                market="winner",
                odd=8.0,
                source_url="https://example.com/fake/argentina",
            ),
        ]