"""
API-Routen für Empfehlungen und Analysen.

Integrations-Use-Cases: Neo4j-Graph → MongoDB-Details → Kombiniert.
"""

from fastapi import APIRouter
from services import neo4j_service, integration_service

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations & Analytics"])


# ── Integrations-Use-Cases (Neo4j → MongoDB) ──

@router.get("/{user_id}/friends")
async def get_friend_recommendations(user_id: str, limit: int = 10):
    """
    🔗 INTEGRATIONS-USE-CASE: Spielempfehlungen basierend auf Freundes-Graph.

    1. Neo4j: Traversiere Freundes-Graph → finde Spiel-IDs
    2. MongoDB: Lade vollständige Spiel-Details
    3. Ergebnis: Empfehlungen mit Begründung
    """
    return await integration_service.get_friend_recommendations(user_id, limit)


@router.get("/{user_id}/gaming-buddies")
async def get_gaming_buddies(user_id: str, limit: int = 5):
    """Potenzielle Gaming-Buddies (Neo4j → MongoDB Profile)."""
    return await integration_service.get_gaming_buddies_with_profiles(user_id, limit)


# ── Graph-Analysen (Neo4j) ─────────────────

@router.get("/analytics/popular-tags/{user_id}")
async def get_popular_tags(user_id: str):
    """Beliebteste Tags im Freundeskreis."""
    return await neo4j_service.popular_tags_in_network(user_id)


@router.get("/games/{game_id}/similar")
async def get_similar_games(game_id: str, limit: int = 5):
    """
    Aehnliche Spiele basierend auf Neo4j-Graph.
    
    Nutzt 'Spieler die X kauften, kauften auch Y' Logik.
    """
    return await integration_service.get_similar_games_with_details(game_id, limit)


@router.get("/games/{game_id}/similar-by-tags")
async def get_similar_games_by_tags(game_id: str, limit: int = 5):
    """
    AEhnliche Spiele basierend auf gemeinsamen Tags.
    """
    return await integration_service.get_similar_games_by_tags_with_details(game_id, limit)
