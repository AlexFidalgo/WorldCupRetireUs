from conftest import create_user_and_login

def test_calculate_scenario_from_stored_odds(client):
    client.post(
        "/odds/",
        json={
            "team": "Brazil",
            "platform": "Bet365",
            "market": "winner",
            "odd": 6.5,
            "source_url": "https://example.com/brazil-bet365",
        },
    )

    client.post(
        "/odds/",
        json={
            "team": "Brazil",
            "platform": "Betano",
            "market": "winner",
            "odd": 6.0,
            "source_url": "https://example.com/brazil-betano",
        },
    )

    client.post(
        "/odds/",
        json={
            "team": "Argentina",
            "platform": "Bet365",
            "market": "winner",
            "odd": 8.0,
            "source_url": "https://example.com/argentina-bet365",
        },
    )

    response = client.post(
        "/scenarios/calculate-from-odds",
        json={
            "teams": ["Brazil", "Argentina"],
            "bet_weights": {
                "Brazil": 2,
                "Argentina": 1,
            },
            "base_amount": 10,
            "market": "winner",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["base_amount"] == 10
    assert data["total_bet"] == 30

    assert len(data["rows"]) == 2

    brazil = data["rows"][0]
    argentina = data["rows"][1]

    assert brazil["team"] == "Brazil"
    assert brazil["best_company"] == "Bet365"
    assert brazil["best_odd"] == 6.5

    assert argentina["team"] == "Argentina"
    assert argentina["best_company"] == "Bet365"
    assert argentina["best_odd"] == 8.0

def test_calculate_scenario_from_odds_returns_400_when_team_has_no_odds(client):
    client.post(
        "/odds/",
        json={
            "team": "Brazil",
            "platform": "Bet365",
            "market": "winner",
            "odd": 6.5,
            "source_url": "https://example.com/brazil-bet365",
        },
    )

    response = client.post(
        "/scenarios/calculate-from-odds",
        json={
            "teams": ["Brazil", "Argentina"],
            "bet_weights": {
                "Brazil": 2,
                "Argentina": 1,
            },
            "base_amount": 10,
            "market": "winner",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Missing odds for teams: Argentina"

def test_save_scenario_from_stored_odds(client):
    headers = create_user_and_login(client, "alex")

    client.post(
        "/odds/",
        json={
            "team": "Brazil",
            "platform": "Bet365",
            "market": "winner",
            "odd": 6.5,
            "source_url": "https://example.com/brazil-bet365",
        },
    )

    client.post(
        "/odds/",
        json={
            "team": "Argentina",
            "platform": "Bet365",
            "market": "winner",
            "odd": 8.0,
            "source_url": "https://example.com/argentina-bet365",
        },
    )

    response = client.post(
        "/scenarios/save-from-odds",
        json={
            "name": "Stored odds scenario",
            "teams": ["Brazil", "Argentina"],
            "bet_weights": {
                "Brazil": 2,
                "Argentina": 1,
            },
            "base_amount": 10,
            "market": "winner",
        },
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Stored odds scenario"
    assert data["base_amount"] == 10
    assert data["total_bet"] == 30
    assert data["data"]["rows"][0]["team"] == "Brazil"
    assert data["data"]["rows"][1]["team"] == "Argentina"

def test_save_scenario_from_odds_requires_authentication(client):
    client.post(
        "/odds/",
        json={
            "team": "Brazil",
            "platform": "Bet365",
            "market": "winner",
            "odd": 6.5,
            "source_url": "https://example.com/brazil-bet365",
        },
    )

    response = client.post(
        "/scenarios/save-from-odds",
        json={
            "name": "Stored odds scenario",
            "teams": ["Brazil"],
            "bet_weights": {
                "Brazil": 2,
            },
            "base_amount": 10,
            "market": "winner",
        },
    )

    assert response.status_code == 401

def test_save_scenario_from_odds_returns_400_when_team_has_no_odds(client):
    headers = create_user_and_login(client, "alex")

    client.post(
        "/odds/",
        json={
            "team": "Brazil",
            "platform": "Bet365",
            "market": "winner",
            "odd": 6.5,
            "source_url": "https://example.com/brazil-bet365",
        },
    )

    response = client.post(
        "/scenarios/save-from-odds",
        json={
            "name": "Stored odds scenario",
            "teams": ["Brazil", "Argentina"],
            "bet_weights": {
                "Brazil": 2,
                "Argentina": 1,
            },
            "base_amount": 10,
            "market": "winner",
        },
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Missing odds for teams: Argentina"