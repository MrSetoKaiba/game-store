"""
API-Routen für Purchases – Kauf-Logik.

Beim Kauf passieren drei Dinge gleichzeitig:
  1. MongoDB: Purchase-Dokument erstellen + Wallet-Guthaben abziehen
  2. Neo4j: OWNS-Beziehung erstellen (User besitzt jetzt das Spiel)
"""

from fastapi import APIRouter, HTTPException
from models.schemas import PurchaseCreate
from services import mongo_service, neo4j_service

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])


@router.post("/", status_code=201)
async def purchase_game(purchase: PurchaseCreate):
    """
    Kauft ein Spiel für einen User.

    1. Prüft ob User genug Guthaben hat
    2. Erstellt Purchase-Dokument in MongoDB
    3. Zieht Guthaben vom User ab (MongoDB)
    4. Erstellt OWNS-Beziehung in Neo4j
    """
    # User und Spiel laden
    user = await mongo_service.get_one("users", purchase.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User nicht gefunden")

    game = await mongo_service.get_one("games", purchase.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Spiel nicht gefunden")

    # Prüfe Guthaben
    if user.get("wallet_balance", 0) < purchase.price_paid:
        raise HTTPException(
            status_code=400,
            detail=f"Nicht genug Guthaben. Benötigt: {purchase.price_paid}€, "
                   f"Vorhanden: {user.get('wallet_balance', 0)}€"
        )

    # Prüfe ob User das Spiel schon besitzt
    library = await neo4j_service.get_user_library(purchase.user_id)
    if purchase.game_id in library:
        raise HTTPException(status_code=400, detail="Spiel bereits in Bibliothek")

    # MongoDB: Purchase erstellen
    result = await mongo_service.create_one("purchases", purchase.model_dump())

    # MongoDB: Guthaben abziehen
    new_balance = user.get("wallet_balance", 0) - purchase.price_paid
    await mongo_service.update_one("users", purchase.user_id, {"wallet_balance": new_balance})

    # Neo4j: OWNS-Beziehung erstellen
    await neo4j_service.add_ownership(purchase.user_id, purchase.game_id)

    return {
        "purchase": result,
        "new_balance": round(new_balance, 2),
        "message": f"'{game['title']}' erfolgreich gekauft!"
    }


@router.get("/")
async def get_purchases(limit: int = 100, skip: int = 0):
    """Listet alle Käufe auf."""
    return await mongo_service.get_all("purchases", limit=limit, skip=skip)


@router.get("/{purchase_id}")
async def get_purchase(purchase_id: str):
    """Gibt einen einzelnen Kauf zurück."""
    purchase = await mongo_service.get_one("purchases", purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Kauf nicht gefunden")
    return purchase
