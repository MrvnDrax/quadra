import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine
from databases import Database

load_dotenv()

DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_NAME = os.getenv("DATABASE_NAME")

ASYNC_DATABASE_URL = f"postgresql+asyncpg://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}/{DATABASE_NAME}"
SYNC_DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}/{DATABASE_NAME}"

database = Database(ASYNC_DATABASE_URL)
sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(sync_engine)
