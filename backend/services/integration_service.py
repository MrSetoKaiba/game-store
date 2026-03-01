"""
Integrations-Service: Verbindet Neo4j und MongoDB.

Zentraler Integrations-Use-Case:
  1. Neo4j führt Graph-Analyse aus (Empfehlungen, Ähnlichkeiten)
  2. Ergebnis-IDs gehen an MongoDB
  3. MongoDB liefert vollständige Dokument-Daten zurück
  4. Beides wird kombiniert zum finalen Ergebnis

Dieses Zusammenspiel demonstriert den Mehrwert der Kombination
beider Datenbanksysteme.
"""

from services import mongo_service, neo4j_service


async def get_friend_recommendations(user_id: str, limit: int = 10) -> list[dict]:
    """
    🔗 INTEGRATIONS-USE-CASE: Spielempfehlungen über Freundes-Graph.

    Ablauf:
      1. Neo4j: Traversiere den Freundes-Graphen → finde Spiel-IDs,
         die Freunde besitzen, aber der User noch nicht
      2. MongoDB: Lade vollständige Spiel-Details (Titel, Preis, Cover etc.)
      3. Kombiniere: Graph-Daten + Spiel-Details = Empfehlung mit Begründung

    Warum beide Datenbanken nötig sind:
      - Neo4j kann effizient über Freundschaftsbeziehungen traversieren
        und gemeinsame Besitzverhältnisse analysieren (Graph-Stärke)
      - MongoDB speichert die reichhaltigen Spiel-Dokumente mit allen
        Details, Bildern, Preisen etc. (Dokument-Stärke)
    """
    # Schritt 1: Neo4j → Empfohlene Spiel-IDs + Graph-Metriken
    recommendations = await neo4j_service.recommend_by_friends(user_id, limit)

    if not recommendations:
        return []

    # Schritt 2: MongoDB → Vollständige Spiel-Details
    game_ids = [r["gameId"] for r in recommendations]
    game_details = await mongo_service.get_many_by_ids("games", game_ids)

    # Freunde-Profildaten laden für die Begründung
    all_friend_ids = set()
    for r in recommendations:
        all_friend_ids.update(r["friendIds"])
    friend_profiles = await mongo_service.get_many_by_ids("users", list(all_friend_ids))
    friend_map = {f["_id"]: f for f in friend_profiles}

    # Schritt 3: Kombinieren
    game_map = {g["_id"]: g for g in game_details}

    enriched = []
    for rec in recommendations:
        game = game_map.get(rec["gameId"])
        if game:
            friend_names = [
                friend_map[fid].get("display_name", friend_map[fid].get("username", "?"))
                for fid in rec["friendIds"] if fid in friend_map
            ]
            enriched.append({
                "game": game,
                "recommendation": {
                    "friend_count": rec["friendCount"],
                    "friends_who_own": friend_names,
                    "reason": f"{rec['friendCount']} deiner Freunde "
                              f"({', '.join(friend_names)}) besitzen dieses Spiel"
                }
            })

    return enriched


async def get_also_bought_with_details(game_id: str, limit: int = 5) -> list[dict]:
    """
    Integrations-Use-Case 2: "Spieler kauften auch..."

    Neo4j findet häufig zusammen besessene Spiele → MongoDB liefert Details.
    """
    # Schritt 1: Neo4j → Spiel-IDs die häufig zusammen besessen werden
    also_bought = await neo4j_service.players_also_bought(game_id, limit)

    if not also_bought:
        return []

    # Schritt 2: MongoDB → Spiel-Details
    game_ids = [r["gameId"] for r in also_bought]
    game_details = await mongo_service.get_many_by_ids("games", game_ids)
    game_map = {g["_id"]: g for g in game_details}

    # Besitzer-Profile laden für die UI
    all_owner_ids = set()
    for ab in also_bought:
        all_owner_ids.update(ab.get("ownerIds", []))
    owner_profiles = await mongo_service.get_many_by_ids("users", list(all_owner_ids))
    owner_map = {p["_id"]: p for p in owner_profiles}

    # Schritt 3: Kombinieren
    enriched = []
    for ab in also_bought:
        game = game_map.get(ab["gameId"])
        if game:
            owner_names = [
                owner_map[oid].get("display_name", owner_map[oid].get("username", "?"))
                for oid in ab.get("ownerIds", []) if oid in owner_map
            ]
            enriched.append({
                "game": game,
                "common_owners": ab["commonOwners"],
                "owner_names": owner_names
            })

    return enriched


async def get_gaming_buddies_with_profiles(user_id: str, limit: int = 5) -> list[dict]:
    """
    Potenzielle Gaming-Buddies mit Profildaten.

    Neo4j findet User mit vielen gemeinsamen Spielen → MongoDB liefert Profile.
    """
    buddies = await neo4j_service.find_gaming_buddies(user_id, limit)

    if not buddies:
        return []

    user_ids = [b["userId"] for b in buddies]
    profiles = await mongo_service.get_many_by_ids("users", user_ids)
    profile_map = {p["_id"]: p for p in profiles}

    # Gemeinsame Spiele-Details laden
    all_game_ids = set()
    for b in buddies:
        all_game_ids.update(b["sharedGameIds"])
    games = await mongo_service.get_many_by_ids("games", list(all_game_ids))
    game_map = {g["_id"]: g for g in games}

    enriched = []
    for b in buddies:
        profile = profile_map.get(b["userId"])
        shared_games = [
            game_map[gid].get("title", "?")
            for gid in b["sharedGameIds"] if gid in game_map
        ]
        if profile:
            enriched.append({
                "profile": profile,
                "common_games": b["commonGames"],
                "shared_game_titles": shared_games
            })

    return enriched


async def get_similar_games_with_details(game_id: str, limit: int = 5) -> list[dict]:
    """
    Aehnliche Spiele basierend auf gemeinsamen Besitzern.
    
    Nutzt die Neo4j-Analyse 'Spieler die X kauften, kauften auch Y'.
    Gibt Spiele mit Details zurueck.
    """
    return await get_also_bought_with_details(game_id, limit)


async def get_similar_games_by_tags_with_details(game_id: str, limit: int = 5) -> list[dict]:
    """
    Aehnliche Spiele basierend auf gemeinsamen Tags/Genres.
    
    Neo4j findet Spiele mit ueberschneidenden Tags → MongoDB liefert Details.
    """
    similar = await neo4j_service.similar_games_by_tags(game_id, limit)

    if not similar:
        return []

    game_ids = [r["gameId"] for r in similar]
    game_details = await mongo_service.get_many_by_ids("games", game_ids)
    game_map = {g["_id"]: g for g in game_details}

    enriched = []
    for sim in similar:
        game = game_map.get(sim["gameId"])
        if game:
            enriched.append({
                "game": game,
                "common_tags": sim["commonTags"],
                "shared_tags": sim["sharedTags"]
            })

    return enriched

