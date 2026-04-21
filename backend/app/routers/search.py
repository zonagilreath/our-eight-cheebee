from fastapi import APIRouter, Query

from app.ecb.client import ecb_client
from app.models.product import ProductSearchResult

router = APIRouter(tags=["search"])


@router.get("/search", response_model=ProductSearchResult)
async def search_products(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50),
) -> ProductSearchResult:
    return await ecb_client.search_products(q, limit=limit)
