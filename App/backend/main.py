from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from backend.database import database, create_db_and_tables
from .routers import users

app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
