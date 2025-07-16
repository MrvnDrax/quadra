import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine
from databases import Database

# Cargar variables de entorno
load_dotenv()

DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Conexiones: una asíncrona para usar con FastAPI, otra síncrona para crear tablas
ASYNC_DATABASE_URL = f"postgresql+asyncpg://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}/{DATABASE_NAME}"
SYNC_DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}/{DATABASE_NAME}"

# FastAPI usará esta
database = Database(ASYNC_DATABASE_URL)

# Este engine solo se usa para crear las tablas al inicio
sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(sync_engine)
