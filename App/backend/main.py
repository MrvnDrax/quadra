from fastapi import FastAPI
from database import database, create_db_and_tables

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    await database.connect()
    create_db_and_tables()

@app.on_event("shutdown")
async def on_shutdown():
    await database.disconnect()

@app.get("/")
async def root():
    return {"message": "¡Backend Quadra está corriendo!"}
