from app.auth.password import hash_password, verify_password

hashed = hash_password("my_password")

print(hashed)
print(verify_password("my_password", hashed))
print(verify_password("wrong_password", hashed))