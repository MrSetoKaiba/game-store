"""
Seed-Skript: Befüllt MongoDB und Neo4j mit realistischen Testdaten.

Enthält 25 bekannte Spieletitel, 13 Publisher, 5 Users mit Guthaben,
Reviews, Käufe und ein Freundesnetzwerk.
"""

from config import get_db, get_driver
from bson import ObjectId
from datetime import datetime


async def seed_all():
    db = get_db()
    driver = get_driver()

    # Bestehende Daten löschen
    for coll in ["publishers", "games", "users", "reviews", "purchases"]:
        await db[coll].drop()
    async with driver.session() as session:
        await session.run("MATCH (n) DETACH DELETE n")
    print("[DELETED] Bestehende Daten geloescht")

    # ── 1. Publishers (13 Publisher) ────────────────────────
    publishers = [
        {"_id": ObjectId(), "name": "Nintendo", "description": "Japanischer Spielehersteller, bekannt für Mario und Zelda",
         "website": "https://nintendo.com", "founded_year": 1889, "country": "Japan"},
        {"_id": ObjectId(), "name": "CD Projekt Red", "description": "Polnisches Studio, Schöpfer von The Witcher und Cyberpunk",
         "website": "https://cdprojektred.com", "founded_year": 2002, "country": "Polen"},
        {"_id": ObjectId(), "name": "Valve", "description": "Entwickler von Steam, Half-Life und Portal",
         "website": "https://valvesoftware.com", "founded_year": 1996, "country": "USA"},
        {"_id": ObjectId(), "name": "FromSoftware", "description": "Bekannt für Dark Souls, Elden Ring und Sekiro",
         "website": "https://fromsoftware.jp", "founded_year": 1986, "country": "Japan"},
        {"_id": ObjectId(), "name": "Supergiant Games", "description": "Indie-Studio, bekannt für Hades und Bastion",
         "website": "https://supergiantgames.com", "founded_year": 2009, "country": "USA"},
        {"_id": ObjectId(), "name": "Mojang Studios", "description": "Schöpfer von Minecraft",
         "website": "https://mojang.com", "founded_year": 2009, "country": "Schweden"},
        {"_id": ObjectId(), "name": "ConcernedApe", "description": "Ein-Mann-Studio von Eric Barone, Schöpfer von Stardew Valley",
         "website": "https://stardewvalley.net", "founded_year": 2012, "country": "USA"},
        {"_id": ObjectId(), "name": "Rockstar Games", "description": "Entwickler von GTA und Red Dead Redemption",
         "website": "https://rockstargames.com", "founded_year": 1998, "country": "USA"},
        {"_id": ObjectId(), "name": "Ubisoft", "description": "Französischer Publisher, bekannt für Assassin's Creed und Far Cry",
         "website": "https://ubisoft.com", "founded_year": 1986, "country": "Frankreich"},
        {"_id": ObjectId(), "name": "Bethesda", "description": "Entwickler von The Elder Scrolls und Fallout",
         "website": "https://bethesda.net", "founded_year": 1986, "country": "USA"},
        {"_id": ObjectId(), "name": "Capcom", "description": "Japanischer Publisher, bekannt für Resident Evil und Monster Hunter",
         "website": "https://capcom.com", "founded_year": 1979, "country": "Japan"},
        {"_id": ObjectId(), "name": "Team Cherry", "description": "Australisches Indie-Studio, Schöpfer von Hollow Knight",
         "website": "https://teamcherry.com.au", "founded_year": 2014, "country": "Australien"},
        {"_id": ObjectId(), "name": "Re-Logic", "description": "Indie-Entwickler von Terraria",
         "website": "https://re-logic.com", "founded_year": 2011, "country": "USA"},
    ]
    await db["publishers"].insert_many(publishers)
    pub_map = {p["name"]: str(p["_id"]) for p in publishers}
    print(f"[OK] {len(publishers)} Publishers erstellt")

    # ── 2. Games (25 Spiele) ─────────────────────────────
    games = [
        # === Nintendo (3 Spiele) ===
        {"_id": ObjectId(), "title": "The Legend of Zelda: Tears of the Kingdom",
         "description": "Open-World-Abenteuer in Hyrule mit kreativen Bau-Mechaniken.",
         "price": 59.99, "release_date": "2023-05-12", "publisher_id": pub_map["Nintendo"],
         "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
         "screenshots": [], "platforms": ["Switch"], "min_requirements": "Nintendo Switch",
         "tag_names": ["Action", "Adventure", "Open World"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Super Mario Odyssey",
         "description": "Mario reist um die Welt und sammelt Power Moons.",
         "price": 49.99, "release_date": "2017-10-27", "publisher_id": pub_map["Nintendo"],
         "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1mxf.jpg",
         "screenshots": [], "platforms": ["Switch"], "min_requirements": "Nintendo Switch",
         "tag_names": ["Platformer", "Adventure", "Singleplayer"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Animal Crossing: New Horizons",
         "description": "Lebenssimulation auf deiner eigenen Insel.",
         "price": 49.99, "release_date": "2020-03-20", "publisher_id": pub_map["Nintendo"],
         "cover_url": "https://m.media-amazon.com/images/I/71kCvUDA41L._AC_UF894,1000_QL80_.jpg",
         "screenshots": [], "platforms": ["Switch"], "min_requirements": "Nintendo Switch",
         "tag_names": ["Simulation", "Relaxing", "Multiplayer", "Singleplayer"], "created_at": datetime.utcnow()},

        # === CD Projekt Red (2 Spiele) ===
        {"_id": ObjectId(), "title": "The Witcher 3: Wild Hunt",
         "description": "Episches Open-World RPG als Hexer Geralt von Riva.",
         "price": 29.99, "release_date": "2015-05-19", "publisher_id": pub_map["CD Projekt Red"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel i5-2500K, GTX 660, 6 GB RAM",
         "tag_names": ["RPG", "Open World", "Action", "Story Rich"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Cyberpunk 2077",
         "description": "Open-World RPG in der dystopischen Megacity Night City.",
         "price": 39.99, "release_date": "2020-12-10", "publisher_id": pub_map["CD Projekt Red"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i7-6700, GTX 1060, 12 GB RAM",
         "tag_names": ["RPG", "Open World", "Cyberpunk", "Action", "Story Rich"], "created_at": datetime.utcnow()},

        # === Valve (3 Spiele) ===
        {"_id": ObjectId(), "title": "Portal 2",
         "description": "Puzzle-Spiel mit Portal-Gun und genialem Humor.",
         "price": 9.99, "release_date": "2011-04-19", "publisher_id": pub_map["Valve"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel 1.7 GHz, 512 MB RAM",
         "tag_names": ["Puzzle", "Co-op", "Singleplayer", "Sci-Fi"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Counter-Strike 2",
         "description": "Kompetitiver taktischer Shooter.",
         "price": 0.00, "release_date": "2023-09-27", "publisher_id": pub_map["Valve"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC"],
         "min_requirements": "Intel i5, GTX 750 Ti, 8 GB RAM",
         "tag_names": ["Shooter", "Multiplayer", "Competitive", "Action"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Half-Life: Alyx",
         "description": "VR-Shooter im Half-Life-Universum, setzt neue Maßstäbe für VR.",
         "price": 49.99, "release_date": "2020-03-23", "publisher_id": pub_map["Valve"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/546560/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC"],
         "min_requirements": "Intel i5-7500, GTX 1060, 12 GB RAM, VR Headset",
         "tag_names": ["Shooter", "VR", "Action", "Sci-Fi", "Story Rich"], "created_at": datetime.utcnow()},

        # === FromSoftware (3 Spiele) ===
        {"_id": ObjectId(), "title": "Elden Ring",
         "description": "Open-World Action-RPG von FromSoftware und George R.R. Martin.",
         "price": 49.99, "release_date": "2022-02-25", "publisher_id": pub_map["FromSoftware"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-8400, GTX 1060, 12 GB RAM",
         "tag_names": ["Action", "RPG", "Open World", "Souls-like", "Co-op"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Dark Souls III",
         "description": "Herausforderndes Action-RPG in einer dunklen Fantasy-Welt.",
         "price": 39.99, "release_date": "2016-04-12", "publisher_id": pub_map["FromSoftware"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i3-2100, GTX 750 Ti, 4 GB RAM",
         "tag_names": ["Action", "RPG", "Souls-like", "Dark Fantasy", "Co-op"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Sekiro: Shadows Die Twice",
         "description": "Anspruchsvolles Action-Adventure im feudalen Japan.",
         "price": 39.99, "release_date": "2019-03-22", "publisher_id": pub_map["FromSoftware"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i3-2100, GTX 760, 4 GB RAM",
         "tag_names": ["Action", "Adventure", "Souls-like", "Singleplayer", "Stealth"], "created_at": datetime.utcnow()},

        # === Supergiant Games (2 Spiele) ===
        {"_id": ObjectId(), "title": "Hades",
         "description": "Roguelike Action-Spiel aus der griechischen Mythologie.",
         "price": 24.99, "release_date": "2020-09-17", "publisher_id": pub_map["Supergiant Games"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel i5, GTX 660, 4 GB RAM",
         "tag_names": ["Roguelike", "Action", "Indie", "Story Rich"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Hades II",
         "description": "Roguelike-Nachfolger, spiele als Melinoë gegen den Titan der Zeit.",
         "price": 29.99, "release_date": "2024-05-06", "publisher_id": pub_map["Supergiant Games"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC"],
         "min_requirements": "Intel i5, GTX 960, 8 GB RAM",
         "tag_names": ["Roguelike", "Action", "Indie", "Early Access"], "created_at": datetime.utcnow()},

        # === Mojang Studios (1 Spiel) ===
        {"_id": ObjectId(), "title": "Minecraft",
         "description": "Sandbox-Spiel zum Bauen, Erkunden und Überleben.",
         "price": 26.95, "release_date": "2011-11-18", "publisher_id": pub_map["Mojang Studios"],
         "cover_url": "https://howlongtobeat.com/games/6064_Minecraft.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch", "Mobile"],
         "min_requirements": "Intel i3, Intel HD 4000, 4 GB RAM",
         "tag_names": ["Sandbox", "Survival", "Multiplayer", "Creative"], "created_at": datetime.utcnow()},

        # === ConcernedApe (1 Spiel) ===
        {"_id": ObjectId(), "title": "Stardew Valley",
         "description": "Farming-Simulation mit RPG-Elementen und Charme.",
         "price": 13.99, "release_date": "2016-02-26", "publisher_id": pub_map["ConcernedApe"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch", "Mobile"],
         "min_requirements": "2 GHz, 256 MB RAM",
         "tag_names": ["Simulation", "RPG", "Indie", "Multiplayer", "Relaxing"], "created_at": datetime.utcnow()},

        # === Rockstar Games (2 Spiele) ===
        {"_id": ObjectId(), "title": "Red Dead Redemption 2",
         "description": "Episches Western-Abenteuer in einer riesigen Open World.",
         "price": 39.99, "release_date": "2018-10-26", "publisher_id": pub_map["Rockstar Games"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-2500K, GTX 770, 8 GB RAM",
         "tag_names": ["Action", "Adventure", "Open World", "Story Rich", "Western"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Grand Theft Auto V",
         "description": "Open-World Action-Adventure in Los Santos mit Online-Modus.",
         "price": 29.99, "release_date": "2013-09-17", "publisher_id": pub_map["Rockstar Games"],
         "cover_url": "https://static0.polygonimages.com/wordpress/wp-content/uploads/sharedimages/2024/12/mixcollage-08-dec-2024-01-51-pm-5640.jpg?q=50&fit=contain&w=480&dpr=1.5",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5 3470, GTX 660, 8 GB RAM",
         "tag_names": ["Action", "Open World", "Multiplayer", "Crime", "Shooter"], "created_at": datetime.utcnow()},

        # === Ubisoft (2 Spiele) ===
        {"_id": ObjectId(), "title": "Assassin's Creed Valhalla",
         "description": "Action-RPG als Wikinger im mittelalterlichen England.",
         "price": 29.99, "release_date": "2020-11-10", "publisher_id": pub_map["Ubisoft"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2208920/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-4460, GTX 960, 8 GB RAM",
         "tag_names": ["Action", "RPG", "Open World", "Adventure", "Historical"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Far Cry 6",
         "description": "Ego-Shooter in einer tropischen Inselrevolution.",
         "price": 29.99, "release_date": "2021-10-07", "publisher_id": pub_map["Ubisoft"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2369390/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-4460, GTX 960, 8 GB RAM",
         "tag_names": ["Shooter", "Action", "Open World", "Co-op"], "created_at": datetime.utcnow()},

        # === Bethesda (2 Spiele) ===
        {"_id": ObjectId(), "title": "The Elder Scrolls V: Skyrim",
         "description": "Legendäres Open-World Fantasy-RPG in der Provinz Himmelsrand.",
         "price": 39.99, "release_date": "2011-11-11", "publisher_id": pub_map["Bethesda"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/489830/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel i5-750, GTX 260, 4 GB RAM",
         "tag_names": ["RPG", "Open World", "Fantasy", "Adventure", "Singleplayer"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Fallout 4",
         "description": "Postapokalyptisches Open-World RPG im Ödland von Boston.",
         "price": 19.99, "release_date": "2015-11-10", "publisher_id": pub_map["Bethesda"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-2300, GTX 550 Ti, 8 GB RAM",
         "tag_names": ["RPG", "Open World", "Post-Apocalyptic", "Shooter", "Singleplayer"], "created_at": datetime.utcnow()},

        # === Capcom (2 Spiele) ===
        {"_id": ObjectId(), "title": "Resident Evil 4 Remake",
         "description": "Neuauflage des Survival-Horror-Klassikers.",
         "price": 49.99, "release_date": "2023-03-24", "publisher_id": pub_map["Capcom"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-8400, GTX 1070, 12 GB RAM",
         "tag_names": ["Horror", "Action", "Survival", "Shooter", "Singleplayer"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Monster Hunter: World",
         "description": "Kooperatives Action-RPG mit Monstern und Crafting.",
         "price": 29.99, "release_date": "2018-01-26", "publisher_id": pub_map["Capcom"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-4460, GTX 760, 8 GB RAM",
         "tag_names": ["Action", "RPG", "Co-op", "Multiplayer", "Hunting"], "created_at": datetime.utcnow()},

        # === Team Cherry (1 Spiel) ===
        {"_id": ObjectId(), "title": "Hollow Knight",
         "description": "Metroidvania in einer wunderschönen, düsteren Insektenwelt.",
         "price": 14.99, "release_date": "2017-02-24", "publisher_id": pub_map["Team Cherry"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel i3, GTX 560, 4 GB RAM",
         "tag_names": ["Metroidvania", "Action", "Indie", "Platformer", "Souls-like"], "created_at": datetime.utcnow()},

        # === Re-Logic (1 Spiel) ===
        {"_id": ObjectId(), "title": "Terraria",
         "description": "2D-Sandbox mit Crafting, Erkundung und Bosskämpfen.",
         "price": 9.99, "release_date": "2011-05-16", "publisher_id": pub_map["Re-Logic"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch", "Mobile"],
         "min_requirements": "1.6 GHz, 512 MB RAM",
         "tag_names": ["Sandbox", "Survival", "Multiplayer", "Indie", "Crafting"], "created_at": datetime.utcnow()},
    ]
    await db["games"].insert_many(games)
    game_map = {g["title"]: str(g["_id"]) for g in games}
    print(f"[OK] {len(games)} Spiele erstellt")

    # ── 3. Users ─────────────────────────────
    users = [
        {"_id": ObjectId(), "username": "pixel_paul", "email": "paul@example.com",
         "display_name": "Paul G.", "wallet_balance": 150.00, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "gamer_girl_lisa", "email": "lisa@example.com",
         "display_name": "Lisa M.", "wallet_balance": 75.50, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "rpg_master_tom", "email": "tom@example.com",
         "display_name": "Tom R.", "wallet_balance": 200.00, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "casual_sarah", "email": "sarah@example.com",
         "display_name": "Sarah K.", "wallet_balance": 30.00, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "indie_fan_max", "email": "max@example.com",
         "display_name": "Max W.", "wallet_balance": 55.00, "created_at": datetime.utcnow()},
    ]
    await db["users"].insert_many(users)
    user_map = {u["username"]: str(u["_id"]) for u in users}
    print(f"[OK] {len(users)} User erstellt")

    # ── 4. Purchases (52 Käufe) ─────────────────────────
    # Erweiterte Käufe für alle 25 Spiele verteilt auf die User
    purchases_data = [
        # Paul: Hardcore-Gamer mit AAA-Fokus (12 Spiele)
        (user_map["pixel_paul"], game_map["Elden Ring"], 49.99),
        (user_map["pixel_paul"], game_map["Counter-Strike 2"], 0.00),
        (user_map["pixel_paul"], game_map["The Witcher 3: Wild Hunt"], 29.99),
        (user_map["pixel_paul"], game_map["Cyberpunk 2077"], 39.99),
        (user_map["pixel_paul"], game_map["Dark Souls III"], 39.99),
        (user_map["pixel_paul"], game_map["Sekiro: Shadows Die Twice"], 39.99),
        (user_map["pixel_paul"], game_map["Red Dead Redemption 2"], 39.99),
        (user_map["pixel_paul"], game_map["Grand Theft Auto V"], 29.99),
        (user_map["pixel_paul"], game_map["Resident Evil 4 Remake"], 49.99),
        (user_map["pixel_paul"], game_map["Monster Hunter: World"], 29.99),
        (user_map["pixel_paul"], game_map["Half-Life: Alyx"], 49.99),
        (user_map["pixel_paul"], game_map["Far Cry 6"], 29.99),
        
        # Lisa: Nintendo & Indies (10 Spiele)
        (user_map["gamer_girl_lisa"], game_map["The Legend of Zelda: Tears of the Kingdom"], 59.99),
        (user_map["gamer_girl_lisa"], game_map["Super Mario Odyssey"], 49.99),
        (user_map["gamer_girl_lisa"], game_map["Animal Crossing: New Horizons"], 49.99),
        (user_map["gamer_girl_lisa"], game_map["Hades"], 24.99),
        (user_map["gamer_girl_lisa"], game_map["Hades II"], 29.99),
        (user_map["gamer_girl_lisa"], game_map["Stardew Valley"], 13.99),
        (user_map["gamer_girl_lisa"], game_map["Hollow Knight"], 14.99),
        (user_map["gamer_girl_lisa"], game_map["Terraria"], 9.99),
        (user_map["gamer_girl_lisa"], game_map["Minecraft"], 26.95),
        (user_map["gamer_girl_lisa"], game_map["Portal 2"], 9.99),
        
        # Tom: RPG-Enthusiast (11 Spiele)
        (user_map["rpg_master_tom"], game_map["The Witcher 3: Wild Hunt"], 29.99),
        (user_map["rpg_master_tom"], game_map["Cyberpunk 2077"], 39.99),
        (user_map["rpg_master_tom"], game_map["Elden Ring"], 49.99),
        (user_map["rpg_master_tom"], game_map["Dark Souls III"], 39.99),
        (user_map["rpg_master_tom"], game_map["The Elder Scrolls V: Skyrim"], 39.99),
        (user_map["rpg_master_tom"], game_map["Fallout 4"], 19.99),
        (user_map["rpg_master_tom"], game_map["Red Dead Redemption 2"], 39.99),
        (user_map["rpg_master_tom"], game_map["Assassin's Creed Valhalla"], 29.99),
        (user_map["rpg_master_tom"], game_map["Monster Hunter: World"], 29.99),
        (user_map["rpg_master_tom"], game_map["Sekiro: Shadows Die Twice"], 39.99),
        (user_map["rpg_master_tom"], game_map["Hades"], 24.99),
        
        # Sarah: Casual-Gamer (8 Spiele)
        (user_map["casual_sarah"], game_map["Minecraft"], 26.95),
        (user_map["casual_sarah"], game_map["Stardew Valley"], 13.99),
        (user_map["casual_sarah"], game_map["Animal Crossing: New Horizons"], 49.99),
        (user_map["casual_sarah"], game_map["Super Mario Odyssey"], 49.99),
        (user_map["casual_sarah"], game_map["Portal 2"], 9.99),
        (user_map["casual_sarah"], game_map["Terraria"], 9.99),
        (user_map["casual_sarah"], game_map["The Elder Scrolls V: Skyrim"], 39.99),
        (user_map["casual_sarah"], game_map["Grand Theft Auto V"], 29.99),
        
        # Max: Indie-Fan (11 Spiele)
        (user_map["indie_fan_max"], game_map["Hades"], 24.99),
        (user_map["indie_fan_max"], game_map["Hades II"], 29.99),
        (user_map["indie_fan_max"], game_map["Stardew Valley"], 13.99),
        (user_map["indie_fan_max"], game_map["Minecraft"], 26.95),
        (user_map["indie_fan_max"], game_map["Portal 2"], 9.99),
        (user_map["indie_fan_max"], game_map["Counter-Strike 2"], 0.00),
        (user_map["indie_fan_max"], game_map["Hollow Knight"], 14.99),
        (user_map["indie_fan_max"], game_map["Terraria"], 9.99),
        (user_map["indie_fan_max"], game_map["The Legend of Zelda: Tears of the Kingdom"], 59.99),
        (user_map["indie_fan_max"], game_map["Elden Ring"], 49.99),
        (user_map["indie_fan_max"], game_map["Dark Souls III"], 39.99),
    ]

    purchases_docs = []
    for uid, gid, price in purchases_data:
        purchases_docs.append({
            "_id": ObjectId(), "user_id": uid, "game_id": gid,
            "price_paid": price, "created_at": datetime.utcnow()
        })
    await db["purchases"].insert_many(purchases_docs)
    print(f"[OK] {len(purchases_docs)} Kaeufe erstellt")

    # ── 5. Reviews (44 Reviews) ───────────────────────────
    reviews_data = [
        # === Paul: AAA & Hardcore Fokus ===
        {"_id": ObjectId(), "user_id": user_map["pixel_paul"], "game_id": game_map["Elden Ring"],
         "rating": 5, "text": "Bestes Spiel aller Zeiten. Die Open World ist atemberaubend.", "recommended": True, "playtime_hours": 120, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["pixel_paul"], "game_id": game_map["Counter-Strike 2"],
         "rating": 4, "text": "Immer noch der beste taktische Shooter.", "recommended": True, "playtime_hours": 500, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["pixel_paul"], "game_id": game_map["The Witcher 3: Wild Hunt"],
         "rating": 5, "text": "Story und Welt sind unglaublich.", "recommended": True, "playtime_hours": 95, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["pixel_paul"], "game_id": game_map["Cyberpunk 2077"],
         "rating": 4, "text": "Nach den Patches endlich das Spiel das es sein sollte.", "recommended": True, "playtime_hours": 65, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["pixel_paul"], "game_id": game_map["Dark Souls III"],
         "rating": 5, "text": "Perfektes Souls-Spiel. Jeder Boss ist unvergesslich.", "recommended": True, "playtime_hours": 85, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["pixel_paul"], "game_id": game_map["Red Dead Redemption 2"],
         "rating": 5, "text": "Arthur Morgans Geschichte hat mich zu Tränen gerührt.", "recommended": True, "playtime_hours": 110, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["pixel_paul"], "game_id": game_map["Resident Evil 4 Remake"],
         "rating": 5, "text": "So macht man ein Remake! Respektiert das Original.", "recommended": True, "playtime_hours": 25, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["pixel_paul"], "game_id": game_map["Half-Life: Alyx"],
         "rating": 5, "text": "Das ist die Zukunft von Gaming. VR war nie besser.", "recommended": True, "playtime_hours": 15, "created_at": datetime.utcnow()},
        
        # === Lisa: Nintendo & Indies ===
        {"_id": ObjectId(), "user_id": user_map["gamer_girl_lisa"], "game_id": game_map["The Legend of Zelda: Tears of the Kingdom"],
         "rating": 5, "text": "Die Kreativität kennt keine Grenzen!", "recommended": True, "playtime_hours": 80, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["gamer_girl_lisa"], "game_id": game_map["Hades"],
         "rating": 5, "text": "Perfektes Gameplay-Loop. Spiele es immer noch.", "recommended": True, "playtime_hours": 45, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["gamer_girl_lisa"], "game_id": game_map["Stardew Valley"],
         "rating": 5, "text": "So entspannend. Perfekt nach einem langen Tag.", "recommended": True, "playtime_hours": 200, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["gamer_girl_lisa"], "game_id": game_map["Animal Crossing: New Horizons"],
         "rating": 5, "text": "Meine Insel ist mein Happy Place. Pure Entspannung.", "recommended": True, "playtime_hours": 300, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["gamer_girl_lisa"], "game_id": game_map["Hollow Knight"],
         "rating": 5, "text": "Wunderschön und herausfordernd. Metroidvania-Perfektion.", "recommended": True, "playtime_hours": 40, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["gamer_girl_lisa"], "game_id": game_map["Hades II"],
         "rating": 4, "text": "Noch im Early Access, aber jetzt schon fantastisch!", "recommended": True, "playtime_hours": 30, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["gamer_girl_lisa"], "game_id": game_map["Super Mario Odyssey"],
         "rating": 5, "text": "Nintendo-Magie pur. Jedes Kingdom ist ein Highlight.", "recommended": True, "playtime_hours": 35, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["gamer_girl_lisa"], "game_id": game_map["Terraria"],
         "rating": 4, "text": "Unendlich viel Content. Mit Freunden noch besser!", "recommended": True, "playtime_hours": 100, "created_at": datetime.utcnow()},
        
        # === Tom: RPG-Meister ===
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["The Witcher 3: Wild Hunt"],
         "rating": 5, "text": "Das RPG schlechthin. Jede Nebenquest ist ein Meisterwerk.", "recommended": True, "playtime_hours": 150, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["Elden Ring"],
         "rating": 5, "text": "FromSoftware hat sich selbst übertroffen.", "recommended": True, "playtime_hours": 200, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["Cyberpunk 2077"],
         "rating": 3, "text": "Gute Story, aber technisch noch ausbaufähig.", "recommended": False, "playtime_hours": 40, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["The Elder Scrolls V: Skyrim"],
         "rating": 5, "text": "Hunderte Stunden und immer noch Neues zu entdecken.", "recommended": True, "playtime_hours": 500, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["Fallout 4"],
         "rating": 4, "text": "Solides Fallout. Settlement-Building macht süchtig.", "recommended": True, "playtime_hours": 120, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["Red Dead Redemption 2"],
         "rating": 5, "text": "Kein Spiel ist so immersiv. Meisterwerk der Atmosphäre.", "recommended": True, "playtime_hours": 130, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["Assassin's Creed Valhalla"],
         "rating": 4, "text": "Zu lang, aber die Wikinger-Atmosphäre ist super.", "recommended": True, "playtime_hours": 80, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["Monster Hunter: World"],
         "rating": 5, "text": "Endlich Monster Hunter für alle zugänglich!", "recommended": True, "playtime_hours": 180, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["rpg_master_tom"], "game_id": game_map["Dark Souls III"],
         "rating": 5, "text": "Der würdige Abschluss der Trilogie.", "recommended": True, "playtime_hours": 100, "created_at": datetime.utcnow()},
        
        # === Sarah: Casual-Gaming ===
        {"_id": ObjectId(), "user_id": user_map["casual_sarah"], "game_id": game_map["Minecraft"],
         "rating": 5, "text": "Zeitlos. Spiele es seit Jahren.", "recommended": True, "playtime_hours": 300, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["casual_sarah"], "game_id": game_map["Stardew Valley"],
         "rating": 4, "text": "Süß und macht Spaß, aber irgendwann repetitiv.", "recommended": True, "playtime_hours": 60, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["casual_sarah"], "game_id": game_map["Super Mario Odyssey"],
         "rating": 5, "text": "Pure Freude. Mario at its best.", "recommended": True, "playtime_hours": 25, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["casual_sarah"], "game_id": game_map["Animal Crossing: New Horizons"],
         "rating": 5, "text": "Hat mir durch 2020 geholfen. Danke, Nintendo!", "recommended": True, "playtime_hours": 400, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["casual_sarah"], "game_id": game_map["Portal 2"],
         "rating": 5, "text": "Brilliant. GLaDOS ist legendär.", "recommended": True, "playtime_hours": 12, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["casual_sarah"], "game_id": game_map["Terraria"],
         "rating": 4, "text": "Macht Spaß mit Freunden, alleine etwas grindig.", "recommended": True, "playtime_hours": 50, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["casual_sarah"], "game_id": game_map["The Elder Scrolls V: Skyrim"],
         "rating": 4, "text": "Schöne Welt zum Erkunden, wenn auch etwas buggy.", "recommended": True, "playtime_hours": 70, "created_at": datetime.utcnow()},
        
        # === Max: Indie-Enthusiast ===
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Hades"],
         "rating": 5, "text": "Supergiant hat es wieder geschafft. Meisterhaft.", "recommended": True, "playtime_hours": 80, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Stardew Valley"],
         "rating": 5, "text": "Ein Mann hat das gemacht. Wahnsinn.", "recommended": True, "playtime_hours": 150, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Portal 2"],
         "rating": 5, "text": "Genial. Der Humor, die Puzzles, alles passt.", "recommended": True, "playtime_hours": 15, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Hollow Knight"],
         "rating": 5, "text": "15€ für über 40 Stunden Content. Unschlagbar.", "recommended": True, "playtime_hours": 60, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Terraria"],
         "rating": 5, "text": "10 Jahre Support von Re-Logic. Vorbildlich!", "recommended": True, "playtime_hours": 200, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Hades II"],
         "rating": 5, "text": "Der Early Access zeigt: wird noch besser als Teil 1!", "recommended": True, "playtime_hours": 35, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Elden Ring"],
         "rating": 4, "text": "Großartig, aber die Open World ist manchmal too much.", "recommended": True, "playtime_hours": 70, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Minecraft"],
         "rating": 5, "text": "Das Spiel meiner Kindheit. Wird nie alt.", "recommended": True, "playtime_hours": 500, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["The Legend of Zelda: Tears of the Kingdom"],
         "rating": 5, "text": "Nintendo zeigt wie man Innovation macht.", "recommended": True, "playtime_hours": 65, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["indie_fan_max"], "game_id": game_map["Dark Souls III"],
         "rating": 5, "text": "Harte aber faire Herausforderung. Klassiker!", "recommended": True, "playtime_hours": 90, "created_at": datetime.utcnow()},
    ]
    await db["reviews"].insert_many(reviews_data)
    print(f"[OK] {len(reviews_data)} Reviews erstellt")

    # ── Neo4j: Graph aufbauen ────────────────
    async with driver.session() as session:
        # User-Knoten
        for username, uid in user_map.items():
            await session.run("CREATE (u:User {userId: $uid})", uid=uid)

        # Game-Knoten
        for game in games:
            gid = str(game["_id"])
            await session.run("CREATE (g:Game {gameId: $gid})", gid=gid)

        # Tag-Knoten + TAGGED_WITH
        all_tags = set()
        for game in games:
            for tag in game["tag_names"]:
                all_tags.add(tag)
        for tag in all_tags:
            await session.run("MERGE (t:Tag {name: $name})", name=tag)

        for game in games:
            gid = str(game["_id"])
            for tag in game["tag_names"]:
                await session.run(
                    """
                    MATCH (g:Game {gameId: $gid}), (t:Tag {name: $tag})
                    CREATE (g)-[:TAGGED_WITH]->(t)
                    """,
                    gid=gid, tag=tag
                )

        # OWNS-Beziehungen (aus Purchases)
        for uid, gid, _ in purchases_data:
            await session.run(
                """
                MATCH (u:User {userId: $uid}), (g:Game {gameId: $gid})
                CREATE (u)-[:OWNS {purchaseDate: datetime()}]->(g)
                """,
                uid=uid, gid=gid
            )

        # FRIENDS_WITH-Beziehungen
        friendships = [
            ("pixel_paul", "rpg_master_tom"),
            ("pixel_paul", "gamer_girl_lisa"),
            ("gamer_girl_lisa", "casual_sarah"),
            ("gamer_girl_lisa", "indie_fan_max"),
            ("rpg_master_tom", "indie_fan_max"),
            ("casual_sarah", "indie_fan_max"),
        ]
        for u1, u2 in friendships:
            await session.run(
                """
                MATCH (u1:User {userId: $uid1}), (u2:User {userId: $uid2})
                CREATE (u1)-[:FRIENDS_WITH]->(u2)
                """,
                uid1=user_map[u1], uid2=user_map[u2]
            )

    print("[OK] Neo4j Graph aufgebaut")
    print("[DONE] Seed-Daten vollstaendig geladen!")

    return {
        "publishers": len(publishers),
        "games": len(games),
        "users": len(users),
        "purchases": len(purchases_docs),
        "reviews": len(reviews_data),
        "friendships": len(friendships),
        "tags": len(all_tags)
    }
