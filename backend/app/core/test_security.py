from app.core.security import hash_password, verify_password

password = "harshita123"

hashed = hash_password(password)

print("Original :", password)
print("Hashed   :", hashed)

print(
    verify_password(
        "harshita123",
        hashed
    )
)

print(
    verify_password(
        "wrongpassword",
        hashed
    )
)