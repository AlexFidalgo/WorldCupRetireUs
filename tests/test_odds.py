def create_odd_payload(
    team: str = "Brazil",
    platform: str = "Bet365",
    market: str = "winner",
    odd: float = 6.5,
    source_url: str = "https://example.com/brazil",
):
    return {
        "team": team,
        "platform": platform,
        "market": market,
        "odd": odd,
        "source_url": source_url,
    }


def test_create_odd(client):
    response = client.post(
        "/odds/",
        json=create_odd_payload(),
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert data["team"] == "Brazil"
    assert data["platform"] == "Bet365"
    assert data["market"] == "winner"
    assert data["odd"] == 6.5
    assert data["source_url"] == "https://example.com/brazil"
    assert "scraped_at" in data


def test_list_odds(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Argentina", "Betano", "winner", 8.0))

    response = client.get("/odds/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2


def test_filter_odds_by_team(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Argentina", "Betano", "winner", 8.0))

    response = client.get("/odds/?team=Brazil")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["team"] == "Brazil"


def test_filter_odds_by_platform(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Brazil", "Betano", "winner", 6.0))

    response = client.get("/odds/?platform=Betano")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["platform"] == "Betano"


def test_filter_odds_by_market(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "group_winner", 2.1))

    response = client.get("/odds/?market=group_winner")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["market"] == "group_winner"


def test_filter_odds_with_multiple_filters(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Brazil", "Betano", "winner", 6.0))
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "group_winner", 2.1))

    response = client.get("/odds/?team=Brazil&platform=Bet365&market=winner")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["team"] == "Brazil"
    assert data[0]["platform"] == "Bet365"
    assert data[0]["market"] == "winner"

def test_list_odds_with_pagination(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Argentina", "Betano", "winner", 8.0))
    client.post("/odds/", json=create_odd_payload("France", "Novibet", "winner", 7.0))

    response = client.get("/odds/?limit=2&offset=0&sort_by=id&sort_order=asc")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["team"] == "Brazil"
    assert data[1]["team"] == "Argentina"

    response = client.get("/odds/?limit=2&offset=2&sort_by=id&sort_order=asc")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["team"] == "France"


def test_list_odds_sorted_by_odd_desc(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Argentina", "Betano", "winner", 8.0))
    client.post("/odds/", json=create_odd_payload("France", "Novibet", "winner", 7.0))

    response = client.get("/odds/?sort_by=odd&sort_order=desc")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 3
    assert data[0]["odd"] == 8.0
    assert data[1]["odd"] == 7.0
    assert data[2]["odd"] == 6.5


def test_list_odds_invalid_sort_by_returns_400(client):
    response = client.get("/odds/?sort_by=invalid_field")

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid sort_by value"


def test_list_odds_invalid_sort_order_returns_400(client):
    response = client.get("/odds/?sort_order=sideways")

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid sort_order value"

def test_create_odd_updates_existing_team_platform_market(client):
    first_response = client.post(
        "/odds/",
        json=create_odd_payload(
            team="Brazil",
            platform="Bet365",
            market="winner",
            odd=6.5,
            source_url="https://example.com/first",
        ),
    )

    assert first_response.status_code == 200

    first_data = first_response.json()

    second_response = client.post(
        "/odds/",
        json=create_odd_payload(
            team="Brazil",
            platform="Bet365",
            market="winner",
            odd=6.1,
            source_url="https://example.com/updated",
        ),
    )

    assert second_response.status_code == 200

    second_data = second_response.json()

    assert second_data["id"] == first_data["id"]
    assert second_data["team"] == "Brazil"
    assert second_data["platform"] == "Bet365"
    assert second_data["market"] == "winner"
    assert second_data["odd"] == 6.1
    assert second_data["source_url"] == "https://example.com/updated"

    list_response = client.get("/odds/")

    assert list_response.status_code == 200

    all_odds = list_response.json()

    assert len(all_odds) == 1
    assert all_odds[0]["id"] == first_data["id"]
    assert all_odds[0]["odd"] == 6.1
    assert all_odds[0]["source_url"] == "https://example.com/updated"


def test_list_best_odds_returns_best_odd_per_team(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Brazil", "Betano", "winner", 6.0))
    client.post("/odds/", json=create_odd_payload("Brazil", "Novibet", "winner", 6.8))

    client.post("/odds/", json=create_odd_payload("Argentina", "Bet365", "winner", 8.0))
    client.post("/odds/", json=create_odd_payload("Argentina", "Betano", "winner", 7.7))

    response = client.get("/odds/best?market=winner")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    best_by_team = {item["team"]: item for item in data}

    assert best_by_team["Brazil"]["best_platform"] == "Novibet"
    assert best_by_team["Brazil"]["best_odd"] == 6.8
    assert best_by_team["Brazil"]["market"] == "winner"

    assert best_by_team["Argentina"]["best_platform"] == "Bet365"
    assert best_by_team["Argentina"]["best_odd"] == 8.0
    assert best_by_team["Argentina"]["market"] == "winner"


def test_list_best_odds_filters_by_market(client):
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "winner", 6.5))
    client.post("/odds/", json=create_odd_payload("Brazil", "Bet365", "group_winner", 2.1))
    client.post("/odds/", json=create_odd_payload("Brazil", "Betano", "group_winner", 2.3))

    response = client.get("/odds/best?market=group_winner")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["team"] == "Brazil"
    assert data[0]["best_platform"] == "Betano"
    assert data[0]["best_odd"] == 2.3
    assert data[0]["market"] == "group_winner"


def test_list_best_odds_returns_empty_list_when_no_odds_exist(client):
    response = client.get("/odds/best?market=winner")

    assert response.status_code == 200
    assert response.json() == []
