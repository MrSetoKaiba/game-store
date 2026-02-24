"""
Neo4j-Verbindung mit dem offiziellen Python-Driver.
"""

from neo4j import AsyncGraphDatabase
import os

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "gamestore2026")

driver = None


async def connect_neo4j():
    global driver
    driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    async with driver.session() as session:
        result = await session.run("RETURN 1")
        await result.single()
    print(f"[OK] Neo4j verbunden: {NEO4J_URI}")
    return driver


async def close_neo4j():
    global driver
    if driver:
        await driver.close()
        print("[CLOSED] Neo4j Verbindung geschlossen")


def get_driver():
    return driver
