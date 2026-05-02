from app.models import Scenario


def scenario_to_public_response(scenario: Scenario, username: str) -> dict:
    return {
        "id": scenario.id,
        "name": scenario.name,
        "base_amount": scenario.base_amount,
        "total_bet": scenario.total_bet,
        "data": scenario.data,
        "user_id": scenario.user_id,
        "username": username,
    }