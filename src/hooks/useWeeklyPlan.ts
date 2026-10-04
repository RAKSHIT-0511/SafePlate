import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/profile';
import { WeeklyMealPlan, PlannedMealSlot, DayOfWeek, DAYS_OF_WEEK } from '../types/mealPlan';
import { MealType, Recipe } from '../types/recipe';
import { RECIPES_DATASET } from '../data/recipes';
import { evaluateSafety } from '../safety/safetyEngine';
import { getMealPlan, saveMealPlan } from '../storage/mealRepository';

export interface PlanFilters {
  cuisine?: string;
  preferences: string[]; // e.g. ['Vegetarian', 'Under 30 Mins']
}

export function useWeeklyPlan(activeProfile: UserProfile | null) {
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to find a safe recipe for a slot
  const findSafeRecipe = useCallback(
    (
      mealType: MealType,
      profile: UserProfile | null,
      filters?: PlanFilters,
      excludeRecipeIds: string[] = []
    ): Recipe | null => {
      // 1. Get recipes for this meal type
      let candidates = RECIPES_DATASET.filter((r) => r.mealType === mealType);

      // 2. Filter by cuisine if specified
      if (filters?.cuisine && filters.cuisine !== 'All Cuisines') {
        const filteredByCuisine = candidates.filter((r) =>
          r.cuisine.toLowerCase().includes(filters.cuisine!.toLowerCase())
        );
        if (filteredByCuisine.length > 0) {
          candidates = filteredByCuisine;
        }
      }

      // 3. Filter by active dietary preferences
      if (filters?.preferences && filters.preferences.length > 0) {
        const filteredByTags = candidates.filter((r) =>
          filters.preferences.every((pref) => r.tags.includes(pref))
        );
        if (filteredByTags.length > 0) {
          candidates = filteredByTags;
        }
      }

      // 4. Run EVERY candidate through the deterministic Safety Engine
      const rules = profile ? profile.allergens : [];
      const profileName = profile ? profile.name : 'Active Member';

      const safeCandidates = candidates.filter((recipe) => {
        const safety = evaluateSafety(recipe.ingredients, rules, { profileName });
        return safety.status === 'SAFE';
      });

      if (safeCandidates.length === 0) {
        // Fallback: check all recipes for this mealType without tag filters for safety
        const fallbackSafe = RECIPES_DATASET.filter((r) => r.mealType === mealType).filter((recipe) => {
          const safety = evaluateSafety(recipe.ingredients, rules, { profileName });
          return safety.status === 'SAFE';
        });
        if (fallbackSafe.length === 0) return null;

        // Try to pick one not in excludeRecipeIds
        const notExcluded = fallbackSafe.filter((r) => !excludeRecipeIds.includes(r.id));
        return notExcluded.length > 0 ? notExcluded[0] : fallbackSafe[0];
      }

      // Pick a candidate not in excludeRecipeIds to promote variety
      const notExcluded = safeCandidates.filter((r) => !excludeRecipeIds.includes(r.id));
      if (notExcluded.length > 0) {
        const randomIndex = Math.floor(Math.random() * notExcluded.length);
        return notExcluded[randomIndex];
      }

      return safeCandidates[0];
    },
    []
  );

  // Generate a full 7-day week
  const generateWeek = useCallback(
    async (filters?: PlanFilters) => {
      if (!activeProfile) return;

      const currentSlots = mealPlan?.slots || [];
      const newSlots: PlannedMealSlot[] = [];
      const usedRecipeIds: string[] = [];

      for (const dayObj of DAYS_OF_WEEK) {
        const day = dayObj.key;
        for (const mType of ['breakfast', 'lunch', 'dinner'] as MealType[]) {
          const existingSlot = currentSlots.find((s) => s.day === day && s.mealType === mType);

          // If locked and safe, keep it
          if (existingSlot && existingSlot.locked) {
            const existingRecipe = RECIPES_DATASET.find((r) => r.id === existingSlot.recipeId);
            if (existingRecipe) {
              const check = evaluateSafety(existingRecipe.ingredients, activeProfile.allergens, {
                profileName: activeProfile.name,
              });
              if (check.status === 'SAFE') {
                newSlots.push(existingSlot);
                usedRecipeIds.push(existingSlot.recipeId);
                continue;
              }
            }
          }

          // Generate safe replacement
          const safeRecipe = findSafeRecipe(mType, activeProfile, filters, usedRecipeIds);
          if (safeRecipe) {
            newSlots.push({
              day,
              mealType: mType,
              recipeId: safeRecipe.id,
              locked: false,
            });
            usedRecipeIds.push(safeRecipe.id);
          } else {
            // If absolutely no recipe found, fallback to first in dataset
            const fallback = RECIPES_DATASET.find((r) => r.mealType === mType);
            newSlots.push({
              day,
              mealType: mType,
              recipeId: fallback ? fallback.id : '',
              locked: false,
            });
          }
        }
      }

      const updatedPlan: WeeklyMealPlan = {
        id: 'current_weekly_plan',
        profileId: activeProfile.id,
        slots: newSlots,
        updatedAt: new Date().toISOString(),
      };

      setMealPlan(updatedPlan);
      await saveMealPlan(updatedPlan);
    },
    [activeProfile, mealPlan, findSafeRecipe]
  );

  // Toggle meal slot lock
  const toggleLock = async (day: DayOfWeek, mealType: MealType) => {
    if (!mealPlan) return;

    const updatedSlots = mealPlan.slots.map((slot) => {
      if (slot.day === day && slot.mealType === mealType) {
        return { ...slot, locked: !slot.locked };
      }
      return slot;
    });

    const updatedPlan = { ...mealPlan, slots: updatedSlots };
    setMealPlan(updatedPlan);
    await saveMealPlan(updatedPlan);
  };

  // Swap a single meal with another safe one
  const swapMeal = async (day: DayOfWeek, mealType: MealType, filters?: PlanFilters) => {
    if (!mealPlan || !activeProfile) return;

    const currentSlot = mealPlan.slots.find((s) => s.day === day && s.mealType === mealType);
    if (currentSlot && currentSlot.locked) return; // Locked meals cannot be swapped

    const currentRecipeId = currentSlot?.recipeId || '';
    const replacement = findSafeRecipe(mealType, activeProfile, filters, [currentRecipeId]);

    if (!replacement) return;

    const updatedSlots = mealPlan.slots.map((slot) => {
      if (slot.day === day && slot.mealType === mealType) {
        return { ...slot, recipeId: replacement.id };
      }
      return slot;
    });

    const updatedPlan = { ...mealPlan, slots: updatedSlots };
    setMealPlan(updatedPlan);
    await saveMealPlan(updatedPlan);
  };

  // Initial load
  useEffect(() => {
    async function loadPlan() {
      try {
        setLoading(true);
        const stored = await getMealPlan();
        if (stored && stored.slots.length > 0) {
          setMealPlan(stored);
        } else if (activeProfile) {
          // Initialize plan
          const newSlots: PlannedMealSlot[] = [];
          for (const dayObj of DAYS_OF_WEEK) {
            for (const mType of ['breakfast', 'lunch', 'dinner'] as MealType[]) {
              const safe = findSafeRecipe(mType, activeProfile);
              newSlots.push({
                day: dayObj.key,
                mealType: mType,
                recipeId: safe ? safe.id : '',
                locked: false,
              });
            }
          }
          const initialPlan: WeeklyMealPlan = {
            id: 'current_weekly_plan',
            profileId: activeProfile.id,
            slots: newSlots,
            updatedAt: new Date().toISOString(),
          };
          setMealPlan(initialPlan);
          await saveMealPlan(initialPlan);
        }
      } catch (err) {
        console.error('Failed to load meal plan from IndexedDB:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [activeProfile?.id]);

  return {
    mealPlan,
    loading,
    generateWeek,
    toggleLock,
    swapMeal,
  };
}
