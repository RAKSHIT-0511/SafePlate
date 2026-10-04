import React, { useState } from 'react';
import { INITIAL_ALLERGENS_LIST } from '../../data/allergens';
import { AllergenRule } from '../../safety/types';
import { Plus, Check, X } from 'lucide-react';

interface AllergenSelectorProps {
  selectedRules: AllergenRule[];
  customAllergens: string[];
  onChange: (updatedRules: AllergenRule[], updatedCustom: string[]) => void;
}

export const AllergenSelector: React.FC<AllergenSelectorProps> = ({
  selectedRules,
  customAllergens,
  onChange,
}) => {
  const [customInput, setCustomInput] = useState('');

  const isSelected = (allergenId: string) => {
    return selectedRules.some((r) => r.allergenId.toLowerCase() === allergenId.toLowerCase());
  };

  const toggleStandardAllergen = (id: string, name: string) => {
    const existingIndex = selectedRules.findIndex(
      (r) => r.allergenId.toLowerCase() === id.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Remove
      const updated = selectedRules.filter((_, idx) => idx !== existingIndex);
      onChange(updated, customAllergens);
    } else {
      // Add with default severity AVOID
      const newRule: AllergenRule = {
        allergenId: id,
        allergenName: name,
        severity: 'AVOID',
      };
      onChange([...selectedRules, newRule], customAllergens);
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    if (
      customAllergens.some((c) => c.toLowerCase() === lower) ||
      selectedRules.some((r) => r.allergenName.toLowerCase() === lower)
    ) {
      setCustomInput('');
      return;
    }

    const customId = `custom_${Date.now()}`;
    const newRule: AllergenRule = {
      allergenId: customId,
      allergenName: trimmed,
      severity: 'AVOID',
      isCustom: true,
    };

    onChange([...selectedRules, newRule], [...customAllergens, trimmed]);
    setCustomInput('');
  };

  const handleRemoveCustom = (customName: string) => {
    const updatedCustom = customAllergens.filter((c) => c !== customName);
    const updatedRules = selectedRules.filter(
      (r) => r.allergenName.toLowerCase() !== customName.toLowerCase()
    );
    onChange(updatedRules, updatedCustom);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-on-surface">Allergen Registry</h4>
          <p className="text-xs text-on-surface-variant">
            Select common triggers or add custom sensitivities to monitor.
          </p>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {selectedRules.length} Selected
        </span>
      </div>

      {/* Grid of standard allergens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {INITIAL_ALLERGENS_LIST.map((allergen) => {
          const active = isSelected(allergen.id);
          return (
            <button
              key={allergen.id}
              type="button"
              onClick={() => toggleStandardAllergen(allergen.id, allergen.name)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between cursor-pointer min-h-[48px] select-none ${
                active
                  ? 'bg-primary-container text-on-primary-container border-primary shadow-sm font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant/40'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-xs sm:text-sm truncate">{allergen.name}</span>
                <span className="text-[10px] opacity-75 truncate">{allergen.category}</span>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  active ? 'bg-primary text-on-primary' : 'border border-outline-variant'
                }`}
              >
                {active && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Allergens Section */}
      <div className="flex flex-col gap-2 pt-2">
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add custom allergen (e.g. Avocado, Lupin, Sulfites)..."
            className="flex-1 h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 text-sm border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          <button
            type="button"
            onClick={() => handleAddCustom()}
            className="h-11 px-4 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-tertiary transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom</span>
          </button>
        </form>

        {customAllergens.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {customAllergens.map((custom) => (
              <span
                key={custom}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-xs font-semibold"
              >
                <span>{custom}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCustom(custom)}
                  className="hover:text-error transition-colors"
                  aria-label={`Remove custom allergen ${custom}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
