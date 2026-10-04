import React, { useState } from 'react';
import { GroceryCategory, GROCERY_CATEGORIES } from '../../types/grocery';
import { Plus } from 'lucide-react';

interface AddCustomItemFormProps {
  onAdd: (name: string, category: GroceryCategory, quantity: string) => void;
}

export const AddCustomItemForm: React.FC<AddCustomItemFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('Other');
  const [quantity, setQuantity] = useState('1 unit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd(name, category, quantity);
    setName('');
    setQuantity('1 unit');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col sm:flex-row items-center gap-2.5"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add custom pantry item or staple (e.g. Nutritional Yeast, Chia Seeds)..."
        className="w-full flex-1 h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 text-xs sm:text-sm border border-outline-variant/50 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
      />

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as GroceryCategory)}
          className="h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          {GROCERY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!name.trim()}
          className="h-11 px-5 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add to List</span>
        </button>
      </div>
    </form>
  );
};
