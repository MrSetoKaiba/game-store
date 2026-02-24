"""
MongoDB Service – CRUD-Operationen + Aggregation-Pipelines.

Verwaltet alle 5 Collections:
  games, users, reviews, publishers, purchases
"""

from bson import ObjectId
from datetime import datetime
from config import get_db


# ──────────────────────────────────────────
# Hilfsfunktionen
# ──────────────────────────────────────────

def _to_str_id(doc: dict) -> dict:
    """Konvertiert MongoDB ObjectId zu String für JSON-Serialisierung."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def _to_str_ids(docs: list[dict]) -> list[dict]:
    return [_to_str_id(doc) for doc in docs]


# ──────────────────────────────────────────
# Generische CRUD-Operationen
# ──────────────────────────────────────────

async def create_one(collection_name: str, data: dict) -> dict:
    db = get_db()
    data["created_at"] = datetime.utcnow()
    result = await db[collection_name].insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data


async def get_all(collection_name: str, limit: int = 100, skip: int = 0) -> list[dict]:
    db = get_db()
    cursor = db[collection_name].find().skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return _to_str_ids(docs)


async def get_one(collection_name: str, doc_id: str) -> dict | None:
    db = get_db()
    doc = await db[collection_name].find_one({"_id": ObjectId(doc_id)})
    return _to_str_id(doc) if doc else None


async def update_one(collection_name: str, doc_id: str, data: dict) -> dict | None:
    db = get_db()
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return await get_one(collection_name, doc_id)
    update_data["updated_at"] = datetime.utcnow()
    await db[collection_name].update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": update_data}
    )
    return await get_one(collection_name, doc_id)


async def delete_one(collection_name: str, doc_id: str) -> bool:
    db = get_db()
    result = await db[collection_name].delete_one({"_id": ObjectId(doc_id)})
    return result.deleted_count > 0


async def get_many_by_ids(collection_name: str, ids: list[str]) -> list[dict]:
    """Liest mehrere Dokumente anhand einer ID-Liste.
    Zentral für den Integrations-Use-Case: Neo4j liefert IDs → MongoDB liefert Details.
    """
    db = get_db()
    object_ids = [ObjectId(id) for id in ids]
    cursor = db[collection_name].find({"_id": {"$in": object_ids}})
    docs = await cursor.to_list(length=len(ids))
    return _to_str_ids(docs)


# ──────────────────────────────────────────
# Aggregation-Pipelines
# ──────────────────────────────────────────

async def get_top_rated_games(limit: int = 10) -> list[dict]:
    """
    Aggregation 1: Bestbewertete Spiele.

    Gruppiert Reviews nach game_id, berechnet Durchschnittsbewertung,
    Empfehlungsrate und durchschnittliche Spielzeit.
    Joined dann die Spiel-Details aus der games-Collection.
    """
    db = get_db()
    pipeline = [
        # Stage 1: Gruppiere nach Spiel
        {"$group": {
            "_id": "$game_id",
            "avg_rating": {"$avg": "$rating"},
            "review_count": {"$sum": 1},
            "recommend_rate": {
                "$avg": {"$cond": ["$recommended", 1, 0]}
            },
            "avg_playtime": {"$avg": "$playtime_hours"}
        }},
        # Stage 2: Mindestens 2 Reviews
        {"$match": {"review_count": {"$gte": 2}}},
        # Stage 3: Sortieren
        {"$sort": {"avg_rating": -1, "review_count": -1}},
        # Stage 4: Limitieren
        {"$limit": limit},
        # Stage 5: Spiel-Details joinen
        {"$lookup": {
            "from": "games",
            "let": {"game_id": {"$toObjectId": "$_id"}},
            "pipeline": [
                {"$match": {"$expr": {"$eq": ["$_id", "$$game_id"]}}}
            ],
            "as": "game"
        }},
        # Stage 6: Array entpacken
        {"$unwind": {"path": "$game", "preserveNullAndEmptyArrays": True}},
        # Stage 7: Saubere Projektion
        {"$project": {
            "_id": 1,
            "avg_rating": {"$round": ["$avg_rating", 1]},
            "review_count": 1,
            "recommend_rate": {"$round": [{"$multiply": ["$recommend_rate", 100]}, 0]},
            "avg_playtime": {"$round": ["$avg_playtime", 1]},
            "title": "$game.title",
            "price": "$game.price",
            "cover_url": "$game.cover_url"
        }}
    ]
    cursor = db["reviews"].aggregate(pipeline)
    results = await cursor.to_list(length=limit)
    return _to_str_ids(results)


async def get_revenue_per_publisher() -> list[dict]:
    """
    Aggregation 2: Umsatz pro Publisher.

    Joinst purchases mit games und gruppiert nach publisher_id,
    berechnet Gesamtumsatz und Anzahl verkaufter Spiele.
    """
    db = get_db()
    pipeline = [
        # Stage 1: Spiel-Daten joinen (um publisher_id zu bekommen)
        {"$lookup": {
            "from": "games",
            "let": {"game_id": {"$toObjectId": "$game_id"}},
            "pipeline": [
                {"$match": {"$expr": {"$eq": ["$_id", "$$game_id"]}}}
            ],
            "as": "game"
        }},
        {"$unwind": "$game"},
        # Stage 2: Gruppiere nach Publisher
        {"$group": {
            "_id": "$game.publisher_id",
            "total_revenue": {"$sum": "$price_paid"},
            "total_sales": {"$sum": 1},
            "avg_price": {"$avg": "$price_paid"}
        }},
        # Stage 3: Publisher-Details joinen
        {"$lookup": {
            "from": "publishers",
            "let": {"pub_id": {"$toObjectId": "$_id"}},
            "pipeline": [
                {"$match": {"$expr": {"$eq": ["$_id", "$$pub_id"]}}}
            ],
            "as": "publisher"
        }},
        {"$unwind": {"path": "$publisher", "preserveNullAndEmptyArrays": True}},
        # Stage 4: Projektion
        {"$project": {
            "_id": 1,
            "publisher_name": "$publisher.name",
            "total_revenue": {"$round": ["$total_revenue", 2]},
            "total_sales": 1,
            "avg_price": {"$round": ["$avg_price", 2]}
        }},
        {"$sort": {"total_revenue": -1}}
    ]
    cursor = db["purchases"].aggregate(pipeline)
    results = await cursor.to_list(length=50)
    return _to_str_ids(results)


async def get_platform_statistics() -> list[dict]:
    """
    Aggregation 3: Statistiken pro Plattform.

    Entpackt das platforms-Array und berechnet pro Plattform
    die Anzahl Spiele, den Durchschnittspreis und den Preisbereich.
    """
    db = get_db()
    pipeline = [
        {"$unwind": "$platforms"},
        {"$group": {
            "_id": "$platforms",
            "game_count": {"$sum": 1},
            "avg_price": {"$avg": "$price"},
            "min_price": {"$min": "$price"},
            "max_price": {"$max": "$price"}
        }},
        {"$project": {
            "_id": 0,
            "platform": "$_id",
            "game_count": 1,
            "avg_price": {"$round": ["$avg_price", 2]},
            "min_price": 1,
            "max_price": 1
        }},
        {"$sort": {"game_count": -1}}
    ]
    cursor = db["games"].aggregate(pipeline)
    return await cursor.to_list(length=20)


async def get_user_spending_stats(user_id: str) -> dict:
    """
    Aggregation 4: Ausgaben-Statistiken eines Nutzers.
    """
    db = get_db()
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$user_id",
            "total_spent": {"$sum": "$price_paid"},
            "games_owned": {"$sum": 1},
            "avg_price_paid": {"$avg": "$price_paid"},
            "first_purchase": {"$min": "$created_at"},
            "last_purchase": {"$max": "$created_at"}
        }},
        {"$project": {
            "_id": 0,
            "user_id": "$_id",
            "total_spent": {"$round": ["$total_spent", 2]},
            "games_owned": 1,
            "avg_price_paid": {"$round": ["$avg_price_paid", 2]},
            "first_purchase": 1,
            "last_purchase": 1
        }}
    ]
    cursor = db["purchases"].aggregate(pipeline)
    results = await cursor.to_list(length=1)
    return results[0] if results else {
        "user_id": user_id, "total_spent": 0, "games_owned": 0
    }
