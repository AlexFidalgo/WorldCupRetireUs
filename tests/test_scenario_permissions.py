def create_user_and_login(client, username: str, password: str = "password123"):
    client.post(
        "/users/",
        json={
            "username": username,
            "password": password,
        },
    )

    login_response = client.post(
        "/auth/login",
        data={
            "username": username,
            "password": password,
        },
    )

    token = login_response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def scenario_payload(name: str = "Test scenario"):
    return {
        "name": name,
        "teams": ["Brazil", "Argentina"],
        "odds": {
            "Brazil": {"Bet365": 6.5},
            "Argentina": {"Bet365": 8.0},
        },
        "bet_weights": {
            "Brazil": 2,
            "Argentina": 1,
        },
        "base_amount": 10,
    }


def test_public_can_read_scenarios(client):
    alex_headers = create_user_and_login(client, "alex")

    save_response = client.post(
        "/scenarios/save",
        json=scenario_payload("Alex scenario"),
        headers=alex_headers,
    )

    assert save_response.status_code == 200

    list_response = client.get("/scenarios/")

    assert list_response.status_code == 200

    scenarios = list_response.json()

    assert len(scenarios) == 1
    assert scenarios[0]["name"] == "Alex scenario"
    assert scenarios[0]["username"] == "alex"


def test_user_cannot_update_other_users_scenario(client):
    alex_headers = create_user_and_login(client, "alex")
    bob_headers = create_user_and_login(client, "bob")

    save_response = client.post(
        "/scenarios/save",
        json=scenario_payload("Alex scenario"),
        headers=alex_headers,
    )

    scenario_id = save_response.json()["id"]

    update_response = client.put(
        f"/scenarios/{scenario_id}",
        json=scenario_payload("Bob trying to edit"),
        headers=bob_headers,
    )

    assert update_response.status_code == 403
    assert update_response.json()["detail"] == "Not allowed to modify this scenario"


def test_user_cannot_delete_other_users_scenario(client):
    alex_headers = create_user_and_login(client, "alex")
    bob_headers = create_user_and_login(client, "bob")

    save_response = client.post(
        "/scenarios/save",
        json=scenario_payload("Alex scenario"),
        headers=alex_headers,
    )

    scenario_id = save_response.json()["id"]

    delete_response = client.delete(
        f"/scenarios/{scenario_id}",
        headers=bob_headers,
    )

    assert delete_response.status_code == 403
    assert delete_response.json()["detail"] == "Not allowed to delete this scenario"

def test_list_scenarios_with_pagination(client):
    alex_headers = create_user_and_login(client, "alex")

    for i in range(3):
        response = client.post(
            "/scenarios/save",
            json=scenario_payload(f"Scenario {i + 1}"),
            headers=alex_headers,
        )

        assert response.status_code == 200

    first_page = client.get("/scenarios/?limit=2&offset=0")

    assert first_page.status_code == 200

    first_page_data = first_page.json()

    assert len(first_page_data) == 2
    assert first_page_data[0]["name"] == "Scenario 1"
    assert first_page_data[1]["name"] == "Scenario 2"

    second_page = client.get("/scenarios/?limit=2&offset=2")

    assert second_page.status_code == 200

    second_page_data = second_page.json()

    assert len(second_page_data) == 1
    assert second_page_data[0]["name"] == "Scenario 3"

def test_list_scenarios_sorted_by_base_amount_desc(client):
    alex_headers = create_user_and_login(client, "alex")

    payloads = [
        ("Low", 5),
        ("Medium", 10),
        ("High", 20),
    ]

    for name, base_amount in payloads:
        response = client.post(
            "/scenarios/save",
            json={
                "name": name,
                "teams": ["Brazil"],
                "odds": {"Brazil": {"Bet365": 6.0}},
                "bet_weights": {"Brazil": 1},
                "base_amount": base_amount,
            },
            headers=alex_headers,
        )

        assert response.status_code == 200

    response = client.get(
        "/scenarios/?sort_by=base_amount&sort_order=desc"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 3

    assert data[0]["name"] == "High"
    assert data[1]["name"] == "Medium"
    assert data[2]["name"] == "Low"

def test_filter_scenarios_by_username(client):
    alex_headers = create_user_and_login(client, "alex")
    bob_headers = create_user_and_login(client, "bob")

    # Alex creates 2 scenarios
    client.post(
        "/scenarios/save",
        json=scenario_payload("Alex scenario 1"),
        headers=alex_headers,
    )

    client.post(
        "/scenarios/save",
        json=scenario_payload("Alex scenario 2"),
        headers=alex_headers,
    )

    # Bob creates 1 scenario
    client.post(
        "/scenarios/save",
        json=scenario_payload("Bob scenario"),
        headers=bob_headers,
    )

    # Filter for alex
    response = client.get("/scenarios/?username=alex")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    for scenario in data:
        assert scenario["username"] == "alex"

def test_delete_missing_scenario_returns_404(client):
    headers = create_user_and_login(client, "alex")

    response = client.delete(
        "/scenarios/999",
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Scenario not found"

def test_update_missing_scenario_returns_404(client):
    headers = create_user_and_login(client, "alex")

    response = client.put(
        "/scenarios/999",
        json=scenario_payload("Does not exist"),
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Scenario not found"
