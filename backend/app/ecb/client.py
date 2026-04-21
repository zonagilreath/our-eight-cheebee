"""
8-C-B client wrapping texas-grocery-mcp's GraphQL client and auth modules.
Uses them as a library — no MCP server involved.
"""

import asyncio
import json
import logging
import os
from pathlib import Path

from texas_grocery_mcp.clients.graphql import HEBGraphQLClient
from texas_grocery_mcp.auth.session import (
    is_authenticated,
    check_session_freshness,
    get_session_status as _get_session_status,
)
from texas_grocery_mcp.auth.browser_refresh import (
    refresh_session_with_browser,
    is_playwright_available,
)
from texas_grocery_mcp.models.product import (
    Product as HEBProduct,
    ProductSearchResult as HEBSearchResult,
    ProductDetails,
)
from texas_grocery_mcp.models.coupon import CouponSearchResult

from app.models.product import Product, ProductSearchResult
from app.models.cart import Cart, CartItem, SyncResult
from app.models.list_item import SessionStatus

logger = logging.getLogger(__name__)

AUTH_PATH = Path.home() / ".texas-grocery-mcp" / "auth.json"
DEFAULT_STORE_ID = "735"  # Default 8-C-B store — can be configured
HEADLESS_REFRESH = os.getenv("ECB_HEADLESS", "false").lower() in ("1", "true", "yes")


def _convert_product(p: HEBProduct) -> Product:
    return Product(
        sku=p.sku,
        product_id=p.product_id or p.sku,
        name=p.name,
        price=p.price,
        available=p.available,
        brand=p.brand,
        size=p.size,
        price_per_unit=p.price_per_unit,
        image_url=p.image_url,
        aisle=p.aisle,
        on_sale=p.on_sale,
        original_price=p.original_price,
        has_coupon=p.has_coupon,
    )


class ECBClient:
    def __init__(self, store_id: str = DEFAULT_STORE_ID):
        self._gql = HEBGraphQLClient()
        self._store_id = store_id

    async def search_products(self, query: str, limit: int = 20) -> ProductSearchResult:
        result: HEBSearchResult = await self._gql.search_products(
            query=query,
            store_id=self._store_id,
            limit=limit,
        )
        products = [_convert_product(p) for p in result.products]
        return ProductSearchResult(
            products=products,
            total=result.count,
            query=result.query,
        )

    async def get_cart(self) -> Cart:
        raw = await self._gql.get_cart()
        cart_data = raw.get("cartV2", raw)
        items_raw = cart_data.get("items", [])
        items = [
            CartItem(
                sku=item.get("sku", ""),
                name=item.get("name", ""),
                unit_price=float(item.get("unitPrice", 0)),
                quantity=int(item.get("quantity", 1)),
                image_url=item.get("imageUrl"),
            )
            for item in items_raw
        ]
        subtotal = sum(i.unit_price * i.quantity for i in items)
        discount = float(cart_data.get("totalDiscount", 0))
        return Cart(
            items=items,
            subtotal=subtotal,
            total_discount=discount,
            estimated_total=subtotal - discount,
            item_count=len(items),
        )

    async def sync_to_cart(self, items: list[dict]) -> SyncResult:
        """Add list items to the 8-C-B cart. Each item needs product_id and sku."""
        errors: list[str] = []
        added = 0

        for item in items:
            product_id = item.get("product_id")
            sku = item.get("sku", product_id)
            quantity = item.get("quantity", 1)
            name = item.get("name", product_id)

            if not product_id:
                errors.append(f"Skipped '{name}': no product ID")
                continue

            try:
                await self._gql.add_to_cart(
                    product_id=product_id,
                    sku_id=sku,
                    quantity=quantity,
                )
                added += 1
            except Exception as e:
                errors.append(f"Failed to add '{name}': {e}")

        return SyncResult(
            success=len(errors) == 0,
            added=added,
            errors=errors,
        )

    async def get_product_details(self, product_id: str) -> ProductDetails | None:
        return await self._gql.get_product_details(
            product_id=product_id,
            store_id=self._store_id,
        )

    async def search_coupons(
        self, query: str | None = None, limit: int = 60
    ) -> CouponSearchResult:
        return await self._gql.get_coupons(
            search_query=query,
            limit=limit,
        )

    async def clip_coupon(self, coupon_id: int) -> dict:
        return await self._gql.clip_coupon(coupon_id=coupon_id)

    async def get_session_status(self) -> SessionStatus:
        try:
            status = await _get_session_status()
            authed = await is_authenticated()
            freshness = await check_session_freshness()
            remaining = freshness.get("seconds_remaining")
            return SessionStatus(
                is_authenticated=authed,
                needs_refresh=not freshness.get("is_fresh", False),
                time_remaining_seconds=remaining,
            )
        except Exception:
            return SessionStatus(
                is_authenticated=False,
                needs_refresh=True,
                time_remaining_seconds=None,
            )

    async def refresh_session(self) -> bool:
        if not await asyncio.to_thread(is_playwright_available):
            logger.warning("Playwright not available for session refresh")
            return False
        try:
            result = await refresh_session_with_browser(
                auth_path=AUTH_PATH,
                headless=HEADLESS_REFRESH,
            )
            return result.get("success", False)
        except Exception as e:
            logger.error(f"Session refresh failed: {e}")
            return False


ecb_client = ECBClient()
