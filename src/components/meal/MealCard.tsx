import React from 'react';
import { Recipe } from '../../types/recipe';
import { SafetyCheckResult } from '../../safety/types';
import { SafetyIndicator } from '../safety/SafetyIndicator';
import { Lock, Unlock, RefreshCw, Clock, Info } from 'lucide-react';

interface MealCardProps {
  recipe: Recipe;
  dayLabel: string;
  isLocked: boolean;
  safetyResult: SafetyCheckResult;
  onToggleLock: () => void;
  onSwap: () => void;
  onSelect: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  recipe,
  dayLabel,
  isLocked,
  safetyResult,
  onToggleLock,
  onSwap,
  onSelect,
}) => {
  // Short one-line summary
  const shortWhySummary =
    safetyResult.reasons.length > 0
      ? safetyResult.reasons[0].replace(/\. Active profile.*/, '')
      : 'No allergens detected in ingredient list';

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-3 sm:p-3.5 shadow-tactile border border-outline-variant/40 flex flex-col justify-between hover:shadow-tactile-hover transition-all">
      <div>
        {/* Meal Image + Day Label */}
        <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-2.5 bg-surface-container">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-2 left-2 text-xs font-bold bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface px-2.5 py-0.5 rounded-full shadow-sm">
            {dayLabel}
          </span>
          {isLocked && (
            <span className="absolute top-2 right-2 text-[10px] font-bold bg-primary text-on-primary px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </span>
          )}
        </div>

        {/* Time & Title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{recipe.prepTimeMinutes}m</span>
          </span>
          <span className="text-[11px] text-on-surface-variant font-medium">
            {recipe.calories} kcal
          </span>
        </div>

        <h3 className="font-bold text-sm sm:text-base text-on-surface line-clamp-1 mb-1">
          {recipe.title}
        </h3>

        {/* Safety Badge */}
        <div className="mb-2">
          <SafetyIndicator status={safetyResult.status} size="sm" />
        </div>

        {/* Short 'Why safe' summary */}
        <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed bg-surface-container-low/70 p-2 rounded-lg">
          <strong className="text-on-surface">Why safe:</strong> {shortWhySummary}
        </p>
      </div>

      {/* THREE EXPLICIT ACTION BUTTONS: [Swap] [Lock/Unlock] [Details] */}
      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-surface-container">
        {/* Swap button */}
        <button
          type="button"
          onClick={onSwap}
          disabled={isLocked}
          className="h-9 px-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-95"
          title={isLocked ? 'Cannot swap locked meal' : 'Swap with another safe recipe'}
        >
          <RefreshCw className="w-3.5 h-3.5 text-secondary" />
          <span>Swap</span>
        </button>

        {/* Lock / Unlock button */}
        <button
          type="button"
          onClick={onToggleLock}
          className={`h-9 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer select-none active:scale-95 ${
            isLocked
              ? 'bg-primary text-on-primary font-bold shadow-sm'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
          }`}
          title={isLocked ? 'Click to Unlock this meal' : 'Click to Lock / Keep this meal'}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-on-surface-variant" />}
          <span>{isLocked ? 'Unlock' : 'Lock'}</span>
        </button>

        {/* Details button */}
        <button
          type="button"
          onClick={onSelect}
          className="h-9 px-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer select-none active:scale-95"
          title="View full recipe and safety details"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
};
