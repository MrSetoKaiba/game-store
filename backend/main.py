"""
GameStore - Spiele-Vertriebsplattform
=========================================

Web-Anwendung mit MongoDB (Spieldaten) + Neo4j (Beziehungsgraph).

Vorlesung: Neue Datenbankkonzepte
DHBW Baden-Württemberg

API-Dokumentation: http://localhost:8000/docs  (Swagger UI)
OpenAPI-Spec:      http://localhost:8000/openapi.json
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import connect_mongodb, close_mongodb, connect_neo4j, close_neo4j
from routes import (
    games_router,
    users_router,
    reviews_router,
    publishers_router,
    purchases_router,
    recommendations_router,
)
from seed import seed_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_mongodb()
    await connect_neo4j()
    yield
    await close_mongodb()
    await close_neo4j()


app = FastAPI(
    title="GameStore API",
    description="""
    Spiele-Vertriebsplattform (ähnlich Steam) mit MongoDB und Neo4j.

    **MongoDB** speichert alle fachlichen Daten:
    Games, Users, Reviews, Publishers, Purchases.

    **Neo4j** modelliert den Beziehungsgraphen:
    Wer besitzt welche Spiele, Freundschaften, Spiel-Tags.

    **Integrations-Use-Case**:
    Neo4j ermittelt empfohlene Spiel-IDs über den Freundes-Graphen
    → MongoDB liefert vollständige Spiel-Details (Titel, Preis, Cover etc.)
    """,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games_router)
app.include_router(users_router)
app.include_router(reviews_router)
app.include_router(publishers_router)
app.include_router(purchases_router)
app.include_router(recommendations_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": "GameStore API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "databases": {
            "mongodb": "Games, Users, Reviews, Publishers, Purchases (5 Collections)",
            "neo4j": "User-Knoten, Game-Knoten, Tag-Knoten + OWNS, FRIENDS_WITH, TAGGED_WITH"
        }
    }


@app.post("/api/seed", tags=["Admin"])
async def seed_database():
    """[WARNUNG] Befuellt beide Datenbanken mit Testdaten. Loescht alle bestehenden Daten!"""
    result = await seed_all()
    return {"message": "Seed-Daten erfolgreich geladen", "counts": result}
