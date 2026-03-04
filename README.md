# Bonfire GameStore – Spiele-Vertriebsplattform

Spiele-Vertriebsplattform mit **MongoDB** und **Neo4j**. Ein Fullstack-Projekt mit fortschrittlichen Polyglot-Persistence-Ansätzen (Nutzung mehrerer Datenbanktechnologien für deren jeweilige Stärken).

**Vorlesung:** Neue Datenbankkonzepte | DHBW Baden-Württemberg

---

## 🛠 Tech-Stack

### Frontend
- **Framework:** React 18 (via Vite)
- **Routing:** React Router v6
- **Styling:** Pure Modern CSS (Custom Properties/Variables, Flexbox/Grid, Glassmorphism-Design, Animationen)
- **State Management:** React Context API (`AppContext`)

### Backend
- **Framework:** FastAPI (Python 3.12+)
- **Server:** Uvicorn (ASGI)
- **Architektur:** REST API

### Datenbanken & Infrastruktur
- **Infrastruktur:** Docker Compose
- **MongoDB:** Dokumentendatenbank für hochstrukturierte Daten (Spielekatalog, Benutzerprofile, Reviews, Publisher). Angesprochen über asynchronen `motor`-Client.
- **Neo4j:** Graphdatenbank für tiefe Beziehungsdaten (Besitzverhältnisse, Freundschaftsnetzwerke, Empfehlungs-Graphtraversierungen). Angesprochen über den offiziellen Python Neo4j-Treiber.

---

## Schnellstart & Installation

### Voraussetzungen
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

### 1. Datenbanken starten
Wechsle in das Hauptverzeichnis (`game-store`) und starte die Docker-Container für **MongoDB** und **Neo4j**:
```bash
docker compose up -d
```
*(Dies startet MongoDB auf Port 27017 und Neo4j auf Port 7687/7474.)*

> **Hinweis:** `docker-compose.yml` startet **nur** die Datenbanken. Das Backend wird lokal gestartet (siehe Schritt 2).

Prüfe mit `docker ps`, ob beide Container den Status `healthy` haben, bevor du weitermachst. **Neo4j braucht ca. 20–30 Sekunden** zum Starten.

### 2. Backend starten
Öffne ein Terminal im Ordner `backend`:
```bash
cd backend

# Umgebungsvariablen einrichten (nur beim ersten Mal):
cp .env.example .env
# Unter Windows (CMD): copy .env.example .env

python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Das Backend läuft nun unter `http://localhost:8000`.

> **Hinweis:** Die Datenbankverbindungen werden über die Datei `backend/.env` konfiguriert (Vorlage: `.env.example`). Diese wird automatisch beim Start geladen (`python-dotenv`). Das Backend hat eine eingebaute Retry-Logik für Neo4j – es wartet automatisch, bis Neo4j bereit ist.

### 3. Frontend starten
Öffne ein weiteres Terminal und navigiere in den Frontend-Ordner:
```bash
cd bonfire-frontend
npm install
npm run dev
```
Das Frontend ist nun unter dem in der Konsole angezeigten Link (meist `http://localhost:5173`) erreichbar.

### 4. Testdaten (Seeding) laden
Um den leeren Store mit ersten Spielen, Benutzern und initialen Graphen-Beziehungen zu füllen, führe folgenden Befehl aus:

*Über die Web-Oberfläche (empfohlen):*
Öffne [http://localhost:8000/docs](http://localhost:8000/docs), klappe `POST /api/seed` auf und klicke auf **Try it out** → **Execute**.

*Oder via PowerShell:*
```powershell
Invoke-RestMethod -Uri http://localhost:8000/api/seed -Method POST
```

*Oder via bash/curl:*
```bash
curl -X POST http://localhost:8000/api/seed
```

---

## Architektur & Use-Cases

### Datenaufteilung (Polyglot Persistence)

| Datenbank | Verantwortung | Begründung |
|-----------|--------------|------------|
| **MongoDB** | Spiele, User-Profile, Reviews, Publisher, Backend-Käufe | Ideal zum Speichern und schnellen Laden von reichhaltigen, schemafreien Inhalten (Texte, Metadaten, URLs). |
| **Neo4j** | Besitzknoten, Freundschaften, Tag-Verknüpfungen, Wishlists | Extreme Performance-Vorteile bei der Graphtraversierung für Empfehlungssysteme ("Freunde von Freunden spielen..."). |

### Integrations-Use-Case (Recommendations)
1. **Neo4j** traversiert den Graphen (z.B. Knoten `(:User)-[:FRIENDS_WITH]->(:User)-[:OWNS]->(:Game)`) und ermittelt relevante Spiel-IDs.
2. Das Backend nimmt diese verketteten IDs und fragt **MongoDB** in Echtzeit nach den darzustellenden Metadaten ab (Titel, Preis, Cover-Image).
3. **Ergebnis:** Höchst personalisierte und performante Empfehlungen für das Frontend.

---

## Nützliche Links & Tools

- **Frontend App (Bonfire Store):** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Neo4j Graph-Browser:** [http://localhost:7474](http://localhost:7474) (User: `neo4j`, Password: `gamestore2026`)
