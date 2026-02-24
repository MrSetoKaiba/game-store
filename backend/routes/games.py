"""
API-Routen für Games – vollständige CRUD-Funktionalität.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import GameCreate, GameUpdate
from services import mongo_service, neo4j_service

router = APIRouter(prefix="/api/games", tags=["Games"])


@router.post("/", status_code=201)
async def create_game(game: GameCreate):
    """Erstellt ein neues Spiel in MongoDB + Neo4j."""
    result = await mongo_service.create_one("games", game.model_dump())
    await neo4j_service.create_game_node(result["_id"], game.tag_names)
    return result


@router.get("/")
async def get_games(limit: int = 100, skip: int = 0):
    """Listet alle Spiele auf (mit Pagination)."""
    return await mongo_service.get_all("games", limit=limit, skip=skip)


@router.get("/top-rated")
async def get_top_rated(limit: int = 10):
    """Bestbewertete Spiele (Aggregation-Pipeline)."""
    return await mongo_service.get_top_rated_games(limit)


@router.get("/platform-stats")
async def get_platform_stats():
    """Statistiken pro Plattform (Aggregation-Pipeline)."""
    return await mongo_service.get_platform_statistics()


@router.get("/{game_id}")
async def get_game(game_id: str):
    """Gibt ein einzelnes Spiel zurück."""
    game = await mongo_service.get_one("games", game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Spiel nicht gefunden")
    return game


@router.get("/{game_id}/also-bought")
async def get_also_bought(game_id: str, limit: int = 5):
    """'Spieler kauften auch...' (Neo4j → MongoDB Integration)."""
    from services import integration_service
    return await integration_service.get_also_bought_with_details(game_id, limit)


@router.put("/{game_id}")
async def update_game(game_id: str, game: GameUpdate):
    """Aktualisiert ein Spiel."""
    result = await mongo_service.update_one("games", game_id, game.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail="Spiel nicht gefunden")
    return result


@router.delete("/{game_id}")
async def delete_game(game_id: str):
    """Löscht ein Spiel aus MongoDB + Neo4j."""
    deleted = await mongo_service.delete_one("games", game_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Spiel nicht gefunden")
    await neo4j_service.delete_game_node(game_id)
    return {"message": "Spiel gelöscht", "id": game_id}
