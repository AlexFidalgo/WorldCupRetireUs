from fastapi import FastAPI

from contextlib import asynccontextmanager

from app.database import create_db_and_tables
from app.routers import scenarios, users, auth, odds

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    create_db_and_tables()
    yield
    # shutdown (optional cleanup)

app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"message": "WorldCupRetireUs API is running"}


app.include_router(scenarios.router)

app.include_router(users.router)

app.include_router(auth.router)

app.include_router(odds.router)