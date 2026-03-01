"""
Pydantic-Modelle für alle MongoDB-Collections.

Collections:
  1. games       – Spiele mit Metadaten, Preis, Screenshots
  2. users       – Benutzerprofile mit Wallet/Guthaben
  3. reviews     – Spielbewertungen
  4. publishers  – Spielehersteller / Studios
  5. purchases   – Kaufhistorie / Transaktionen
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ──────────────────────────────────────────
# 1. Games
# ──────────────────────────────────────────

class GameCreate(BaseModel):
    title: str
    description: str
    price: float = Field(..., ge=0, description="Preis in Euro")
    release_date: Optional[str] = None
    publisher_id: Optional[str] = None
    cover_url: Optional[str] = None
    screenshots: list[str] = []
    platforms: list[str] = []          # z.B. ["PC", "PS5", "Switch"]
    min_requirements: Optional[str] = None
    tag_names: list[str] = []          # z.B. ["Action", "RPG", "Multiplayer"]


class GameUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    release_date: Optional[str] = None
    publisher_id: Optional[str] = None
    cover_url: Optional[str] = None
    screenshots: Optional[list[str]] = None
    platforms: Optional[list[str]] = None
    min_requirements: Optional[str] = None
    tag_names: Optional[list[str]] = None


class GameResponse(GameCreate):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


# ──────────────────────────────────────────
# 2. Users
# ──────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    display_name: Optional[str] = None
    wallet_balance: float = Field(default=0.0, ge=0, description="Guthaben in Euro")
    avatar_url: Optional[str] = None
    address: Optional[dict] = None


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    display_name: Optional[str] = None
    wallet_balance: Optional[float] = Field(None, ge=0)
    avatar_url: Optional[str] = None
    address: Optional[dict] = None


class UserResponse(UserCreate):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


# ──────────────────────────────────────────
# 3. Reviews
# ──────────────────────────────────────────

class ReviewCreate(BaseModel):
    user_id: str
    game_id: str
    rating: int = Field(..., ge=1, le=5)
    text: Optional[str] = None
    recommended: bool = True
    playtime_hours: Optional[float] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    text: Optional[str] = None
    recommended: Optional[bool] = None
    playtime_hours: Optional[float] = None


class ReviewResponse(ReviewCreate):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


# ──────────────────────────────────────────
# 4. Publishers
# ──────────────────────────────────────────

class PublisherCreate(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    founded_year: Optional[int] = None
    country: Optional[str] = None


class PublisherUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    founded_year: Optional[int] = None
    country: Optional[str] = None


class PublisherResponse(PublisherCreate):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True


# ──────────────────────────────────────────
# 5. Purchases (Kaufhistorie)
# ──────────────────────────────────────────

class PurchaseCreate(BaseModel):
    user_id: str
    game_id: str
    price_paid: float = Field(..., ge=0)


class PurchaseResponse(PurchaseCreate):
    id: str = Field(..., alias="_id")
    purchased_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
