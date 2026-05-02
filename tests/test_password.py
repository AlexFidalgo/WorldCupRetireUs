from app.auth.password import hash_password, verify_password


def test_hash_and_verify_password():
    hashed = hash_password("my_password")

    assert hashed != "my_password"
    assert verify_password("my_password", hashed) is True
    assert verify_password("wrong_password", hashed) is False