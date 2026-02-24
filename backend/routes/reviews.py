"""
API-Routen für Reviews – CRUD.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import ReviewCreate, ReviewUpdate
from services import mongo_service

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post("/", status_code=201)
async def create_review(review: ReviewCreate):
    """Erstellt eine neue Review."""
    return await mongo_service.create_one("reviews", review.model_dump())


@router.get("/")
async def get_reviews(limit: int = 100, skip: int = 0):
    """Listet alle Reviews auf."""
    return await mongo_service.get_all("reviews", limit=limit, skip=skip)


@router.get("/{review_id}")
async def get_review(review_id: str):
    review = await mongo_service.get_one("reviews", review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review nicht gefunden")
    return review


@router.put("/{review_id}")
async def update_review(review_id: str, review: ReviewUpdate):
    result = await mongo_service.update_one("reviews", review_id, review.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail="Review nicht gefunden")
    return result


@router.delete("/{review_id}")
async def delete_review(review_id: str):
    deleted = await mongo_service.delete_one("reviews", review_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Review nicht gefunden")
    return {"message": "Review gelöscht", "id": review_id}
