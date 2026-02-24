"""
API-Routen für Users – CRUD + Freundschaften + Bibliothek.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import UserCreate, UserUpdate
from services import mongo_service, neo4j_service

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/", status_code=201)
async def create_user(user: UserCreate):
    """Erstellt einen neuen User in MongoDB + Neo4j."""
    result = await mongo_service.create_one("users", user.model_dump())
    await neo4j_service.create_user_node(result["_id"])
    return result


@router.get("/")
async def get_users(limit: int = 100, skip: int = 0):
    """Listet alle User auf."""
    return await mongo_service.get_all("users", limit=limit, skip=skip)


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Gibt einen einzelnen User zurück."""
    user = await mongo_service.get_one("users", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User nicht gefunden")
    return user


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Ausgaben-Statistiken eines Users (Aggregation)."""
    return await mongo_service.get_user_spending_stats(user_id)


@router.get("/{user_id}/library")
async def get_library(user_id: str):
    """Spielebibliothek eines Users (Neo4j OWNS → MongoDB Details)."""
    game_ids = await neo4j_service.get_user_library(user_id)
    if not game_ids:
        return []
    return await mongo_service.get_many_by_ids("games", game_ids)


@router.get("/{user_id}/friends")
async def get_friends(user_id: str):
    """Freundesliste (Neo4j → MongoDB Profile)."""
    friend_ids = await neo4j_service.get_user_friends(user_id)
    if not friend_ids:
        return []
    return await mongo_service.get_many_by_ids("users", friend_ids)


@router.put("/{user_id}")
async def update_user(user_id: str, user: UserUpdate):
    """Aktualisiert einen User."""
    result = await mongo_service.update_one("users", user_id, user.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail="User nicht gefunden")
    return result


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Löscht einen User aus MongoDB + Neo4j."""
    deleted = await mongo_service.delete_one("users", user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User nicht gefunden")
    await neo4j_service.delete_user_node(user_id)
    return {"message": "User gelöscht", "id": user_id}


# ── Freundschaften ───────────────────────

@router.post("/{user_id}/friends/{friend_id}", status_code=201)
async def add_friend(user_id: str, friend_id: str):
    """Erstellt eine Freundschaft."""
    await neo4j_service.add_friendship(user_id, friend_id)
    return {"message": "Freundschaft erstellt", "users": [user_id, friend_id]}


@router.delete("/{user_id}/friends/{friend_id}")
async def remove_friend(user_id: str, friend_id: str):
    """Entfernt eine Freundschaft."""
    await neo4j_service.remove_friendship(user_id, friend_id)
    return {"message": "Freundschaft entfernt"}
