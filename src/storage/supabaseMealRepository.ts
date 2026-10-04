import { supabase } from '../lib/supabase';
import { WeeklyMealPlan, PlannedMealSlot } from '../types/mealPlan';

/**
 * Fetch the weekly meal plan for a specific household profile from Supabase.
 * Returns null if no meal plan exists for this user ID and profile ID combination.
 */
export async function getSupabaseMealPlan(
  userId: string,
  profileId: string
): Promise<WeeklyMealPlan | null> {
  const { data: row, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching weekly meal plan from Supabase:', error.message);
    throw error;
  }

  if (!row) {
    return null;
  }

  const slots: PlannedMealSlot[] = Array.isArray(row.slots) ? row.slots : [];

  return {
    id: row.id,
    profileId: row.profile_id,
    slots,
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Save or upsert the weekly meal plan for a specific household profile in Supabase.
 */
export async function saveSupabaseMealPlan(
  userId: string,
  profileId: string,
  plan: WeeklyMealPlan
): Promise<WeeklyMealPlan> {
  const now = new Date().toISOString();

  const isUuid = (str?: string) =>
    str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;

  // Check if an existing meal plan row exists for this user_id and profile_id
  let targetId = isUuid(plan.id) ? plan.id : null;

  if (!targetId) {
    const { data: existingRow, error: checkError } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (!checkError && existingRow?.id && isUuid(existingRow.id)) {
      targetId = existingRow.id;
    }
  }

  const planId = targetId || crypto.randomUUID();

  const payload: {
    id: string;
    user_id: string;
    profile_id: string;
    slots: PlannedMealSlot[];
    updated_at: string;
  } = {
    id: planId,
    user_id: userId,
    profile_id: profileId,
    slots: plan.slots || [],
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('meal_plans')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error saving weekly meal plan to Supabase:', error.message);
    throw error;
  }

  return {
    id: data.id,
    profileId: data.profile_id,
    slots: Array.isArray(data.slots) ? data.slots : [],
    updatedAt: data.updated_at,
  };
}

/**
 * Delete the weekly meal plan for a specific household profile from Supabase.
 */
export async function deleteSupabaseMealPlan(
  userId: string,
  profileId: string
): Promise<void> {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('user_id', userId)
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error deleting weekly meal plan from Supabase:', error.message);
    throw error;
  }
}
