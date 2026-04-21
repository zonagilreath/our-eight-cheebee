import { useSharedList } from '../hooks/useSharedList';
import { ListItem } from './ListItem';
import { AddFreetext } from './AddFreetext';

export function SharedList() {
  const { uncheckedItems, checkedItems, loading, addItem, toggleChecked, updateQuantity, removeItem } = useSharedList();

  const handleAddFreetext = (name: string) => {
    addItem({
      product_id: null,
      name,
      image_url: null,
      price: null,
      quantity: 1,
      added_by: 'zona', // TODO: get from auth context
      checked_off: false,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-8cb-red/30 border-t-8cb-red rounded-full animate-spin" />
      </div>
    );
  }

  const totalItems = uncheckedItems.length + checkedItems.length;

  return (
    <div>
      {/* Quick Add */}
      <AddFreetext onAdd={handleAddFreetext} />

      {/* List Header */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-8cb-text">
          Shopping List
          {totalItems > 0 && (
            <span className="text-8cb-text-secondary font-normal text-sm ml-1.5">
              ({uncheckedItems.length} remaining)
            </span>
          )}
        </h2>
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="text-center py-16 px-4">
          <svg className="w-16 h-16 text-8cb-text-secondary/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-8cb-text-secondary text-sm">Your list is empty</p>
          <p className="text-8cb-text-secondary/60 text-xs mt-1">Add items above or search for 8-C-B products</p>
        </div>
      )}

      {/* Unchecked Items */}
      <div className="px-4 space-y-2">
        {uncheckedItems.map((item) => (
          <ListItem
            key={item.id}
            item={item}
            onToggle={toggleChecked}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* Checked Items */}
      {checkedItems.length > 0 && (
        <div className="mt-6">
          <div className="px-4 pb-2">
            <h3 className="text-sm font-medium text-8cb-text-secondary">
              Checked off ({checkedItems.length})
            </h3>
          </div>
          <div className="px-4 space-y-2">
            {checkedItems.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                onToggle={toggleChecked}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
