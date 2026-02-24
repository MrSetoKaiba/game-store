---
description: Projekt starten - GameStore Backend + Frontend
---

# GameStore Projekt starten

## Voraussetzungen
- Docker Desktop muss laufen (Tray-Icon prüfen)

## Schritte

### 1. Docker-Container starten (MongoDB + Neo4j)
```powershell
cd c:\Users\wilhe\Desktop\Sola\game-store
docker compose up -d mongodb neo4j
```
// turbo

### 2. Backend starten (FastAPI auf Port 8000)
```powershell
cd c:\Users\wilhe\Desktop\Sola\game-store\backend
python -m uvicorn main:app --reload
```

### 3. Frontend starten (Vite auf Port 5173) - neues Terminal
```powershell
cd c:\Users\wilhe\Desktop\Sola\game-store\frontend
npm run dev
```

### 4. Im Browser öffnen
- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:8000/docs

## Projekt stoppen
```powershell
# Container stoppen
docker compose down
# Oder STRG+C in den Terminal-Fenstern für Backend/Frontend
```
