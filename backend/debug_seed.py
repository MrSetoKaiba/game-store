import asyncio
import sys
sys.path.insert(0, '.')
from config import connect_mongodb, connect_neo4j, close_mongodb, close_neo4j
from seed import seed_all

async def main():
    try:
        await connect_mongodb()
        await connect_neo4j()
        result = await seed_all()
        print("SUCCESS:", result)
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        await close_mongodb()
        await close_neo4j()

asyncio.run(main())
