import { useState, useEffect, useCallback, useMemo } from 'react';
import { GroceryCategory, GroceryItem } from '../types/grocery';
import { WeeklyMealPlan } from '../types/mealPlan';
import { RECIPES_DATASET } from '../data/recipes';
import { consolidateIngredients, RawIngredientEntry } from '../utils/ingredientNormalizer';
import { getStoredGroceryList, saveStoredGroceryList } from '../storage/groceryRepository';
import { copyTextToClipboard, formatGroceryListAsText } from '../utils/exportUtils';

export function useGroceryList(mealPlan: WeeklyMealPlan | null, activeProfileName: string = 'Household') {
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
    async function initGrocery() {
      try {
        setLoading(true);
        const stored = await getStoredGroceryList();
        const consolidated = consolidateIngredients(rawIngredients, stored || []);
        setItems(consolidated);
        await saveStoredGroceryList(consolidated);
      } catch (err) {
        console.error('Failed to initialize grocery list:', err);
      } finally {
        setLoading(false);
      }
    }

    initGrocery();
  }, [rawIngredients]);

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
      await saveStoredGroceryList(updated);
    },
    [items]
  );

  // Mark all checked
  const markAllSafe = useCallback(async () => {
    const updated = items.map((item) => ({ ...item, checked: true }));
    setItems(updated);
    await saveStoredGroceryList(updated);
  }, [items]);

  // Reset all checks
  const resetChecks = useCallback(async () => {
    const updated = items.map((item) => ({ ...item, checked: false }));
    setItems(updated);
    await saveStoredGroceryList(updated);
  }, [items]);

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
      await saveStoredGroceryList(updated);
    },
    [items]
  );

  // Remove custom item
  const removeCustomItem = useCallback(
    async (id: string) => {
      const updated = items.filter((item) => item.id !== id);
      setItems(updated);
      await saveStoredGroceryList(updated);
    },
    [items]
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
