import React from 'react';
import { UserProfile } from '../../types/profile';
import { Sparkles, Utensils, Shield, Check } from 'lucide-react';

interface WeekPlannerHeaderProps {
  activeProfile: UserProfile | null;
  selectedCuisine: string;
  onSelectCuisine: (cuisine: string) => void;
  selectedPreferences: string[];
  onTogglePreference: (pref: string) => void;
  onGenerateWeek: () => void;
  isGenerating?: boolean;
}

const PREFERENCE_OPTIONS = [
  'Vegetarian',
  'Budget-friendly',
  'Under 30 Mins',
  'High Protein',
  'Batch Cook',
];

const CUISINE_OPTIONS = [
  'All Cuisines',
  'Mediterranean',
  'East Asian',
  'Comfort Classics',
  'Latin & Central American',
  'Nordic & Coastal',
];

export const WeekPlannerHeader: React.FC<WeekPlannerHeaderProps> = ({
  activeProfile,
  selectedCuisine,
  onSelectCuisine,
  selectedPreferences,
  onTogglePreference,
  onGenerateWeek,
  isGenerating = false,
}) => {
  const getFilteredAllergensSummary = () => {
    if (!activeProfile || activeProfile.allergens.length === 0) {
      return 'No configured allergen restrictions';
    }
    return activeProfile.allergens.map((a) => a.allergenName).join(', ');
  };

  return (
    <section className="w-full mb-6">
      <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col gap-4">
        {/* Upper Row: Profile, Cuisine, and Generate Week Action */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Active Household Member Info */}
            <div className="flex items-center gap-2.5 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30 min-h-[48px]">
              <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary-fixed shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold leading-none">
                  Active Household Member
                </span>
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  {activeProfile ? `${activeProfile.name} (${activeProfile.relationship})` : 'All Household'}
                </span>
              </div>
            </div>

            {/* Cuisine Selector */}
            <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl border border-outline-variant/30 min-h-[48px]">
              <Utensils className="w-4 h-4 text-tertiary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold leading-none">
                  Cuisine Focus
                </span>
                <select
                  value={selectedCuisine}
                  onChange={(e) => onSelectCuisine(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-bold text-on-surface focus:outline-none cursor-pointer pr-2"
                >
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Action Button: Generate Week */}
          <button
            type="button"
            onClick={onGenerateWeek}
            disabled={isGenerating}
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Filtering Safe Meals...' : 'Generate Week'}</span>
          </button>
        </div>

        {/* Filter Chips & Allergen Guard Info Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-surface-container/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-on-surface-variant mr-1">
              Preferences:
            </span>
            {PREFERENCE_OPTIONS.map((pref) => {
              const active = selectedPreferences.includes(pref);
              return (
                <button
                  key={pref}
                  type="button"
                  onClick={() => onTogglePreference(pref)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                    active
                      ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {active && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{pref}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full">
            <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              Filtered: <strong className="text-on-surface">{getFilteredAllergensSummary()}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
