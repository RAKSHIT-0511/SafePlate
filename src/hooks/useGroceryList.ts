import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { GroceryCategory, GroceryItem } from '../types/grocery';
import { WeeklyMealPlan } from '../types/mealPlan';
import { RECIPES_DATASET } from '../data/recipes';
import { consolidateIngredients, RawIngredientEntry } from '../utils/ingredientNormalizer';
import { getStoredGroceryList, saveStoredGroceryList } from '../storage/groceryRepository';
import {
  getSupabaseGroceryList,
  saveSupabaseGroceryList,
} from '../storage/supabaseGroceryRepository';
import { copyTextToClipboard, formatGroceryListAsText } from '../utils/exportUtils';

export function useGroceryList(mealPlan: WeeklyMealPlan | null, activeProfileName: string = 'Household') {
  const { user } = useAuth();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);

  // Collect raw ingredients from current planned recipes
  const rawIngredients = useMemo<RawIngredientEntry[]>(() => {
    if (!mealPlan || mealPlan.slots.length === 0) return [];

    const list: RawIngredientEntry[] = [];
    const recipeMap = new Map<string, (typeof RECIPES_DATASET)[0]>();
    for (const r of RECIPES_DATASET) {
      recipeMap.set(r.id, r);
    }

    for (const slot of mealPlan.slots) {
      const recipe = recipeMap.get(slot.recipeId);
      if (recipe) {
        for (const ing of recipe.ingredients) {
          list.push({ raw: ing, recipeTitle: recipe.title });
        }
      }
    }

    return list;
  }, [mealPlan]);

  // Load and consolidate
  useEffect(() => {
    let isMounted = true;

    async function initGrocery() {
      try {
        setLoading(true);

        let storedItems: GroceryItem[] | null = null;

        if (user && user.id) {
          try {
            storedItems = await getSupabaseGroceryList(user.id);
          } catch (supaErr: any) {
            console.warn('Could not load grocery list from Supabase:', supaErr.message);
          }
        }

        // If Supabase returned nothing or offline, check local cache
        if (storedItems === null) {
          storedItems = await getStoredGroceryList().catch(() => null);
        }

        if (!isMounted) return;

        const consolidated = consolidateIngredients(rawIngredients, storedItems || []);
        setItems(consolidated);

        // Mirror to IndexedDB cache
        await saveStoredGroceryList(consolidated).catch(() => {});

        // If authenticated and items changed or exist, persist to Supabase
        if (user && user.id && consolidated.length > 0) {
          await saveSupabaseGroceryList(user.id, consolidated).catch((err) =>
            console.error('Failed to sync initial grocery list to Supabase:', err)
          );
        }
      } catch (err) {
        console.error('Failed to initialize grocery list:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initGrocery();

    return () => {
      isMounted = false;
    };
  }, [user?.id, rawIngredients]);

  // Toggle item check
  const toggleItem = useCallback(
    async (id: string) => {
      const updated = items.map((item) => {
        if (item.id === id) {
          return { ...item, checked: !item.checked };
        }
        return item;
      });
      setItems(updated);
      await saveStoredGroceryList(updated).catch(() => {});
      if (user && user.id) {
        try {
          await saveSupabaseGroceryList(user.id, updated);
        } catch (err: any) {
          console.error('Failed to persist toggle to Supabase:', err.message || err);
        }
      }
    },
    [items, user]
  );

  // Mark all checked
  const markAllSafe = useCallback(async () => {
    const updated = items.map((item) => ({ ...item, checked: true }));
    setItems(updated);
    await saveStoredGroceryList(updated).catch(() => {});
    if (user && user.id) {
      try {
        await saveSupabaseGroceryList(user.id, updated);
      } catch (err: any) {
        console.error('Failed to persist markAllSafe to Supabase:', err.message || err);
      }
    }
  }, [items, user]);

  // Reset all checks
  const resetChecks = useCallback(async () => {
    const updated = items.map((item) => ({ ...item, checked: false }));
    setItems(updated);
    await saveStoredGroceryList(updated).catch(() => {});
    if (user && user.id) {
      try {
        await saveSupabaseGroceryList(user.id, updated);
      } catch (err: any) {
        console.error('Failed to persist resetChecks to Supabase:', err.message || err);
      }
    }
  }, [items, user]);

  // Add custom grocery item
  const addCustomItem = useCallback(
    async (name: string, category: GroceryCategory = 'Other', quantity: string = '1 unit') => {
      if (!name.trim()) return;

      const newItem: GroceryItem = {
        id: `custom_${Date.now()}`,
        name: name.trim(),
        quantity: quantity.trim() || '1 unit',
        category,
        checked: false,
        isCustom: true,
      };

      const updated = [newItem, ...items];
      setItems(updated);
      await saveStoredGroceryList(updated).catch(() => {});
      if (user && user.id) {
        try {
          await saveSupabaseGroceryList(user.id, updated);
        } catch (err: any) {
          console.error('Failed to persist custom item to Supabase:', err.message || err);
        }
      }
    },
    [items, user]
  );

  // Remove custom item
  const removeCustomItem = useCallback(
    async (id: string) => {
      const updated = items.filter((item) => item.id !== id);
      setItems(updated);
      await saveStoredGroceryList(updated).catch(() => {});
      if (user && user.id) {
        try {
          await saveSupabaseGroceryList(user.id, updated);
        } catch (err: any) {
          console.error('Failed to persist item deletion to Supabase:', err.message || err);
        }
      }
    },
    [items, user]
  );

  // Copy grocery list
  const copyGroceryList = useCallback(async () => {
    const text = formatGroceryListAsText(items, activeProfileName);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
    return success;
  }, [items, activeProfileName]);

  // Calculations
  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  return {
    items,
    loading,
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
  };
}
