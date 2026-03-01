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
        {"_id": ObjectId(), "name": "Devolver Digital", "description": "Indie-Publisher, bekannt für Cult of the Lamb und Hotline Miami",
         "website": "https://devolverdigital.com", "founded_year": 2009, "country": "USA"},
        {"_id": ObjectId(), "name": "Game Science", "description": "Entwickler von Black Myth: Wukong",
         "website": "https://www.heishenhua.com", "founded_year": 2014, "country": "China"},
        {"_id": ObjectId(), "name": "Mojang Studios", "description": "Schöpfer von Minecraft",
         "website": "https://mojang.com", "founded_year": 2009, "country": "Schweden"},
        {"_id": ObjectId(), "name": "ConcernedApe", "description": "Ein-Mann-Studio von Eric Barone, Schöpfer von Stardew Valley",
         "website": "https://stardewvalley.net", "founded_year": 2012, "country": "USA"},
        {"_id": ObjectId(), "name": "Rockstar Games", "description": "Entwickler von GTA und Red Dead Redemption",
         "website": "https://rockstargames.com", "founded_year": 1998, "country": "USA"},
        {"_id": ObjectId(), "name": "Sony Interactive Entertainment", "description": "Japanischer Publisher, bekannt für God of War und PlayStation-Exklusivtitel",
         "website": "https://sonyinteractive.com", "founded_year": 1993, "country": "Japan"},
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
        # === Nintendo (3 Spiele + 2 Pokémon am Ende) ===
        {"_id": ObjectId(), "title": "The Legend of Zelda: Tears of the Kingdom",
         "description": "Open-World-Abenteuer in Hyrule mit kreativen Bau-Mechaniken.",
         "price": 69.99, "release_date": "2023-05-12", "publisher_id": pub_map["Nintendo"],
         "cover_url": "/zelda_totk.jpg",
         "screenshots": [], "platforms": ["Switch"], "min_requirements": "Nintendo Switch",
         "tag_names": ["Action", "Adventure", "Open World"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Super Mario Odyssey",
         "description": "Mario reist um die Welt und sammelt Power Moons.",
         "price": 59.99, "release_date": "2017-10-27", "publisher_id": pub_map["Nintendo"],
         "cover_url": "/mario_odyssey.jpg",
         "screenshots": [], "platforms": ["Switch"], "min_requirements": "Nintendo Switch",
         "tag_names": ["Platformer", "Adventure"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Animal Crossing: New Horizons",
         "description": "Lebenssimulation auf deiner eigenen Insel.",
         "price": 59.99, "release_date": "2020-03-20", "publisher_id": pub_map["Nintendo"],
         "cover_url": "https://m.media-amazon.com/images/I/71kCvUDA41L._AC_UF894,1000_QL80_.jpg",
         "screenshots": [], "platforms": ["Switch"], "min_requirements": "Nintendo Switch",
         "tag_names": ["Simulation"], "created_at": datetime.utcnow()},

        # === CD Projekt Red (2 Spiele) ===
        {"_id": ObjectId(), "title": "The Witcher 3: Wild Hunt",
         "description": "Episches Open-World RPG als Hexer Geralt von Riva.",
         "price": 29.99, "release_date": "2015-05-19", "publisher_id": pub_map["CD Projekt Red"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel i5-2500K, GTX 660, 6 GB RAM",
         "tag_names": ["RPG", "Open World", "Action"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Cyberpunk 2077",
         "description": "Open-World RPG in der dystopischen Megacity Night City.",
         "price": 59.99, "release_date": "2020-12-10", "publisher_id": pub_map["CD Projekt Red"],
         "cover_url": "/cyberpunk2077.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i7-6700, GTX 1060, 12 GB RAM",
         "tag_names": ["RPG", "Open World", "Action"], "created_at": datetime.utcnow()},

        # === Valve (3 Spiele) ===
        {"_id": ObjectId(), "title": "Garry's Mod",
         "description": "Garry's Mod is a physics sandbox. There aren't any predefined aims or goals. We give you the tools and leave you to play.",
         "price": 9.99, "release_date": "2006-11-29", "publisher_id": pub_map["Valve"],
         "cover_url": "https://e.snmc.io/lk/f/x/9ea3ebfda4a41d1446314f65d984f5af/8964943",
         "screenshots": [], "platforms": ["PC"], "min_requirements": "Intel 1.7 GHz, 512 MB RAM",
         "tag_names": ["Co-op", "Shooter"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Counter-Strike 2",
         "description": "Taktischer, teambasierter First-Person-Shooter.",
         "price": 0.0, "release_date": "2023-09-27", "publisher_id": pub_map["Valve"],
         "cover_url": "/cs2.png",
         "screenshots": [], "platforms": ["PC"],
         "min_requirements": "Intel i5-750, GTX 660, 8 GB RAM",
         "tag_names": ["Shooter", "Action", "Competitive"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Team Fortress 2",
         "description": "kostenloser, teambasierter Comic-Shooter von Valve, der für sein schnelles Gameplay, den Humor und die neun einzigartigen Charakterklassen bekannt ist",
         "price": 0.00, "release_date": "2007-10-10", "publisher_id": pub_map["Valve"],
         "cover_url": "/tf2.jpg",
         "screenshots": [], "platforms": ["PC"],
         "min_requirements": "Intel i5-750, GTX 660, 8 GB RAM",
         "tag_names": ["Shooter", "Free to Play", "Action"], "created_at": datetime.utcnow()},

        # === FromSoftware (3 Spiele) ===
        {"_id": ObjectId(), "title": "Elden Ring",
         "description": "Open-World Action-RPG von FromSoftware und George R.R. Martin.",
         "price": 59.99, "release_date": "2022-02-25", "publisher_id": pub_map["FromSoftware"],
         "cover_url": "/elden_ring.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-8400, GTX 1060, 12 GB RAM",
         "tag_names": ["Action", "RPG", "Open World", "Co-op"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Dark Souls III",
         "description": "Herausforderndes Action-RPG in einer dunklen Fantasy-Welt.",
         "price": 59.99, "release_date": "2016-04-12", "publisher_id": pub_map["FromSoftware"],
         "cover_url": "/dark_souls_3.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i3-2100, GTX 750 Ti, 4 GB RAM",
         "tag_names": ["Action", "RPG", "Fantasy", "Co-op"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Sekiro: Shadows Die Twice",
         "description": "Anspruchsvolles Action-Adventure im feudalen Japan.",
         "price": 59.99, "release_date": "2019-03-22", "publisher_id": pub_map["FromSoftware"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i3-2100, GTX 760, 4 GB RAM",
         "tag_names": ["Action", "Adventure"], "created_at": datetime.utcnow()},

        # === Devolver Digital & Game Science ===
        {"_id": ObjectId(), "title": "Cult of the Lamb",
         "description": "Starte deinen eigenen Kult im Land der falschen Propheten.",
         "price": 22.99, "release_date": "2022-08-11", "publisher_id": pub_map["Devolver Digital"],
         "cover_url": "/cult_of_the_lamb.png",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel Core i3-3240, GTX 560, 4 GB RAM",
         "tag_names": ["Indie", "Action", "Strategy"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Black Myth: Wukong",
         "description": "Action-RPG verwurzelt in chinesischer Mythologie.",
         "price": 59.99, "release_date": "2024-08-20", "publisher_id": pub_map["Game Science"],
         "cover_url": "/wukong.png",
         "screenshots": [], "platforms": ["PC", "PS5"],
         "min_requirements": "Intel Core i5-8400, GTX 1060, 16 GB RAM",
         "tag_names": ["Action", "RPG", "Fantasy"], "created_at": datetime.utcnow()},

        # === Mojang Studios (1 Spiel) ===
        {"_id": ObjectId(), "title": "Minecraft",
         "description": "Sandbox-Spiel zum Bauen, Erkunden und Überleben.",
         "price": 29.99, "release_date": "2011-11-18", "publisher_id": pub_map["Mojang Studios"],
         "cover_url": "https://howlongtobeat.com/games/6064_Minecraft.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel i3, Intel HD 4000, 4 GB RAM",
         "tag_names": ["Adventure", "Simulation", "Open World", "Co-op"], "created_at": datetime.utcnow()},

        # === ConcernedApe (1 Spiel) ===
        {"_id": ObjectId(), "title": "Stardew Valley",
         "description": "Farming-Simulation mit RPG-Elementen und Charme.",
         "price": 13.99, "release_date": "2016-02-26", "publisher_id": pub_map["ConcernedApe"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "2 GHz, 256 MB RAM",
         "tag_names": ["Simulation", "RPG", "Indie", "Co-op"], "created_at": datetime.utcnow()},

        # === Rockstar Games (3 Spiele) ===
        {"_id": ObjectId(), "title": "GTA VI",
         "description": "WELCOME TO LEONIDA Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the Grand Theft Auto series yet.",
         "price": 99.99, "release_date": "2026-11-19", "publisher_id": pub_map["Rockstar Games"],
         "cover_url": "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FJason_and_Lucia_01_With_Logos_landscape.8596f77a.jpg&w=3840&q=75",
         "screenshots": [], "platforms": ["PS5", "Xbox"],
         "min_requirements": "PS5 / Xbox Series X",
         "tag_names": ["Action", "RPG", "Open World"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Red Dead Redemption 2",
         "description": "Episches Western-Abenteuer in einer riesigen Open World.",
         "price": 59.99, "release_date": "2018-10-26", "publisher_id": pub_map["Rockstar Games"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-2500K, GTX 770, 8 GB RAM",
         "tag_names": ["Action", "Adventure", "Open World"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Grand Theft Auto V",
         "description": "Open-World Action-Adventure in Los Santos mit Online-Modus.",
         "price": 29.99, "release_date": "2013-09-17", "publisher_id": pub_map["Rockstar Games"],
         "cover_url": "/gta_v.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5 3470, GTX 660, 8 GB RAM",
         "tag_names": ["Action", "Open World", "Shooter"], "created_at": datetime.utcnow()},

        # === Sony Interactive Entertainment (2 Spiele) ===
        {"_id": ObjectId(), "title": "God of War Ragnarök",
         "description": "Kratos und Atreus begeben sich auf eine epische Reise durch die neun Welten der nordischen Mythologie, um Ragnarök aufzuhalten.",
         "price": 79.99, "release_date": "2022-11-09", "publisher_id": pub_map["Sony Interactive Entertainment"],
         "cover_url": "/gow_ragnarok.jpg",
         "screenshots": [], "platforms": ["PC", "PS5"],
         "min_requirements": "Intel i5-8600, GTX 1070, 16 GB RAM",
         "tag_names": ["Action", "Adventure", "Fantasy"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "God of War: Sons of Sparta",
         "description": "Erlebe die Ursprünge von Kratos im antiken Griechenland. Ein episches Platformer-Abenteuer als Sohn Spartas.",
         "price": 29.99, "release_date": "2026-02-12", "publisher_id": pub_map["Sony Interactive Entertainment"],
         "cover_url": "/gow_sons_of_sparta.jpg",
         "screenshots": [], "platforms": ["PS5"],
         "min_requirements": "PS5",
         "tag_names": ["Platformer", "Action", "Adventure"], "created_at": datetime.utcnow()},

        # === Bethesda (2 Spiele) ===
        {"_id": ObjectId(), "title": "The Elder Scrolls V: Skyrim",
         "description": "Legendäres Open-World Fantasy-RPG in der Provinz Himmelsrand.",
         "price": 39.99, "release_date": "2011-11-11", "publisher_id": pub_map["Bethesda"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/489830/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel i5-750, GTX 260, 4 GB RAM",
         "tag_names": ["RPG", "Open World", "Fantasy", "Adventure"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Fallout 4",
         "description": "Postapokalyptisches Open-World RPG im Ödland von Boston.",
         "price": 19.99, "release_date": "2015-11-10", "publisher_id": pub_map["Bethesda"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-2300, GTX 550 Ti, 8 GB RAM",
         "tag_names": ["RPG", "Open World", "Shooter"], "created_at": datetime.utcnow()},

        # === Capcom (3 Spiele) ===
        {"_id": ObjectId(), "title": "PRAGMATA",
         "description": "Capcoms neueste IP: PRAGMATA. Ein neues Science-Fiction-Action-Abenteuer mit einem einzigartigen Hacking-Twist!",
         "price": 59.99, "release_date": "2026-04-26", "publisher_id": pub_map["Capcom"],
         "cover_url": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Pragmata_cover.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-10400, RTX 2060, 16 GB RAM",
         "tag_names": ["Action", "Adventure"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Resident Evil 9 Requiem",
         "description": "Requiem für die Toten. Albtraum für die Lebenden. Die neue Generation des Survival-Horrors.",
         "price": 69.99, "release_date": "2026-02-27", "publisher_id": pub_map["Capcom"],
         "cover_url": "/re9_requiem.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-8400, GTX 1070, 12 GB RAM",
         "tag_names": ["Horror", "Action", "Shooter"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Monster Hunter: World",
         "description": "Kooperatives Action-RPG mit Monstern und Crafting.",
         "price": 29.99, "release_date": "2018-01-26", "publisher_id": pub_map["Capcom"],
         "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/library_600x900_2x.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox"],
         "min_requirements": "Intel i5-4460, GTX 760, 8 GB RAM",
         "tag_names": ["Action", "RPG", "Co-op"], "created_at": datetime.utcnow()},

        # === Team Cherry (1 Spiel) ===
        {"_id": ObjectId(), "title": "Hollow Knight: Silksong",
         "description": "Entdecke in Hollow Knight: Silksong ein riesiges verwunschenes Königreich! Erkunde, kämpfe und überlebe, während du zum Gipfel eines Landes aufsteigst, in dem Seide und Gesang regieren.",
         "price": 19.50, "release_date": "2025-09-04", "publisher_id": pub_map["Team Cherry"],
         "cover_url": "/silksong.jpg",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "Intel i3, GTX 560, 4 GB RAM",
         "tag_names": ["Action", "Indie", "Platformer"], "created_at": datetime.utcnow()},

        # === Re-Logic (1 Spiel) ===
        {"_id": ObjectId(), "title": "Terraria",
         "description": "2D-Sandbox mit Crafting, Erkundung und Bosskämpfen.",
         "price": 9.99, "release_date": "2011-05-16", "publisher_id": pub_map["Re-Logic"],
         "cover_url": "/terraria.png",
         "screenshots": [], "platforms": ["PC", "PS5", "Xbox", "Switch"],
         "min_requirements": "1.6 GHz, 512 MB RAM",
         "tag_names": ["Indie", "Adventure", "Platformer", "Co-op"], "created_at": datetime.utcnow()},

        # === Nintendo: Pokémon (2 Spiele – Pre-Order) ===
        {"_id": ObjectId(), "title": "Pokémon Winds",
         "description": "Pokémon Continues 30th Celebrations with Pokémon Waves and Pokémon Winds, the Newest Entries in the Pokémon Video Game Series",
         "price": 79.99, "release_date": "27.02.2027", "publisher_id": pub_map["Nintendo"],
         "cover_url": "/pokemon_winds.png",
         "screenshots": [], "platforms": ["Switch"],
         "min_requirements": "Nintendo Switch",
         "tag_names": ["RPG", "Adventure"], "created_at": datetime.utcnow()},

        {"_id": ObjectId(), "title": "Pokémon Waves",
         "description": "Pokémon Continues 30th Celebrations with Pokémon Waves and Pokémon Winds, the Newest Entries in the Pokémon Video Game Series",
         "price": 79.99, "release_date": "27.02.2027", "publisher_id": pub_map["Nintendo"],
         "cover_url": "/pokemon_waves.png",
         "screenshots": [], "platforms": ["Switch"],
         "min_requirements": "Nintendo Switch",
         "tag_names": ["RPG", "Adventure"], "created_at": datetime.utcnow()},
    ]
    await db["games"].insert_many(games)
    game_map = {g["title"]: str(g["_id"]) for g in games}
    print(f"[OK] {len(games)} Spiele erstellt")

    # ── 3. Users ─────────────────────────────
    users = [
        {"_id": ObjectId(), "username": "willalo", "email": "willalo@example.com",
         "display_name": "Willalo", "wallet_balance": 150.00, "avatar_url": "/willalo.jpg", "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "im_jannox", "email": "jannox@example.com",
         "display_name": "Jannox", "wallet_balance": 150.00, "avatar_url": "/jannox.png", "address": { "street": "Musterstr 1", "city": "Musterstadt", "zip": "12345", "country": "Deutschland" }, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "1401felix", "email": "1401Felix@example.com",
         "display_name": "1401Felix", "wallet_balance": 75.50, "avatar_url": "/felix.jpg", "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "invalidluca", "email": "invalidluca@example.com",
         "display_name": "Luca", "wallet_balance": 200.00, "avatar_url": "/luca.png", "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "ghostswetterZ", "email": "ghostswetterZ@example.com",
         "display_name": "Arthur", "wallet_balance": 30.00, "avatar_url": "/arthur.jpg", "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "username": "03oreo", "email": "03oreo@example.com",
         "display_name": "Oreo", "wallet_balance": 55.00, "avatar_url": "/oreo.png", "created_at": datetime.utcnow()},
    ]
    await db["users"].insert_many(users)
    user_map = {u["username"]: str(u["_id"]) for u in users}
    print(f"[OK] {len(users)} User erstellt")

    # ── 4. Purchases (52 Käufe) ─────────────────────────
    # Erweiterte Käufe für alle 25 Spiele verteilt auf die User
    purchases_data = [
        # Jannox: Elite Gamer
        (user_map["im_jannox"], game_map["Elden Ring"], 49.99),
        (user_map["im_jannox"], game_map["Cyberpunk 2077"], 39.99),
        (user_map["im_jannox"], game_map["Black Myth: Wukong"], 59.99),
        
        # Paul: Hardcore-Gamer mit AAA-Fokus (12 Spiele)
        (user_map["willalo"], game_map["Elden Ring"], 49.99),
        (user_map["willalo"], game_map["Counter-Strike 2"], 0.00),
        (user_map["willalo"], game_map["The Witcher 3: Wild Hunt"], 29.99),
        (user_map["willalo"], game_map["Cyberpunk 2077"], 39.99),
        (user_map["willalo"], game_map["Dark Souls III"], 39.99),
        (user_map["willalo"], game_map["Sekiro: Shadows Die Twice"], 39.99),
        (user_map["willalo"], game_map["Red Dead Redemption 2"], 39.99),
        (user_map["willalo"], game_map["Grand Theft Auto V"], 29.99),
        (user_map["willalo"], game_map["Resident Evil 9 Requiem"], 69.99),
        (user_map["willalo"], game_map["Monster Hunter: World"], 29.99),
        (user_map["willalo"], game_map["Team Fortress 2"], 0.00),
        (user_map["willalo"], game_map["God of War Ragnarök"], 59.99),
        
        # Lisa: Nintendo & Indies (10 Spiele)
        (user_map["1401felix"], game_map["The Legend of Zelda: Tears of the Kingdom"], 59.99),
        (user_map["1401felix"], game_map["Super Mario Odyssey"], 49.99),
        (user_map["1401felix"], game_map["Animal Crossing: New Horizons"], 49.99),
        (user_map["1401felix"], game_map["Cult of the Lamb"], 22.99),
        (user_map["1401felix"], game_map["Black Myth: Wukong"], 59.99),
        (user_map["1401felix"], game_map["Stardew Valley"], 13.99),
        (user_map["1401felix"], game_map["Hollow Knight: Silksong"], 19.50),
        (user_map["1401felix"], game_map["Terraria"], 9.99),
        (user_map["1401felix"], game_map["Minecraft"], 26.95),
        (user_map["1401felix"], game_map["Garry's Mod"], 9.99),
        
        # Tom: RPG-Enthusiast (11 Spiele)
        (user_map["invalidluca"], game_map["The Witcher 3: Wild Hunt"], 29.99),
        (user_map["invalidluca"], game_map["Cyberpunk 2077"], 39.99),
        (user_map["invalidluca"], game_map["Elden Ring"], 49.99),
        (user_map["invalidluca"], game_map["Dark Souls III"], 39.99),
        (user_map["invalidluca"], game_map["The Elder Scrolls V: Skyrim"], 39.99),
        (user_map["invalidluca"], game_map["Fallout 4"], 19.99),
        (user_map["invalidluca"], game_map["Red Dead Redemption 2"], 39.99),
        (user_map["invalidluca"], game_map["God of War Ragnarök"], 59.99),
        (user_map["invalidluca"], game_map["Monster Hunter: World"], 29.99),
        (user_map["invalidluca"], game_map["Sekiro: Shadows Die Twice"], 39.99),
        (user_map["invalidluca"], game_map["Cult of the Lamb"], 22.99),
        
        # Sarah: Casual-Gamer (8 Spiele)
        (user_map["ghostswetterZ"], game_map["Minecraft"], 26.95),
        (user_map["ghostswetterZ"], game_map["Stardew Valley"], 13.99),
        (user_map["ghostswetterZ"], game_map["Animal Crossing: New Horizons"], 49.99),
        (user_map["ghostswetterZ"], game_map["Super Mario Odyssey"], 49.99),
        (user_map["ghostswetterZ"], game_map["Garry's Mod"], 9.99),
        (user_map["ghostswetterZ"], game_map["Terraria"], 9.99),
        (user_map["ghostswetterZ"], game_map["The Elder Scrolls V: Skyrim"], 39.99),
        (user_map["ghostswetterZ"], game_map["Grand Theft Auto V"], 29.99),
        
        # Max: Indie-Fan (11 Spiele)
        (user_map["03oreo"], game_map["Cult of the Lamb"], 22.99),
        (user_map["03oreo"], game_map["Black Myth: Wukong"], 59.99),
        (user_map["03oreo"], game_map["Stardew Valley"], 13.99),
        (user_map["03oreo"], game_map["Minecraft"], 26.95),
        (user_map["03oreo"], game_map["Garry's Mod"], 9.99),
        (user_map["03oreo"], game_map["Counter-Strike 2"], 0.00),
        (user_map["03oreo"], game_map["Hollow Knight: Silksong"], 19.50),
        (user_map["03oreo"], game_map["Terraria"], 9.99),
        (user_map["03oreo"], game_map["The Legend of Zelda: Tears of the Kingdom"], 59.99),
        (user_map["03oreo"], game_map["Elden Ring"], 49.99),
        (user_map["03oreo"], game_map["Dark Souls III"], 39.99),
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
        # === Willalo (6 Reviews) ===
        {"_id": ObjectId(), "user_id": user_map["willalo"], "game_id": game_map["Elden Ring"],
         "rating": 5, "text": "Bestes Spiel aller Zeiten. Die Open World ist atemberaubend.", "recommended": True, "playtime_hours": 120, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["willalo"], "game_id": game_map["Counter-Strike 2"],
         "rating": 4, "text": "Immer noch der beste taktische Shooter.", "recommended": True, "playtime_hours": 500, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["willalo"], "game_id": game_map["Cyberpunk 2077"],
         "rating": 3, "text": "Story gut, aber Performance auf älteren Systemen mies.", "recommended": False, "playtime_hours": 45, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["willalo"], "game_id": game_map["Dark Souls III"],
         "rating": 5, "text": "Perfektes Souls-Spiel. Jeder Boss ist unvergesslich.", "recommended": True, "playtime_hours": 85, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["willalo"], "game_id": game_map["Red Dead Redemption 2"],
         "rating": 5, "text": "Arthur Morgans Geschichte hat mich zu Tränen gerührt.", "recommended": True, "playtime_hours": 110, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["willalo"], "game_id": game_map["Resident Evil 9 Requiem"],
         "rating": 4, "text": "Gruselig und packend, aber etwas kurz.", "recommended": True, "playtime_hours": 14, "created_at": datetime.utcnow()},

        # === Jannox (3 Reviews) ===
        {"_id": ObjectId(), "user_id": user_map["im_jannox"], "game_id": game_map["Elden Ring"],
         "rating": 5, "text": "Absolutes Meisterwerk. 200 Stunden und kein Ende in Sicht.", "recommended": True, "playtime_hours": 200, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["im_jannox"], "game_id": game_map["Cyberpunk 2077"],
         "rating": 2, "text": "Zu viele Bugs bei Release. Vertrauen verspielt.", "recommended": False, "playtime_hours": 12, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["im_jannox"], "game_id": game_map["Black Myth: Wukong"],
         "rating": 4, "text": "Visuell beeindruckend, Kampfsystem macht Laune.", "recommended": True, "playtime_hours": 30, "created_at": datetime.utcnow()},

        # === 1401Felix (6 Reviews) ===
        {"_id": ObjectId(), "user_id": user_map["1401felix"], "game_id": game_map["The Legend of Zelda: Tears of the Kingdom"],
         "rating": 5, "text": "Die Kreativität kennt keine Grenzen!", "recommended": True, "playtime_hours": 80, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["1401felix"], "game_id": game_map["Stardew Valley"],
         "rating": 5, "text": "So entspannend. Perfekt nach einem langen Tag.", "recommended": True, "playtime_hours": 200, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["1401felix"], "game_id": game_map["Black Myth: Wukong"],
         "rating": 3, "text": "Schön anzusehen, aber Bosse sind unfair schwer.", "recommended": False, "playtime_hours": 18, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["1401felix"], "game_id": game_map["Hollow Knight: Silksong"],
         "rating": 5, "text": "Wunderschön und herausfordernd. Metroidvania-Perfektion.", "recommended": True, "playtime_hours": 40, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["1401felix"], "game_id": game_map["Terraria"],
         "rating": 4, "text": "Unendlich viel Content. Mit Freunden noch besser!", "recommended": True, "playtime_hours": 100, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["1401felix"], "game_id": game_map["Garry's Mod"],
         "rating": 2, "text": "Community ist toxisch und das Spiel fühlt sich veraltet an.", "recommended": False, "playtime_hours": 8, "created_at": datetime.utcnow()},

        # === invalidluca (5 Reviews) ===
        {"_id": ObjectId(), "user_id": user_map["invalidluca"], "game_id": game_map["The Witcher 3: Wild Hunt"],
         "rating": 5, "text": "Das RPG schlechthin. Jede Nebenquest ist ein Meisterwerk.", "recommended": True, "playtime_hours": 150, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["invalidluca"], "game_id": game_map["The Elder Scrolls V: Skyrim"],
         "rating": 4, "text": "Hunderte Stunden und immer noch Neues zu entdecken.", "recommended": True, "playtime_hours": 500, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["invalidluca"], "game_id": game_map["Fallout 4"],
         "rating": 2, "text": "Enttäuschend. Mehr Shooter als RPG, Dialoge flach.", "recommended": False, "playtime_hours": 25, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["invalidluca"], "game_id": game_map["God of War Ragnarök"],
         "rating": 5, "text": "Kratos' Geschichte berührt die Seele. Gameplay ist perfekt.", "recommended": True, "playtime_hours": 80, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["invalidluca"], "game_id": game_map["Monster Hunter: World"],
         "rating": 3, "text": "Gutes Kampfsystem, aber extrem repetitiv auf Dauer.", "recommended": False, "playtime_hours": 60, "created_at": datetime.utcnow()},

        # === ghostswetterZ (5 Reviews) ===
        {"_id": ObjectId(), "user_id": user_map["ghostswetterZ"], "game_id": game_map["Minecraft"],
         "rating": 5, "text": "Zeitlos. Spiele es seit Jahren.", "recommended": True, "playtime_hours": 300, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["ghostswetterZ"], "game_id": game_map["Super Mario Odyssey"],
         "rating": 4, "text": "Pure Freude. Mario at its best.", "recommended": True, "playtime_hours": 25, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["ghostswetterZ"], "game_id": game_map["Animal Crossing: New Horizons"],
         "rating": 3, "text": "Anfangs super, aber nach 2 Monaten langweilig.", "recommended": False, "playtime_hours": 90, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["ghostswetterZ"], "game_id": game_map["Grand Theft Auto V"],
         "rating": 4, "text": "Online-Modus ist wild, Story-Modus absolut legendär.", "recommended": True, "playtime_hours": 180, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["ghostswetterZ"], "game_id": game_map["Terraria"],
         "rating": 2, "text": "Zu unübersichtlich, man braucht ständig das Wiki.", "recommended": False, "playtime_hours": 15, "created_at": datetime.utcnow()},

        # === 03oreo (5 Reviews) ===
        {"_id": ObjectId(), "user_id": user_map["03oreo"], "game_id": game_map["Cult of the Lamb"],
         "rating": 5, "text": "Kult-Management und Dungeon Crawling in perfekter Kombination.", "recommended": True, "playtime_hours": 80, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["03oreo"], "game_id": game_map["Stardew Valley"],
         "rating": 5, "text": "Ein Mann hat das gemacht. Wahnsinn.", "recommended": True, "playtime_hours": 150, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["03oreo"], "game_id": game_map["Hollow Knight: Silksong"],
         "rating": 4, "text": "Großartiges Sequel, aber der Schwierigkeitsgrad ist brutal.", "recommended": True, "playtime_hours": 35, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["03oreo"], "game_id": game_map["Elden Ring"],
         "rating": 3, "text": "Großartig, aber die Open World ist manchmal too much.", "recommended": False, "playtime_hours": 70, "created_at": datetime.utcnow()},
        {"_id": ObjectId(), "user_id": user_map["03oreo"], "game_id": game_map["Minecraft"],
         "rating": 5, "text": "Das Spiel meiner Kindheit. Wird nie alt.", "recommended": True, "playtime_hours": 500, "created_at": datetime.utcnow()},
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
            ("willalo", "invalidluca"),
            ("willalo", "1401felix"),
            ("1401felix", "ghostswetterZ"),
            ("1401felix", "03oreo"),
            ("invalidluca", "03oreo"),
            ("ghostswetterZ", "03oreo"),
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
