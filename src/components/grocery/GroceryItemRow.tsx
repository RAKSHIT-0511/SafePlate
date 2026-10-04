import React from 'react';
import { GroceryItem } from '../../types/grocery';
import { Trash2 } from 'lucide-react';

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const GroceryItemRow: React.FC<GroceryItemRowProps> = ({
  item,
  onToggle,
  onRemove,
}) => {
  return (
    <label className="group flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors border border-transparent hover:border-outline-variant/30 select-none">
      <div className="flex items-center gap-3.5 min-w-0">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggle(item.id)}
          className="w-5 h-5 rounded accent-primary text-primary focus:ring-0 cursor-pointer shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <span
            className={`text-sm sm:text-base font-medium truncate transition-colors ${
              item.checked
                ? 'line-through text-on-surface-variant/70'
                : 'text-on-surface group-hover:text-primary'
            }`}
          >
            {item.name}
          </span>
          {item.recipeSource && (
            <span className="text-[11px] text-on-surface-variant truncate">
              {item.recipeSource}
            </span>
          )}
          {item.isCustom && (
            <span className="text-[10px] text-secondary font-semibold">
              Custom household item
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md font-medium">
          {item.quantity}
        </span>
        {item.isCustom && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="p-1 text-on-surface-variant hover:text-error transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </label>
  );
};
