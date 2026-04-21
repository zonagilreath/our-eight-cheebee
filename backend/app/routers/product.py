from fastapi import APIRouter, HTTPException
from texas_grocery_mcp.models.product import ProductDetails

from app.ecb.client import ecb_client

router = APIRouter(tags=["product"])


@router.get("/product/{product_id}", response_model=ProductDetails)
async def get_product(product_id: str) -> ProductDetails:
    result = await ecb_client.get_product_details(product_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return result
