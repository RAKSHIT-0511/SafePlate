import React from 'react';
import { Recipe } from '../../types/recipe';
import { SafetyCheckResult } from '../../safety/types';
import { Modal } from '../common/Modal';
import { SafetyIndicator } from '../safety/SafetyIndicator';
import { Clock, Flame, Users, ChefHat, Check, ShieldCheck } from 'lucide-react';

interface MealDetailDrawerProps {
  recipe: Recipe | null;
  safetyResult: SafetyCheckResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MealDetailDrawer: React.FC<MealDetailDrawerProps> = ({
  recipe,
  safetyResult,
  isOpen,
  onClose,
}) => {
  if (!recipe || !safetyResult) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recipe.title} maxWidth="2xl">
      <div className="flex flex-col gap-6">
        {/* Photo and Primary Stats */}
        <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-surface-container shadow-inner">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <SafetyIndicator status={safetyResult.status} size="md" />
          </div>
        </div>

        {/* Quick Recipe Meta */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface-container-low text-center">
          <div className="flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs text-on-surface-variant">Prep Time</span>
            <span className="text-sm font-bold text-on-surface">{recipe.prepTimeMinutes} mins</span>
          </div>
          <div className="flex flex-col items-center justify-center border-x border-surface-container">
            <Flame className="w-4 h-4 text-secondary mb-1" />
            <span className="text-xs text-on-surface-variant">Energy</span>
            <span className="text-sm font-bold text-on-surface">{recipe.calories} kcal</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Users className="w-4 h-4 text-tertiary mb-1" />
            <span className="text-xs text-on-surface-variant">Servings</span>
            <span className="text-sm font-bold text-on-surface">{recipe.servings} portions</span>
          </div>
        </div>

        {/* Safety Engine Verification Box */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-status-safe-text/30 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Safety Clearance Verified</span>
            </div>
            <span className="text-xs font-semibold text-primary">
              Filtered for {safetyResult.details.profileName}
            </span>
          </div>

          <div className="text-xs text-on-surface flex flex-col gap-1">
            <p className="leading-relaxed">
              <strong>Allergen scan:</strong> Tested against{' '}
              {safetyResult.details.checkedAllergens.join(', ') || 'No configured restrictions'}.
            </p>
            {safetyResult.reasons.map((r, i) => (
              <p key={i} className="text-on-surface-variant leading-relaxed">
                • {r}
              </p>
            ))}
          </div>
        </div>

        {/* Ingredients Checklist */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-primary" />
            <span>Ingredients ({recipe.ingredients.length})</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {recipe.ingredients.map((ing, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low text-xs text-on-surface"
              >
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-on-surface">Step-by-Step Instructions</h4>
          <ol className="flex flex-col gap-2.5 pt-1">
            {recipe.instructions.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low text-xs sm:text-sm text-on-surface leading-relaxed"
              >
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Modal>
  );
};
