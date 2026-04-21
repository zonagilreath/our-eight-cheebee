import { useProductSearch } from '../hooks/useProductSearch';
import { useSharedList } from '../hooks/useSharedList';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';

export function ProductSearch() {
  const { query, setQuery, results, loading, error } = useProductSearch();
  const { addItem } = useSharedList();

  const handleAdd = (product: Product) => {
    addItem({
      product_id: product.product_id,
      name: product.name,
      image_url: product.image_url,
      price: product.price,
      quantity: 1,
      added_by: 'zona', // TODO: get from auth context
      checked_off: false,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white border-b border-8cb-border px-4 py-3 z-10">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-8cb-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 8-C-B products..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 rounded-full border border-8cb-border bg-8cb-gray text-sm placeholder:text-8cb-text-secondary/50 focus:outline-none focus:border-8cb-red focus:bg-white focus:ring-1 focus:ring-8cb-red"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-8cb-text-secondary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-3 space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-8cb-red/30 border-t-8cb-red rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-8cb-red-light border border-8cb-red/20 rounded-lg p-4 text-center">
            <p className="text-sm text-8cb-red">{error}</p>
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-8cb-text-secondary text-sm">No products found for "{query}"</p>
          </div>
        )}

        {!query && !loading && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-8cb-text-secondary/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-8cb-text-secondary text-sm">Search for 8-C-B products</p>
            <p className="text-8cb-text-secondary/60 text-xs mt-1">Prices, availability, and aisle info</p>
          </div>
        )}

        {results.map((product) => (
          <ProductCard key={product.sku} product={product} onAdd={handleAdd} />
        ))}
      </div>
    </div>
  );
}
