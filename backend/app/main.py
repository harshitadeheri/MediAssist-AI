from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.reports import router as reports_router
from app.api.v1.cbc import router as cbc_router
from app.api.v1.chatbot import router as chatbot_router

app = FastAPI(
    title="MediAssist AI",
    version="1.0.0",
    description="AI-powered Healthcare Assistant",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API Routers
# --------------------------------------------------

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(reports_router)
app.include_router(cbc_router)
app.include_router(chatbot_router)


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to MediAssist AI 🚀"
    }


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }
