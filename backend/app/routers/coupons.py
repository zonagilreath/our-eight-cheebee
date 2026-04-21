from fastapi import APIRouter, HTTPException, Query
from texas_grocery_mcp.models.coupon import CouponSearchResult

from app.ecb.client import ecb_client

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.get("/search", response_model=CouponSearchResult)
async def search_coupons(
    q: str | None = Query(None, description="Search query"),
    limit: int = Query(60, ge=1, le=60),
) -> CouponSearchResult:
    return await ecb_client.search_coupons(q, limit=limit)


@router.post("/{coupon_id}/clip")
async def clip_coupon(coupon_id: int) -> dict:
    result = await ecb_client.clip_coupon(coupon_id)
    if result.get("error"):
        raise HTTPException(
            status_code=400 if result.get("code") != "NOT_AUTHENTICATED" else 401,
            detail=result,
        )
    return result
