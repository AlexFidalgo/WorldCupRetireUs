from app.services.scenario_calculator import calculate_scenario

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

print(result)