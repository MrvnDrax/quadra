from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlmodel import select, func
from typing import List, Optional
from jose import jwt, JWTError
import json
from datetime import datetime

from ..database import database
from ..models import Place, User, Review, PlaceCreate, PlaceUpdate, PlaceResponse, ReviewCreate, ReviewResponse
from .users import oauth2_scheme, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/places", tags=["places"])

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
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
    
    return user

async def get_current_user_optional(token: str = Depends(oauth2_scheme)) -> Optional[User]:
    try:
        return await get_current_user(token)
    except HTTPException:
        return None

@router.get("/", response_model=List[PlaceResponse])
async def get_places(
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    search: Optional[str] = Query(None, description="Buscar por nombre o descripción"),
    lat: Optional[float] = Query(None, description="Latitud para búsqueda por proximidad"),
    lng: Optional[float] = Query(None, description="Longitud para búsqueda por proximidad"),
    radius: Optional[float] = Query(10.0, description="Radio en km para búsqueda por proximidad"),
    limit: int = Query(50, le=100, description="Límite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginación")
):
    query = select(Place).where(Place.is_active == True)
    
    if category:
        query = query.where(Place.category.ilike(f"%{category}%"))
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Place.name.ilike(search_term)) |
            (Place.description.ilike(search_term)) |
            (Place.specialties.ilike(search_term))
        )
    
    query = query.offset(offset).limit(limit)
    
    places = await database.fetch_all(query)
    
    places_response = []
    for place in places:
        rating_query = select(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count")
        ).where(Review.place_id == place.id)
        
        rating_result = await database.fetch_one(rating_query)
        avg_rating = float(rating_result.avg_rating) if rating_result.avg_rating else None
        review_count = rating_result.review_count or 0
        
        specialties = None
        if place.specialties:
            try:
                specialties = json.loads(place.specialties)
            except json.JSONDecodeError:
                specialties = []
        
        place_response = PlaceResponse(
            id=place.id,
            name=place.name,
            description=place.description,
            category=place.category,
            latitude=place.latitude,
            longitude=place.longitude,
            address=place.address,
            phone=place.phone,
            website=place.website,
            specialties=specialties,
            image_url=place.image_url,
            created_at=place.created_at,
            creator_id=place.creator_id,
            average_rating=avg_rating,
            review_count=review_count
        )
        places_response.append(place_response)
    
    return places_response

@router.get("/{place_id}", response_model=PlaceResponse)
async def get_place(place_id: int):
    """Obtener un lugar específico por ID"""
    query = select(Place).where(Place.id == place_id, Place.is_active == True)
    place = await database.fetch_one(query)
    
    if not place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")
    
    rating_query = select(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("review_count")
    ).where(Review.place_id == place.id)
    
    rating_result = await database.fetch_one(rating_query)
    avg_rating = float(rating_result.avg_rating) if rating_result.avg_rating else None
    review_count = rating_result.review_count or 0
    
    specialties = None
    if place.specialties:
        try:
            specialties = json.loads(place.specialties)
        except json.JSONDecodeError:
            specialties = []
    
    return PlaceResponse(
        id=place.id,
        name=place.name,
        description=place.description,
        category=place.category,
        latitude=place.latitude,
        longitude=place.longitude,
        address=place.address,
        phone=place.phone,
        website=place.website,
        specialties=specialties,
        image_url=place.image_url,
        created_at=place.created_at,
        creator_id=place.creator_id,
        average_rating=avg_rating,
        review_count=review_count
    )

@router.post("/", response_model=PlaceResponse, status_code=status.HTTP_201_CREATED)
async def create_place(
    place_data: PlaceCreate,
    current_user: User = Depends(get_current_user)
):
    """Crear un nuevo lugar"""
    
    query = select(Place).where(
        Place.name.ilike(f"%{place_data.name}%"),
        Place.is_active == True,
        func.abs(Place.latitude - place_data.latitude) < 0.001,
        func.abs(Place.longitude - place_data.longitude) < 0.001
    )
    existing_place = await database.fetch_one(query)
    
    if existing_place:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un lugar con nombre similar en esta ubicación"
        )
    
    specialties_json = None
    if place_data.specialties:
        specialties_json = json.dumps(place_data.specialties)
    
    place = Place(
        name=place_data.name,
        description=place_data.description,
        category=place_data.category,
        latitude=place_data.latitude,
        longitude=place_data.longitude,
        address=place_data.address,
        phone=place_data.phone,
        website=place_data.website,
        specialties=specialties_json,
        image_url=place_data.image_url,
        creator_id=current_user.id
    )
    
    place_dict = place.dict(exclude={"id"})
    query = Place.__table__.insert().values(**place_dict)
    place_id = await database.execute(query)
    
    return await get_place(place_id)

@router.put("/{place_id}", response_model=PlaceResponse)
async def update_place(
    place_id: int,
    place_data: PlaceUpdate,
    current_user: User = Depends(get_current_user)
):
    """Actualizar un lugar existente"""
    
    query = select(Place).where(Place.id == place_id, Place.is_active == True)
    existing_place = await database.fetch_one(query)
    
    if not existing_place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")
    
    if existing_place.creator_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para editar este lugar"
        )
    
    update_data = place_data.dict(exclude_unset=True)
    
    if "specialties" in update_data and update_data["specialties"] is not None:
        update_data["specialties"] = json.dumps(update_data["specialties"])
    
    update_data["updated_at"] = datetime.utcnow()
    
    query = Place.__table__.update().where(Place.id == place_id).values(**update_data)
    await database.execute(query)
    
    return await get_place(place_id)

@router.delete("/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_place(
    place_id: int,
    current_user: User = Depends(get_current_user)
):
    """Eliminar un lugar (soft delete)"""
    
    query = select(Place).where(Place.id == place_id, Place.is_active == True)
    existing_place = await database.fetch_one(query)
    
    if not existing_place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")
    
    if existing_place.creator_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar este lugar"
        )
    
    query = Place.__table__.update().where(Place.id == place_id).values(
        is_active=False,
        updated_at=datetime.utcnow()
    )
    await database.execute(query)

@router.get("/categories/", response_model=List[str])
async def get_categories():
    """Obtener lista de categorías únicas"""
    query = select(Place.category).distinct().where(Place.is_active == True)
    categories = await database.fetch_all(query)
    return [cat.category for cat in categories if cat.category]

@router.post("/{place_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    place_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user)
):
    """Crear una reseña para un lugar"""
    
    query = select(Place).where(Place.id == place_id, Place.is_active == True)
    place = await database.fetch_one(query)
    
    if not place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")
    
    query = select(Review).where(
        Review.user_id == current_user.id,
        Review.place_id == place_id
    )
    existing_review = await database.fetch_one(query)
    
    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="Ya has reseñado este lugar"
        )
    
    review = Review(
        rating=review_data.rating,
        comment=review_data.comment,
        user_id=current_user.id,
        place_id=place_id
    )
    
    review_dict = review.dict(exclude={"id"})
    query = Review.__table__.insert().values(**review_dict)
    review_id = await database.execute(query)
    
    query = select(Review, User.username).join(User).where(Review.id == review_id)
    review_with_user = await database.fetch_one(query)
    
    return ReviewResponse(
        id=review_with_user.id,
        rating=review_with_user.rating,
        comment=review_with_user.comment,
        created_at=review_with_user.created_at,
        user_id=review_with_user.user_id,
        username=review_with_user.username,
        place_id=review_with_user.place_id
    )

@router.get("/{place_id}/reviews", response_model=List[ReviewResponse])
async def get_place_reviews(
    place_id: int,
    limit: int = Query(20, le=50),
    offset: int = Query(0, ge=0)
):
    """Obtener reseñas de un lugar"""
    
    query = select(Place).where(Place.id == place_id, Place.is_active == True)
    place = await database.fetch_one(query)
    
    if not place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")
    
    query = select(Review, User.username).join(User).where(
        Review.place_id == place_id
    ).order_by(Review.created_at.desc()).offset(offset).limit(limit)
    
    reviews = await database.fetch_all(query)
    
    return [
        ReviewResponse(
            id=review.id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            user_id=review.user_id,
            username=review.username,
            place_id=review.place_id
        )
        for review in reviews
    ]