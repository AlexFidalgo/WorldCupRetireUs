from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from app.database import create_db_and_tables
from app.routers import scenarios, users, auth, odds


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    create_db_and_tables()
    yield
    # shutdown (optional cleanup)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "WorldCupRetireUs API is running"}


app.include_router(scenarios.router)

app.include_router(users.router)

app.include_router(auth.router)

app.include_router(odds.router)
