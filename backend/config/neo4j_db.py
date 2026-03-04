"""
Neo4j-Verbindung mit dem offiziellen Python-Driver.
Enthält Retry-Logik, da Neo4j beim Start länger brauchen kann.
"""

from neo4j import AsyncGraphDatabase
import asyncio
import os

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "gamestore2026")

driver = None


async def connect_neo4j(max_retries=10, delay=3):
    global driver
    driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    for attempt in range(1, max_retries + 1):
        try:
            async with driver.session() as session:
                result = await session.run("RETURN 1")
                await result.single()
            print(f"[OK] Neo4j verbunden: {NEO4J_URI}")
            return driver
        except Exception as e:
            if attempt < max_retries:
                print(f"[RETRY {attempt}/{max_retries}] Neo4j nicht bereit, warte {delay}s... ({e})")
                await asyncio.sleep(delay)
            else:
                print(f"[ERROR] Neo4j konnte nach {max_retries} Versuchen nicht erreicht werden: {e}")
                raise


async def close_neo4j():
    global driver
    if driver:
        await driver.close()
        print("[CLOSED] Neo4j Verbindung geschlossen")


def get_driver():
    return driver
