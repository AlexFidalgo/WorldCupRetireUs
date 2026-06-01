from abc import ABC, abstractmethod
from typing import List

from app.schemas import OddCreateRequest


class OddsProvider(ABC):
    @abstractmethod
    def fetch_winner_odds(self) -> List[OddCreateRequest]:
        pass