"""
Interactive session setup for 8-C-B.

Run this once to log in and save auth cookies. The backend will use
the saved session for API calls and auto-refresh it via headless Playwright.

Usage:
    python scripts/setup_session.py

This opens a visible (non-headless) Chromium browser so you can:
1. Log in with your 8-C-B credentials
2. Complete any CAPTCHA / 2FA if prompted
3. Close the browser when done — cookies are saved automatically
"""

import asyncio
import json
import sys
from pathlib import Path

AUTH_DIR = Path.home() / ".texas-grocery-mcp"
AUTH_PATH = AUTH_DIR / "auth.json"


async def setup():
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("Playwright not installed. Run: pip install playwright")
        sys.exit(1)

    AUTH_DIR.mkdir(parents=True, exist_ok=True)

    print("Opening 8-C-B login page in browser...")
    print("Log in with your account, then close the browser window.\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False, 
            channel="msedge",
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"
        )

        # Load existing auth state if available
        if AUTH_PATH.exists():
            print(f"Loading existing session from {AUTH_PATH}")
            try:
                state = json.loads(AUTH_PATH.read_text())
                if "cookies" in state:
                    await context.add_cookies(state["cookies"])
            except Exception:
                pass

        page = await context.new_page()
        try:
            await page.goto("https://www.heb.com/my-account/login", timeout=60000, wait_until="domcontentloaded")
        except Exception as e:
            print(f"Navigation issue (ignoring): {e}")

        print("Waiting for you to log in...")
        print("(Close the browser window when done)\n")

        # Wait for the browser to be closed by the user
        try:
            await page.wait_for_event("close", timeout=300_000)  # 5 min max
        except Exception:
            pass

        # Save cookies and storage state
        try:
            storage = await context.storage_state()
            AUTH_PATH.write_text(json.dumps(storage, indent=2))
            print(f"\nSession saved to {AUTH_PATH}")

            # Check if we got auth cookies
            cookies = storage.get("cookies", [])
            auth_cookies = [c for c in cookies if c["name"] in ("sat", "DYN_USER_ID", "DYN_USER_CONFIRM")]
            if auth_cookies:
                print(f"Found {len(auth_cookies)} auth cookie(s) — login successful!")
            else:
                print("Warning: No auth cookies found. You may need to try again.")
        except Exception as e:
            print(f"Error saving session: {e}")
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(setup())
