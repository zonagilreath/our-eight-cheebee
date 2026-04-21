import logging

from fastapi import APIRouter

from app.ecb.client import ecb_client
from app.models.cart import Cart, SyncResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=Cart)
async def get_cart() -> Cart:
    return await ecb_client.get_cart()


@router.post("/sync", response_model=SyncResult)
async def sync_to_cart() -> SyncResult:
    try:
        from app.firebase import get_firestore_client

        db = get_firestore_client()
        docs = db.collection("list_items").where("checked_off", "==", False).stream()

        items = []
        for doc in docs:
            data = doc.to_dict()
            if data.get("product_id"):
                items.append({
                    "product_id": data["product_id"],
                    "sku": data.get("sku", data["product_id"]),
                    "quantity": data.get("quantity", 1),
                    "name": data.get("name", ""),
                })

        if not items:
            return SyncResult(success=True, added=0, errors=["No resolved items to sync"])

        return await ecb_client.sync_to_cart(items)
    except Exception as e:
        logger.error(f"Cart sync failed: {e}")
        return SyncResult(success=False, added=0, errors=[str(e)])
