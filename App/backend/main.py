from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import database, create_db_and_tables
from .routers import users, places

app = FastAPI(
    title="Quadra API",
    description="API para la aplicación Quadra - comida real, para gente real",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()
    await database.connect()

@app.on_event("shutdown")
async def on_shutdown():
    await database.disconnect()

app.include_router(users.router)
app.include_router(places.router)

@app.get("/")
async def root():
    return {
        "message": "Bienvenido a Quadra API",
        "version": "1.0.0",
        "description": "comida real, para gente real"
    }
