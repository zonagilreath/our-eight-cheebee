import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-8cb-border p-3 flex gap-3">
      {/* Product Image */}
      <div className="w-20 h-20 rounded-md bg-8cb-gray flex items-center justify-center shrink-0 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <svg className="w-8 h-8 text-8cb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        {product.brand && (
          <p className="text-xs text-8cb-text-secondary uppercase tracking-wide">{product.brand}</p>
        )}
        <p className="text-sm font-medium text-8cb-text leading-tight line-clamp-2">{product.name}</p>
        {product.size && (
          <p className="text-xs text-8cb-text-secondary mt-0.5">{product.size}</p>
        )}

        <div className="flex items-center gap-2 mt-1">
          {product.on_sale && product.original_price ? (
            <>
              <span className="text-8cb-red font-bold text-base">${product.price.toFixed(2)}</span>
              <span className="text-8cb-text-secondary text-xs line-through">${product.original_price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-8cb-text font-bold text-base">${product.price.toFixed(2)}</span>
          )}
          {product.price_per_unit && (
            <span className="text-xs text-8cb-text-secondary">{product.price_per_unit}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          {product.on_sale && (
            <span className="text-[10px] font-semibold bg-8cb-red text-white px-1.5 py-0.5 rounded">Sale</span>
          )}
          {product.has_coupon && (
            <span className="text-[10px] font-semibold bg-8cb-yellow text-white px-1.5 py-0.5 rounded">Coupon</span>
          )}
          {product.aisle && (
            <span className="text-[10px] text-8cb-text-secondary">Aisle {product.aisle}</span>
          )}
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => onAdd(product)}
        className="self-center shrink-0 w-9 h-9 rounded-full bg-8cb-red text-white flex items-center justify-center hover:bg-8cb-red-dark active:scale-95 transition-all"
        aria-label={`Add ${product.name} to list`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
