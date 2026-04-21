from pydantic import BaseModel


class CartItem(BaseModel):
    sku: str
    name: str
    unit_price: float
    quantity: int
    image_url: str | None = None

    @property
    def subtotal(self) -> float:
        return self.quantity * self.unit_price


class Cart(BaseModel):
    items: list[CartItem]
    subtotal: float = 0.0
    total_discount: float = 0.0
    estimated_total: float = 0.0
    item_count: int = 0


class SyncResult(BaseModel):
    success: bool
    added: int = 0
    errors: list[str] = []
