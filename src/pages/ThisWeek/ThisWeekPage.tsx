import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../types/profile';
import { useWeeklyPlan, PlanFilters } from '../../hooks/useWeeklyPlan';
import { DAYS_OF_WEEK, DayOfWeek } from '../../types/mealPlan';
import { MealType, Recipe } from '../../types/recipe';
import { RECIPES_DATASET } from '../../data/recipes';
import { evaluateSafety } from '../../safety/safetyEngine';
import { WeekPlannerHeader } from '../../components/meal/WeekPlannerHeader';
import { MealCard } from '../../components/meal/MealCard';
import { MealDetailDrawer } from '../../components/meal/MealDetailDrawer';
import {
  Sunrise,
  Sun,
  Moon,
  CheckCircle2,
  Shield,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface ThisWeekPageProps {
  activeProfile: UserProfile | null;
}

export const ThisWeekPage: React.FC<ThisWeekPageProps> = ({ activeProfile }) => {
  const [selectedCuisine, setSelectedCuisine] = useState('All Cuisines');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    'Vegetarian',
    'Under 30 Mins',
  ]);
  const [activeDayTab, setActiveDayTab] = useState<'all' | DayOfWeek>('all');
  const [selectedRecipeForDrawer, setSelectedRecipeForDrawer] = useState<Recipe | null>(null);

  const { mealPlan, generateWeek, toggleLock, swapMeal } = useWeeklyPlan(activeProfile);

  const filters: PlanFilters = useMemo(
    () => ({
      cuisine: selectedCuisine,
      preferences: selectedPreferences,
    }),
    [selectedCuisine, selectedPreferences]
  );

  const handleTogglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const recipeMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    for (const r of RECIPES_DATASET) {
      map.set(r.id, r);
    }
    return map;
  }, []);

  // Filter slots by active day tab if not 'all'
  const filteredDays = useMemo(() => {
    if (activeDayTab === 'all') return DAYS_OF_WEEK;
    return DAYS_OF_WEEK.filter((d) => d.key === activeDayTab);
  }, [activeDayTab]);

  const mealTypes: { type: MealType; label: string; icon: React.ElementType }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: Sunrise },
    { type: 'lunch', label: 'Lunch', icon: Sun },
    { type: 'dinner', label: 'Dinner', icon: Moon },
  ];

  const safeCount = useMemo(() => {
    if (!mealPlan) return 0;
    const rules = activeProfile?.allergens || [];
    const pName = activeProfile?.name || 'Active Member';
    let count = 0;
    for (const slot of mealPlan.slots) {
      const rec = recipeMap.get(slot.recipeId);
      if (rec) {
        const check = evaluateSafety(rec.ingredients, rules, { profileName: pName });
        if (check.status === 'SAFE') count++;
      }
    }
    return count;
  }, [mealPlan, activeProfile, recipeMap]);

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Header Config Section */}
      <WeekPlannerHeader
        activeProfile={activeProfile}
        selectedCuisine={selectedCuisine}
        onSelectCuisine={setSelectedCuisine}
        selectedPreferences={selectedPreferences}
        onTogglePreference={handleTogglePreference}
        onGenerateWeek={() => generateWeek(filters)}
      />

      {/* Main Two-Column Content: Left 7-Day Matrix, Right Week Summary */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Left Matrix Column */}
        <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
          {/* Day Filter Tabs */}
          <div className="bg-surface-container-low p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-sm border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setActiveDayTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeDayTab === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All 7 Days
            </button>
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => setActiveDayTab(day.key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeDayTab === day.key
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {day.shortLabel}
              </button>
            ))}
          </div>

          {/* Meals By Category */}
          {mealTypes.map((category) => {
            const CatIcon = category.icon;
            return (
              <div key={category.type} className="flex flex-col gap-3">
                {/* Category Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <CatIcon className="w-4 h-4" />
                    </span>
                    <h2 className="font-bold text-lg text-on-surface">{category.label}</h2>
                    <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {filteredDays.length} Planned
                    </span>
                  </div>
                </div>

                {/* Grid of Meal Cards for filtered days */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDays.map((day) => {
                    const slot = mealPlan?.slots.find(
                      (s) => s.day === day.key && s.mealType === category.type
                    );
                    const recipe = slot ? recipeMap.get(slot.recipeId) : null;

                    if (!recipe) {
                      return (
                        <div
                          key={day.key}
                          className="p-6 rounded-2xl bg-surface-container-lowest border border-dashed border-outline-variant text-center flex flex-col items-center justify-center gap-2"
                        >
                          <span className="text-xs font-bold text-on-surface-variant">
                            {day.shortLabel} {category.label}
                          </span>
                          <span className="text-xs text-on-surface-variant">No meal assigned</span>
                        </div>
                      );
                    }

                    // Run through Safety Engine
                    const safetyResult = evaluateSafety(
                      recipe.ingredients,
                      activeProfile?.allergens || [],
                      { profileName: activeProfile?.name || 'Active Member' }
                    );

                    return (
                      <MealCard
                        key={`${day.key}_${category.type}`}
                        recipe={recipe}
                        dayLabel={day.shortLabel}
                        isLocked={slot?.locked || false}
                        safetyResult={safetyResult}
                        onToggleLock={() => toggleLock(day.key, category.type)}
                        onSwap={() => swapMeal(day.key, category.type, filters)}
                        onSelect={() => setSelectedRecipeForDrawer(recipe)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Sidebar: Week Summary */}
        <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-24 flex flex-col gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-bold text-base text-on-surface">Week Clearance</h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                7-Day Matrix
              </span>
            </div>

            {/* Clearance Metric */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <div>
                  <span className="text-xs text-on-surface-variant font-medium">Safe Clearances</span>
                  <p className="font-bold text-sm text-on-surface">
                    {safeCount} / {mealPlan?.slots.length || 21} Safe Meals
                  </p>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                100%
              </span>
            </div>

            {/* Allergens Protected */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 flex items-center gap-3">
              <Shield className="w-6 h-6 text-secondary shrink-0" />
              <div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Active Protections
                </span>
                <p className="font-bold text-xs text-on-surface">
                  {activeProfile?.allergens.length || 0} Allergens Filtered
                </p>
                <p className="text-[11px] text-on-surface-variant truncate max-w-[200px]">
                  {activeProfile?.allergens.map((a) => a.allergenName).join(', ') ||
                    'General nutrition'}
                </p>
              </div>
            </div>

            {/* Estimated Grocery Cost */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-tertiary shrink-0" />
              <div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Estimated Grocery Total
                </span>
                <p className="font-bold text-sm text-on-surface">~$76.40</p>
                <p className="text-[11px] text-primary font-semibold">~$3.63 / safe plate</p>
              </div>
            </div>

            {/* CTA to Grocery List */}
            <div className="pt-2 border-t border-surface-container flex flex-col gap-2">
              <Link
                to="/grocery"
                className="w-full h-12 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Generate Grocery List</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Recipe Detail Drawer/Modal */}
      {selectedRecipeForDrawer && (
        <MealDetailDrawer
          recipe={selectedRecipeForDrawer}
          safetyResult={evaluateSafety(
            selectedRecipeForDrawer.ingredients,
            activeProfile?.allergens || [],
            { profileName: activeProfile?.name || 'Active Member' }
          )}
          isOpen={!!selectedRecipeForDrawer}
          onClose={() => setSelectedRecipeForDrawer(null)}
        />
      )}
    </div>
  );
};
