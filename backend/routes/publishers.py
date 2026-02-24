"""
API-Routen für Publishers – CRUD.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import PublisherCreate, PublisherUpdate
from services import mongo_service

router = APIRouter(prefix="/api/publishers", tags=["Publishers"])


@router.post("/", status_code=201)
async def create_publisher(publisher: PublisherCreate):
    return await mongo_service.create_one("publishers", publisher.model_dump())


@router.get("/")
async def get_publishers():
    return await mongo_service.get_all("publishers")


@router.get("/revenue")
async def get_revenue_stats():
    """Umsatz pro Publisher (Aggregation-Pipeline)."""
    return await mongo_service.get_revenue_per_publisher()


@router.get("/{publisher_id}")
async def get_publisher(publisher_id: str):
    pub = await mongo_service.get_one("publishers", publisher_id)
    if not pub:
        raise HTTPException(status_code=404, detail="Publisher nicht gefunden")
    return pub


@router.put("/{publisher_id}")
async def update_publisher(publisher_id: str, publisher: PublisherUpdate):
    result = await mongo_service.update_one("publishers", publisher_id, publisher.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail="Publisher nicht gefunden")
    return result


@router.delete("/{publisher_id}")
async def delete_publisher(publisher_id: str):
    deleted = await mongo_service.delete_one("publishers", publisher_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Publisher nicht gefunden")
    return {"message": "Publisher gelöscht", "id": publisher_id}
