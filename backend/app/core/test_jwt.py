from app.core.security import create_access_token

data = {
    "sub": "harshita.deheri13@gmail.com"
}

token = create_access_token(data)

print("JWT Token:\n")
print(token)