"""
Neo4j Service – CRUD-Operationen + Cypher-Analysen.

Graph-Modell:
  Node-Labels:
    (:User {userId})       – Referenz auf MongoDB User._id
    (:Game {gameId})       – Referenz auf MongoDB Game._id
    (:Tag  {name})         – Spiel-Tags wie "Action", "RPG", "Multiplayer"

  Relationship-Typen:
    (:User)-[:OWNS {purchaseDate}]->(:Game)        – User besitzt Spiel
    (:User)-[:FRIENDS_WITH]->(:User)               – Freundschaft
    (:Game)-[:TAGGED_WITH]->(:Tag)                 – Spiel hat Tag/Genre
"""

from config import get_driver


# ──────────────────────────────────────────
# CRUD: User-Knoten
# ──────────────────────────────────────────

async def create_user_node(user_id: str):
    """Erstellt einen User-Knoten (nur userId als Referenz auf MongoDB)."""
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            "MERGE (u:User {userId: $userId})",
            userId=user_id
        )


async def delete_user_node(user_id: str):
    """Löscht einen User-Knoten und alle seine Beziehungen."""
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            "MATCH (u:User {userId: $userId}) DETACH DELETE u",
            userId=user_id
        )


# ──────────────────────────────────────────
# CRUD: Game-Knoten
# ──────────────────────────────────────────

async def create_game_node(game_id: str, tag_names: list[str] = None):
    """Erstellt einen Game-Knoten und verknüpft ihn mit Tag-Knoten."""
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            "MERGE (g:Game {gameId: $gameId})",
            gameId=game_id
        )
        if tag_names:
            for tag_name in tag_names:
                await session.run(
                    """
                    MERGE (t:Tag {name: $tagName})
                    WITH t
                    MATCH (g:Game {gameId: $gameId})
                    MERGE (g)-[:TAGGED_WITH]->(t)
                    """,
                    gameId=game_id, tagName=tag_name
                )


async def delete_game_node(game_id: str):
    """Löscht einen Game-Knoten und alle seine Beziehungen."""
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            "MATCH (g:Game {gameId: $gameId}) DETACH DELETE g",
            gameId=game_id
        )


# ──────────────────────────────────────────
# CRUD: Beziehungen
# ──────────────────────────────────────────

async def add_ownership(user_id: str, game_id: str):
    """Erstellt eine OWNS-Beziehung (User kauft Spiel)."""
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            """
            MATCH (u:User {userId: $userId}), (g:Game {gameId: $gameId})
            MERGE (u)-[o:OWNS]->(g)
            SET o.purchaseDate = datetime()
            """,
            userId=user_id, gameId=game_id
        )


async def remove_ownership(user_id: str, game_id: str):
    """Entfernt eine OWNS-Beziehung."""
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            """
            MATCH (u:User {userId: $userId})-[o:OWNS]->(g:Game {gameId: $gameId})
            DELETE o
            """,
            userId=user_id, gameId=game_id
        )


async def add_friendship(user_id_1: str, user_id_2: str):
    """Erstellt eine Freundschaft (bidirektional)."""
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            """
            MATCH (u1:User {userId: $uid1}), (u2:User {userId: $uid2})
            MERGE (u1)-[:FRIENDS_WITH]-(u2)
            """,
            uid1=user_id_1, uid2=user_id_2
        )


async def remove_friendship(user_id_1: str, user_id_2: str):
    """Entfernt eine Freundschaft."""
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            """
            MATCH (u1:User {userId: $uid1})-[f:FRIENDS_WITH]-(u2:User {userId: $uid2})
            DELETE f
            """,
            uid1=user_id_1, uid2=user_id_2
        )


# ──────────────────────────────────────────
# READ: Graph-Daten abfragen
# ──────────────────────────────────────────

async def get_user_friends(user_id: str) -> list[str]:
    """Gibt alle Freunde eines Users zurück."""
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (u:User {userId: $userId})-[:FRIENDS_WITH]-(friend:User)
            RETURN friend.userId AS friendId
            """,
            userId=user_id
        )
        records = [record async for record in result]
        return [r["friendId"] for r in records]


async def get_user_library(user_id: str) -> list[str]:
    """Gibt alle Spiel-IDs zurück, die ein User besitzt."""
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (u:User {userId: $userId})-[:OWNS]->(g:Game)
            RETURN g.gameId AS gameId
            """,
            userId=user_id
        )
        records = [record async for record in result]
        return [r["gameId"] for r in records]


# ──────────────────────────────────────────
# Cypher-Analysen (mind. 3 gefordert)
# ──────────────────────────────────────────

async def recommend_by_friends(user_id: str, limit: int = 10) -> list[dict]:
    """
    🎯 Analyse 1: Spielempfehlungen über Freundesnetzwerk.

    Findet Spiele, die Freunde besitzen, die der User selbst noch nicht hat.
    Sortiert nach Anzahl der Freunde, die das Spiel besitzen.

    → Dies ist auch der INTEGRATIONS-USE-CASE:
      Die gameIds werden an MongoDB übergeben für vollständige Details.
    """
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (u:User {userId: $userId})-[:FRIENDS_WITH]-(friend:User)
                  -[:OWNS]->(g:Game)
            WHERE NOT (u)-[:OWNS]->(g)
            RETURN g.gameId AS gameId,
                   COUNT(DISTINCT friend) AS friendCount,
                   COLLECT(DISTINCT friend.userId) AS friendIds
            ORDER BY friendCount DESC
            LIMIT $limit
            """,
            userId=user_id, limit=limit
        )
        records = [record async for record in result]
        return [
            {
                "gameId": r["gameId"],
                "friendCount": r["friendCount"],
                "friendIds": r["friendIds"]
            }
            for r in records
        ]


async def players_also_bought(game_id: str, limit: int = 5) -> list[dict]:
    """
    🎯 Analyse 2: "Spieler die X kauften, kauften auch Y."

    Findet Spiele, die häufig zusammen mit dem angegebenen Spiel
    von denselben Usern besessen werden.
    """
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (u:User)-[:OWNS]->(g1:Game {gameId: $gameId}),
                  (u)-[:OWNS]->(g2:Game)
            WHERE g1 <> g2
            RETURN g2.gameId AS gameId,
                   COUNT(DISTINCT u) AS commonOwners
            ORDER BY commonOwners DESC
            LIMIT $limit
            """,
            gameId=game_id, limit=limit
        )
        records = [record async for record in result]
        return [
            {
                "gameId": r["gameId"],
                "commonOwners": r["commonOwners"]
            }
            for r in records
        ]


async def popular_tags_in_network(user_id: str) -> list[dict]:
    """
    🎯 Analyse 3: Beliebteste Tags/Genres im Freundeskreis.

    Analysiert welche Tags die Freunde des Users am meisten
    spielen – hilfreich für personalisierte Storefront.
    """
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (u:User {userId: $userId})-[:FRIENDS_WITH]-(friend:User)
                  -[:OWNS]->(g:Game)-[:TAGGED_WITH]->(t:Tag)
            RETURN t.name AS tag,
                   COUNT(DISTINCT g) AS uniqueGames,
                   COUNT(DISTINCT friend) AS friendsPlaying
            ORDER BY uniqueGames DESC
            """,
            userId=user_id
        )
        records = [record async for record in result]
        return [
            {
                "tag": r["tag"],
                "uniqueGames": r["uniqueGames"],
                "friendsPlaying": r["friendsPlaying"]
            }
            for r in records
        ]


async def find_gaming_buddies(user_id: str, limit: int = 5) -> list[dict]:
    """
    🎯 Bonus-Analyse: Finde potenzielle Gaming-Buddies.

    Findet User (die KEINE Freunde sind), die die meisten
    gleichen Spiele besitzen – potenzielle neue Freunde.
    """
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (u:User {userId: $userId})-[:OWNS]->(g:Game)<-[:OWNS]-(other:User)
            WHERE u <> other AND NOT (u)-[:FRIENDS_WITH]-(other)
            RETURN other.userId AS userId,
                   COUNT(DISTINCT g) AS commonGames,
                   COLLECT(DISTINCT g.gameId) AS sharedGameIds
            ORDER BY commonGames DESC
            LIMIT $limit
            """,
            userId=user_id, limit=limit
        )
        records = [record async for record in result]
        return [
            {
                "userId": r["userId"],
                "commonGames": r["commonGames"],
                "sharedGameIds": r["sharedGameIds"]
            }
            for r in records
        ]


async def similar_games_by_tags(game_id: str, limit: int = 5) -> list[dict]:
    """
    🎯 Analyse: Ähnliche Spiele basierend auf gemeinsamen Tags/Genres.

    Findet Spiele, die die meisten gleichen Tags wie das angegebene Spiel haben.
    """
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(
            """
            MATCH (g1:Game {gameId: $gameId})-[:TAGGED_WITH]->(t:Tag)<-[:TAGGED_WITH]-(g2:Game)
            WHERE g1 <> g2
            RETURN g2.gameId AS gameId,
                   COUNT(t) AS commonTags,
                   COLLECT(t.name) AS sharedTags
            ORDER BY commonTags DESC
            LIMIT $limit
            """,
            gameId=game_id, limit=limit
        )
        records = [record async for record in result]
        return [
            {
                "gameId": r["gameId"],
                "commonTags": r["commonTags"],
                "sharedTags": r["sharedTags"]
            }
            for r in records
        ]
