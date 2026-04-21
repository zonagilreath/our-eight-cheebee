export interface ListItem {
  id: string;
  product_id: string | null;
  name: string;
  image_url: string | null;
  price: number | null;
  quantity: number;
  added_by: 'zona' | 'whitney';
  checked_off: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  sku: string;
  product_id: string;
  name: string;
  price: number;
  available: boolean;
  brand: string | null;
  size: string | null;
  price_per_unit: string | null;
  image_url: string | null;
  aisle: string | null;
  on_sale: boolean;
  original_price: number | null;
  has_coupon: boolean;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  query: string;
}

export interface CartItem {
  sku: string;
  name: string;
  unit_price: number;
  quantity: number;
  image_url: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total_discount: number;
  estimated_total: number;
  item_count: number;
}

export interface SessionStatus {
  is_authenticated: boolean;
  needs_refresh: boolean;
  time_remaining_seconds: number | null;
}
