from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import search, cart, session, product, coupons

app = FastAPI(title="8-C-B List Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(cart.router)
app.include_router(session.router)
app.include_router(product.router)
app.include_router(coupons.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
