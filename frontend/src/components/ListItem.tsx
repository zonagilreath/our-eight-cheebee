import type { ListItem as ListItemType } from '../types';

interface ListItemProps {
  item: ListItemType;
  onToggle: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function ListItem({ item, onToggle, onUpdateQuantity, onRemove }: ListItemProps) {
  return (
    <div className={`bg-white rounded-lg border border-8cb-border p-3 flex items-center gap-3 transition-opacity ${item.checked_off ? 'opacity-50' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          item.checked_off
            ? 'bg-8cb-green border-8cb-green'
            : 'border-8cb-border'
        }`}
      >
        {item.checked_off && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Image */}
      <div className="w-12 h-12 rounded bg-8cb-gray flex items-center justify-center shrink-0 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          <svg className="w-5 h-5 text-8cb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${item.checked_off ? 'line-through text-8cb-text-secondary' : 'text-8cb-text'}`}>
          {item.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.price !== null && (
            <span className="text-xs text-8cb-text-secondary">${item.price.toFixed(2)}</span>
          )}
          <span className="text-xs text-8cb-text-secondary/60">{item.added_by}</span>
        </div>
      </div>

      {/* Quantity Controls */}
      {!item.checked_off && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 rounded-full border border-8cb-border flex items-center justify-center text-8cb-text-secondary hover:bg-8cb-gray"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 rounded-full border border-8cb-border flex items-center justify-center text-8cb-text-secondary hover:bg-8cb-gray"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="shrink-0 p-1 text-8cb-text-secondary/40 hover:text-8cb-red"
        aria-label="Remove item"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
