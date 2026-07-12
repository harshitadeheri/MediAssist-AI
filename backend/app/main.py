from fastapi import FastAPI

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router

app = FastAPI(
    title="MediAssist AI",
    version="1.0.0",
    description="AI-powered Healthcare Assistant"
)

app.include_router(auth_router)
app.include_router(users_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to MediAssist AI 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }