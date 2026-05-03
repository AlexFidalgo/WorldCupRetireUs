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