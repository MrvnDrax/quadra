from fastapi import APIRouter, HTTPException, Depends, status, Form
from sqlmodel import select
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import Optional
from datetime import datetime, timedelta
import os

from ..database import database
from ..models import User

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
async def register(
    username: str = Form(...),      # Recibe username por formulario
    password: str = Form(...),      # Recibe password por formulario
    avatar: Optional[str] = Form(None),  # Recibe avatar opcional
):
    query = select(User).where(User.username == username)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    hashed_password = get_password_hash(password)
    user = User(
        username=username,
        email=username,  # aquí asumes que username es email
        hashed_password=hashed_password,
        avatar=avatar
    )

    user_dict = user.dict(exclude={"id"})
    query = User.__table__.insert().values(**user_dict)
    await database.execute(query)

    return {"msg": "Usuario registrado exitosamente"}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    query = select(User).where(User.username == form_data.username)
    user = await database.fetch_one(query)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    query = select(User).where(User.username == username)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"username": user.username, "email": user.email, "avatar": user.avatar}
