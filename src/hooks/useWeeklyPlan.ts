import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserProfile } from '../types/profile';
import { WeeklyMealPlan, PlannedMealSlot, DayOfWeek, DAYS_OF_WEEK } from '../types/mealPlan';
import { MealType, Recipe } from '../types/recipe';
import { RECIPES_DATASET } from '../data/recipes';
import { evaluateSafety } from '../safety/safetyEngine';
import { getMealPlan, saveMealPlan } from '../storage/mealRepository';
import {
  getSupabaseMealPlan,
  saveSupabaseMealPlan,
} from '../storage/supabaseMealRepository';

export interface PlanFilters {
  cuisine?: string;
  preferences: string[]; // e.g. ['Vegetarian', 'Under 30 Mins']
}

export function useWeeklyPlan(activeProfile: UserProfile | null) {
  const { user } = useAuth();
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

  const activeProfileId = activeProfile?.id;
  const userId = user?.id;

  // Initial load / active profile change
  useEffect(() => {
    let isCancelled = false;

    async function loadPlan() {
      if (!userId || !activeProfileId) {
        setMealPlan(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Clear previous profile's plan immediately to avoid stale visual bleed
        setMealPlan(null);

        let supabasePlan: WeeklyMealPlan | null = null;
        try {
          supabasePlan = await getSupabaseMealPlan(userId, activeProfileId);
        } catch (supaErr: any) {
          console.warn('Could not load weekly meal plan from Supabase:', supaErr.message);
        }

        if (isCancelled) return;

        if (supabasePlan && supabasePlan.slots.length > 0) {
          setMealPlan(supabasePlan);
          // Passively cache to IndexedDB keyed by profileId
          await saveMealPlan({
            ...supabasePlan,
            id: `plan_${activeProfileId}`,
            profileId: activeProfileId,
          }).catch(() => {});
        } else {
          // If offline/fallback, read local cache ONLY if matching activeProfileId
          const local = await getMealPlan(`plan_${activeProfileId}`).catch(() => null);
          if (isCancelled) return;

          if (local && local.profileId === activeProfileId && local.slots.length > 0) {
            setMealPlan(local);
          } else {
            // Profile has no weekly plan yet: clean empty state
            setMealPlan(null);
          }
        }
      } catch (err) {
        console.error('Failed to load meal plan:', err);
        if (!isCancelled) setMealPlan(null);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadPlan();

    return () => {
      isCancelled = true;
    };
  }, [userId, activeProfileId]);

  // Generate a full 7-day week for the active profile
  const generateWeek = useCallback(
    async (filters?: PlanFilters) => {
      if (!user?.id || !activeProfile?.id) return;

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

      const planToSave: WeeklyMealPlan = {
        id: mealPlan?.id || crypto.randomUUID(),
        profileId: activeProfile.id,
        slots: newSlots,
        updatedAt: new Date().toISOString(),
      };

      try {
        const saved = await saveSupabaseMealPlan(user.id, activeProfile.id, planToSave);
        setMealPlan(saved);
        await saveMealPlan({
          ...saved,
          id: `plan_${activeProfile.id}`,
          profileId: activeProfile.id,
        }).catch(() => {});
      } catch (err) {
        console.error('Failed to save meal plan to Supabase:', err);
        setMealPlan(planToSave);
        await saveMealPlan({
          ...planToSave,
          id: `plan_${activeProfile.id}`,
          profileId: activeProfile.id,
        }).catch(() => {});
      }
    },
    [user?.id, activeProfile, mealPlan, findSafeRecipe]
  );

  // Toggle meal slot lock
  const toggleLock = async (day: DayOfWeek, mealType: MealType) => {
    if (!mealPlan || !user?.id || !activeProfile?.id) return;

    const updatedSlots = mealPlan.slots.map((slot) => {
      if (slot.day === day && slot.mealType === mealType) {
        return { ...slot, locked: !slot.locked };
      }
      return slot;
    });

    const updatedPlan: WeeklyMealPlan = {
      ...mealPlan,
      profileId: activeProfile.id,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = await saveSupabaseMealPlan(user.id, activeProfile.id, updatedPlan);
      setMealPlan(saved);
      await saveMealPlan({
        ...saved,
        id: `plan_${activeProfile.id}`,
        profileId: activeProfile.id,
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to update lock in Supabase:', err);
      setMealPlan(updatedPlan);
      await saveMealPlan({
        ...updatedPlan,
        id: `plan_${activeProfile.id}`,
        profileId: activeProfile.id,
      }).catch(() => {});
    }
  };

  // Swap a single meal with another safe one
  const swapMeal = async (day: DayOfWeek, mealType: MealType, filters?: PlanFilters) => {
    if (!mealPlan || !user?.id || !activeProfile?.id) return;

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

    const updatedPlan: WeeklyMealPlan = {
      ...mealPlan,
      profileId: activeProfile.id,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = await saveSupabaseMealPlan(user.id, activeProfile.id, updatedPlan);
      setMealPlan(saved);
      await saveMealPlan({
        ...saved,
        id: `plan_${activeProfile.id}`,
        profileId: activeProfile.id,
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to update swapped meal in Supabase:', err);
      setMealPlan(updatedPlan);
      await saveMealPlan({
        ...updatedPlan,
        id: `plan_${activeProfile.id}`,
        profileId: activeProfile.id,
      }).catch(() => {});
    }
  };

  return {
    mealPlan,
    loading,
    generateWeek,
    toggleLock,
    swapMeal,
  };
}
