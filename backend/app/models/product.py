from pydantic import BaseModel


class Product(BaseModel):
    sku: str
    product_id: str
    name: str
    price: float
    available: bool
    brand: str | None = None
    size: str | None = None
    price_per_unit: str | None = None
    image_url: str | None = None
    aisle: str | None = None
    on_sale: bool = False
    original_price: float | None = None
    has_coupon: bool = False


class ProductSearchResult(BaseModel):
    products: list[Product]
    total: int
    query: str
