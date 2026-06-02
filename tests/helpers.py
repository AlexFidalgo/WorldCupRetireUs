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
