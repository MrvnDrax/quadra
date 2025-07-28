from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    avatar: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    places: List["Place"] = Relationship(back_populates="creator")
    reviews: List["Review"] = Relationship(back_populates="user")

class Place(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str
    category: str = Field(index=True)
    latitude: float
    longitude: float
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    specialties: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    creator_id: Optional[int] = Field(default=None, foreign_key="user.id")
    creator: Optional[User] = Relationship(back_populates="places")
    
    reviews: List["Review"] = Relationship(back_populates="place")

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    user_id: int = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="reviews")
    
    place_id: int = Field(foreign_key="place.id")
    place: Place = Relationship(back_populates="reviews")

class PlaceCreate(SQLModel):
    name: str
    description: str
    category: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    specialties: Optional[List[str]] = None
    image_url: Optional[str] = None

class PlaceUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    specialties: Optional[List[str]] = None
    image_url: Optional[str] = None

class PlaceResponse(SQLModel):
    id: int
    name: str
    description: str
    category: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    specialties: Optional[List[str]] = None
    image_url: Optional[str] = None
    created_at: datetime
    creator_id: Optional[int] = None
    average_rating: Optional[float] = None
    review_count: int = 0

class ReviewCreate(SQLModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    place_id: int

class ReviewResponse(SQLModel):
    id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user_id: int
    username: str
    place_id: int
