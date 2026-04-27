from fastapi import FastAPI

from app.database import create_db_and_tables
from app.routers import scenarios


app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"message": "WorldCupRetireUs API is running"}


app.include_router(scenarios.router)

@app.get("/items/")
def read_items(name: str, price: float = 0.0, in_stock: bool = True):
    return {
        "name": name,
        "price": price,
        "in_stock": in_stock
    }

@app.get("/items/{item_id}/")
def read_items_with_id(item_id: int, name: str, price: float = 0.0, in_stock: bool = True):
    return {
        "item_id": item_id,
        "name": name,
        "price": price,
        "in_stock": in_stock
    }