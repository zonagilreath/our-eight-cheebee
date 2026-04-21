import json
import re
import asyncio
from texas_grocery_mcp.auth.session import get_httpx_cookies
import httpx

async def find_hash():
    cookies = get_httpx_cookies()
    print('Cookies:', len(cookies))
    async with httpx.AsyncClient(cookies=cookies, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}) as client:
        r = await client.get('https://www.heb.com/', follow_redirects=True)
        html = r.text
        # extract script urls
        pattern = r'src=\"(/_next/static/chunks/[^\"]+\.js)\"'
        scripts = set(re.findall(pattern, html))
        print('Found', len(scripts), 'scripts')
        
        for s in scripts:
            url = 'https://www.heb.com' + s
            try:
                r2 = await client.get(url)
                if 'cartItemV2' in r2.text:
                    m = re.search(r'\"cartItemV2\".{0,150}?\"sha256Hash\":\"([a-f0-9]{64})\"', r2.text)
                    if m:
                        print('FOUND HASH:', m.group(1))
                        return
                    else:
                        print('Found cartItemV2 in', url, 'but no hash matched')
            except Exception as e:
                pass

        print("Not in html chunks, trying all chunks...")

asyncio.run(find_hash())
