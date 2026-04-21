"""
Quick test that the saved session works.

Usage:
    python scripts/test_session.py
"""

import asyncio
import json
from pathlib import Path

AUTH_PATH = Path.home() / ".texas-grocery-mcp" / "auth.json"


async def test():
    # 1. Check auth file exists
    if not AUTH_PATH.exists():
        print(f"No auth file at {AUTH_PATH}")
        print("Run: python scripts/setup_session.py")
        return

    state = json.loads(AUTH_PATH.read_text())
    cookies = state.get("cookies", [])
    auth_cookies = [c for c in cookies if c["name"] in ("sat", "DYN_USER_ID")]
    print(f"Auth file: {AUTH_PATH}")
    print(f"Total cookies: {len(cookies)}")
    print(f"Auth cookies: {len(auth_cookies)}")

    if not auth_cookies:
        print("\nNo auth cookies — session not valid. Re-run setup_session.py")
        return

    # 2. Try a search
    from texas_grocery_mcp.clients.graphql import HEBGraphQLClient

    client = HEBGraphQLClient()

    # The HEBGraphQLClient now automatically loads auth.json cookies using its internal functions

    print("\nTesting product search for 'milk'...")
    try:
        result = await client.search_products("milk", store_id="735", limit=3)
        print(f"Results: {result.count} products")
        for p in result.products[:3]:
            print(f"  - {p.name}: ${p.price:.2f}")
        print("\nSession is working!")
    except Exception as e:
        print(f"Search failed: {e}")
        print("Session may need refresh.")
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(test())
