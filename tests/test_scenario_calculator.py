from app.services.scenario_calculator import calculate_scenario


def test_calculate_scenario_basic():
    teams = ["Brazil", "Argentina"]

    odds = {
        "Brazil": {"Bet365": 6.5},
        "Argentina": {"Bet365": 8.0},
    }

    bet_weights = {
        "Brazil": 2,
        "Argentina": 1,
    }

    result = calculate_scenario(
        teams=teams,
        odds=odds,
        bet_weights=bet_weights,
        base_amount=10,
    )

    assert result["total_bet"] == 30

    assert len(result["rows"]) == 2

    brazil = result["rows"][0]

    assert brazil["team"] == "Brazil"
    assert brazil["bet_amount"] == 20
    assert brazil["best_odd"] == 6.5