from typing import Dict, List
class ScenarioService:
    def calculate(
        self,
        teams,
        odds,
        bet_weights,
        base_amount,
    ):
        return calculate_scenario(
            teams=teams,
            odds=odds,
            bet_weights=bet_weights,
            base_amount=base_amount,
        )
    
def get_scenario_service():
    return ScenarioService()

def calculate_scenario(
    teams: List[str],
    odds: Dict[str, Dict[str, float]],
    bet_weights: Dict[str, float],
    base_amount: float,
) -> Dict:
    """
    Calculates the betting scenario.

    teams:
        List of team names.

    odds:
        Example:
        {
            "Brazil": {
                "Bet365": 6.5,
                "Betano": 6.0,
                "Superbet": 6.75,
            }
        }

    bet_weights:
        Equivalent to your Excel P column.
        Example:
        {
            "Brazil": 2,
            "Argentina": 1,
            "France": 0,
        }

    base_amount:
        Equivalent to your Excel S1 cell.
        If base_amount = 10 and Brazil weight = 2,
        Brazil bet amount = 20.
    """

    rows = []

    total_bet = sum(
        bet_weights.get(team, 0) * base_amount
        for team in teams
    )

    for team in teams:
        team_odds = odds.get(team, {})

        if not team_odds:
            best_odd = 0
            best_company = None
        else:
            best_company = max(team_odds, key=team_odds.get)
            best_odd = team_odds[best_company]

        weight = bet_weights.get(team, 0)
        bet_amount = weight * base_amount
        gross_return = bet_amount * best_odd
        net_result = gross_return - total_bet

        rows.append(
            {
                "team": team,
                "odds": team_odds,
                "best_company": best_company,
                "best_odd": best_odd,
                "weight": weight,
                "bet_amount": bet_amount,
                "gross_return": gross_return,
                "net_result": net_result,
            }
        )

    return {
        "base_amount": base_amount,
        "total_bet": total_bet,
        "rows": rows,
    }
