import React, { useState } from 'react';
import { UserProfile } from '../../types/profile';
import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import { useGroceryList } from '../../hooks/useGroceryList';
import { GROCERY_CATEGORIES, GroceryCategory } from '../../types/grocery';
import {
  Copy,
  Check,
  CheckCheck,
  RotateCcw,
  Plus,
  Trash2,
  ShoppingCart,
} from 'lucide-react';

interface GroceryPageProps {
  activeProfile: UserProfile | null;
}

export const GroceryPage: React.FC<GroceryPageProps> = ({ activeProfile }) => {
  const { mealPlan } = useWeeklyPlan(activeProfile);
  const {
    items,
    copiedToast,
    totalCount,
    checkedCount,
    progressPercent,
    toggleItem,
    markAllSafe,
    resetChecks,
    addCustomItem,
    removeCustomItem,
    copyGroceryList,
  } = useGroceryList(mealPlan, activeProfile?.name || 'Household');

  const [newItemName, setNewItemName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GroceryCategory>('Fresh Produce');

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addCustomItem(newItemName.trim(), selectedCategory, '1 unit');
    setNewItemName('');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16 animate-fade-in">
      {/* Header Row: Title & One Obvious Primary Action [Copy List] */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Grocery Checklist
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Auto-compiled from your safe weekly meal plan for{' '}
            <strong className="text-on-surface">{activeProfile?.name || 'household'}</strong>.
          </p>
        </div>

        {/* Primary CTA Button: [Copy List] */}
        <button
          type="button"
          onClick={copyGroceryList}
          className="h-12 px-6 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shrink-0"
        >
          {copiedToast ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy List'}</span>
        </button>
      </div>

      {/* Compact Progress & Quick Controls Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {progressPercent}%
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">
              {checkedCount} of {totalCount} gathered
            </span>
            <div className="w-36 h-2 rounded-full bg-surface-container overflow-hidden mt-1">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={markAllSafe}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All</span>
          </button>

          <button
            type="button"
            onClick={resetChecks}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Quick Add Form Drawer if opened */}
      {showAddForm && (
        <form
          onSubmit={handleAddCustom}
          className="p-4 rounded-2xl bg-surface-container-low border border-primary/30 flex flex-col sm:flex-row items-center gap-2 animate-scale-up"
        >
          <input
            type="text"
            required
            autoFocus
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name (e.g. Nutritional Yeast, Bananas)..."
            className="w-full sm:flex-1 h-11 px-3.5 rounded-xl bg-surface-container-lowest text-on-surface text-sm border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as GroceryCategory)}
            className="w-full sm:w-auto h-11 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-xs font-semibold border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {GROCERY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-initial h-11 px-4 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-tertiary transition-colors cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="h-11 px-3 bg-surface-container text-on-surface-variant rounded-xl text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Checklist-First Display */}
      {items.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant flex flex-col items-center justify-center gap-3">
          <ShoppingCart className="w-12 h-12 text-primary/40" />
          <h3 className="font-bold text-base text-on-surface">Your Grocery List is Empty</h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Generate your weekly meal plan first to automatically populate your shopping list, or
            add items above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {GROCERY_CATEGORIES.map((category) => {
            const categoryItems = items.filter((i) => i.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <div
                key={category}
                className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-tactile border border-outline-variant/40 flex flex-col gap-2"
              >
                {/* Category mini-header */}
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                    {category}
                  </h3>
                  <span className="text-[11px] font-semibold text-on-surface-variant">
                    {categoryItems.filter((i) => i.checked).length} / {categoryItems.length}
                  </span>
                </div>

                {/* Checklist items */}
                <div className="flex flex-col divide-y divide-surface-container/50">
                  {categoryItems.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center justify-between py-2.5 px-2 rounded-xl cursor-pointer transition-colors select-none group ${
                        item.checked
                          ? 'bg-surface-container-low/50 opacity-75'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item.id)}
                          className="w-5 h-5 rounded-md accent-primary text-primary cursor-pointer shrink-0"
                        />
                        <span
                          className={`text-sm sm:text-base font-medium truncate transition-colors ${
                            item.checked
                              ? 'line-through text-on-surface-variant/60'
                              : 'text-on-surface group-hover:text-primary font-semibold'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                          {item.quantity}
                        </span>
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeCustomItem(item.id);
                            }}
                            className="p-1 text-on-surface-variant hover:text-error transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
