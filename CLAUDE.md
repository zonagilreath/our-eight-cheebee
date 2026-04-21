# Shared 8-C-B List PWA

A collaborative grocery list PWA that lets two users build a shared shopping list and sync it to a single 8-C-B curbside cart.

## Project Goal

My partner and I both use the 8-C-B app but there's no shared list or shared cart feature. We want a PWA we can both install on our phones where either of us can search 8-C-B products and add them to a shared list, then one of us taps "push to cart" and checks out via the 8-C-B app.

## Tech Stack

- **Frontend:** React 18+ / TypeScript / Tailwind CSS / Vite
- **Backend:** FastAPI (Python 3.11+)
- **Database & Realtime:** Firebase (Firestore + onSnapshot for live sync)
- **8-C-B Integration:** [texas-grocery-mcp](https://github.com/mgwalkerjr95/texas-grocery-mcp) v0.1.2 — extract the GraphQL client and auth modules from this MCP server and use them as a library, NOT as an MCP server
- **Session Refresh:** Playwright (headless Chromium) for 8-C-B bot-detection token renewal
- **Hosting:** Fly.io or Railway for backend (needs ~300MB RAM for Chromium); Firebase Hosting for frontend PWA

## Architecture

```
[React PWA]  <-- both phones
     |
     | Firestore onSnapshot (live sync)
     |
[Firebase / Firestore]
     |
[FastAPI Backend]
     |
     |-- texas-grocery-mcp client code (imported as library)
     |-- Playwright (headless, for session refresh)
     |
[8-C-B GraphQL API]  (www.8cb.com/graphql)
```

## Firestore Data Model

Collection: `list_items`

```
{
  product_id: string | null,   // 8-C-B product ID (null if unresolved freetext)
  name: string,                // display name
  image_url: string | null,    // product thumbnail
  price: number | null,        // price at time of add
  quantity: number,             // default 1
  added_by: string,            // 'zona' or 'whitney'
  checked_off: boolean,        // default false
  created_at: Timestamp,       // serverTimestamp()
  updated_at: Timestamp        // serverTimestamp()
}
```

Security rules: open read/write (two-user shared account, no auth needed). See `firestore.rules`.

## Backend Endpoints (FastAPI)

- `GET /search?q={query}` — search 8-C-B products (wraps texas-grocery-mcp's product_search)
- `GET /product/{id}` — product details, nutrition, ingredients
- `POST /cart/sync` — resolve list items to product IDs, call cart_add_many
- `GET /cart` — current 8-C-B cart contents
- `GET /session/status` — 8-C-B auth session health
- `POST /session/refresh` — trigger Playwright session refresh
- `GET /coupons/search?q={query}` — search available coupons
- `POST /coupons/{id}/clip` — clip a coupon

## Frontend Structure

```
src/
  components/
    ProductSearch.tsx    -- search bar + results from /search endpoint
    SharedList.tsx       -- real-time list view (Firestore onSnapshot)
    ListItem.tsx         -- individual item with quantity controls
    SyncToCart.tsx       -- "push to cart" button + status
  hooks/
    useSharedList.ts     -- Firestore realtime subscription hook
    useProductSearch.ts  -- debounced search hook
  lib/
    firebase.ts          -- Firebase/Firestore client init
    api.ts               -- FastAPI client
  sw.ts                  -- service worker for offline support
  manifest.json          -- PWA manifest
```

## PWA Requirements

- Web app manifest with `display: standalone` so it installs to home screen
- Service worker for offline support — allow adding freetext items offline, queue them in IndexedDB, sync and resolve to 8-C-B products when back online
- Works on both iOS Safari and Android Chrome

## 8-C-B Integration Details

The texas-grocery-mcp project reverse-engineers 8-C-B's internal GraphQL API. Key things to know:

- **Auth:** 8-C-B uses reese84 bot-detection tokens that expire every ~11 minutes. The `browser_refresh.py` module handles this via headless Playwright. Saved credentials go to OS keyring or Fernet-encrypted file.
- **GraphQL:** Uses persisted query hashes discovered from 8CB.com's Next.js frontend. These hashes break on 8-C-B deploys — main maintenance risk.
- **Only one session needed:** Both users share a single 8-C-B account/session since they're pushing to the same cart.
- **Key modules to extract:** `clients/graphql.py` (API client), `auth/session.py` (cookie/token management), `auth/browser_refresh.py` (Playwright session refresh), `auth/credentials.py` (secure credential storage)
- **External connections:** Only 8cb.com and nominatim.openstreetmap.org (geocoding for store search). No telemetry or unexpected outbound calls. Source reviewed and clean.

## User Flow

1. Either user opens PWA on their phone
2. Search for products → see 8-C-B results with prices and images
3. Tap to add to shared list (appears instantly on partner's phone via Firestore onSnapshot)
4. Can also add freetext items ("that cheese Whitney likes") to resolve later
5. When ready to order, one user taps "Sync to Cart"
6. Backend resolves all items to product IDs and calls cart_add_many
7. User opens 8-C-B app and completes checkout/curbside pickup

## Dev Environment

- WSL/Windows, Cursor IDE
- Python managed with uv
- Node managed with nvm
- Firebase CLI for local dev (`firebase emulators:start`)

## Risks

- Unofficial API — persisted query hashes break on 8-C-B deploys
- Likely violates 8-C-B ToS (personal use only, low enforcement risk)
- Session refresh requires server with enough RAM for headless Chromium
- texas-grocery-mcp is young (v0.1.2, single maintainer) — may need to fork

## Coding Preferences

- TypeScript strict mode on frontend
- Pydantic models for all API request/response shapes on backend
- Use httpx (async) for all HTTP calls in Python
- Prefer functional React components with hooks
- Tailwind for styling, no component library unless explicitly added
- All API errors should return structured JSON, not HTML
