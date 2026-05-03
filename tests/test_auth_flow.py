


def test_create_user_and_login(client):
    create_response = client.post(
        "/users/",
        json={
            "username": "testuser",
            "password": "testpassword",
        },
    )

    assert create_response.status_code == 200

    user_data = create_response.json()

    assert user_data["username"] == "testuser"
    assert "id" in user_data
    assert "password" not in user_data
    assert "hashed_password" not in user_data

    login_response = client.post(
        "/auth/login",
        data={
            "username": "testuser",
            "password": "testpassword",
        },
    )

    assert login_response.status_code == 200

    token_data = login_response.json()

    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"