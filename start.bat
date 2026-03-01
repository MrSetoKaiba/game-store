@echo off
echo ==========================================
echo Starte Bonfire (Nexus Game Store) Projekt...
echo ==========================================

echo.
echo [1/3] Starte Datenbanken (Docker Compose)...
docker compose up -d mongodb neo4j

echo.
echo Warte 15 Sekunden damit Neo4j hochfahren kann...
timeout /t 15 /nobreak

echo.
echo [2/3] Backend wird in neuem Fenster gestartet...
start "Bonfire Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

echo.
echo [3/3] Frontend wird in neuem Fenster gestartet...
start "Bonfire Frontend" cmd /k "cd nexus-frontend-graphite\nexus-frontend-graphite && npm run dev"

echo.
echo ==========================================
echo Alles gestartet!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000/docs
echo Neo4j Browser: http://localhost:7474
echo ==========================================
echo.
pause
