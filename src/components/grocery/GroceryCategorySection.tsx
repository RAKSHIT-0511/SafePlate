import React from 'react';
import { GroceryCategory, GroceryItem } from '../../types/grocery';
import { GroceryItemRow } from './GroceryItemRow';
import {
  Apple,
  Coffee,
  Wheat,
  Fish,
  Package,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';

interface GroceryCategorySectionProps {
  category: GroceryCategory;
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export const GroceryCategorySection: React.FC<GroceryCategorySectionProps> = ({
  category,
  items,
  onToggleItem,
  onRemoveItem,
}) => {
  if (items.length === 0) return null;

  const categoryConfigs: Record<
    GroceryCategory,
    { icon: React.ElementType; subtext: string; badge?: string }
  > = {
    'Fresh Produce': {
      icon: Apple,
      subtext: 'Naturally allergen-safe zone',
      badge: 'Zero Cross-Risk',
    },
    'Dairy Alternatives': {
      icon: Coffee,
      subtext: 'Nut-allergy strict vigilance required',
      badge: 'Check label: Nut-free facility',
    },
    'Grains & Baking': {
      icon: Wheat,
      subtext: 'Gluten & cross-contact screening',
    },
    Proteins: {
      icon: Fish,
      subtext: 'Fresh fish, poultry, and plant proteins',
    },
    Pantry: {
      icon: Package,
      subtext: 'Oils, spices, and certified staples',
    },
    Other: {
      icon: ShoppingBag,
      subtext: 'Household supplies and miscellaneous',
    },
  };

  const config = categoryConfigs[category] || {
    icon: ShoppingBag,
    subtext: 'Items list',
  };

  const Icon = config.icon;
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-tactile border border-outline-variant/40 flex flex-col gap-4">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-on-surface">{category}</h3>
            <span className="text-xs text-on-surface-variant">{config.subtext}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {config.badge && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                category === 'Dairy Alternatives'
                  ? 'bg-secondary-fixed/50 text-secondary border border-secondary/30'
                  : 'bg-surface-container text-primary'
              }`}
            >
              {config.badge}
            </span>
          )}
          <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
            {checkedCount} / {items.length}
          </span>
        </div>
      </div>

      {/* Advisory Callout for Dairy Alternatives */}
      {category === 'Dairy Alternatives' && (
        <div className="bg-secondary-fixed/20 p-3 rounded-xl border border-secondary/20 flex items-start gap-2.5 text-xs text-on-surface leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <p>
            <strong>Allergy Advisory:</strong> When buying plant milks, ensure labels state
            manufactured in a certified peanut-free and tree-nut-free facility.
          </p>
        </div>
      )}

      {/* Items list */}
      <div className="flex flex-col gap-1 divide-y divide-surface-container/40">
        {items.map((item) => (
          <GroceryItemRow
            key={item.id}
            item={item}
            onToggle={onToggleItem}
            onRemove={onRemoveItem}
          />
        ))}
      </div>
    </div>
  );
};
