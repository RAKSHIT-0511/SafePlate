import { supabase } from '../lib/supabase';
import { GroceryItem } from '../types/grocery';

/**
 * Fetch the authenticated user's grocery list from Supabase.
 * Returns null if no grocery list exists for this user ID.
 */
export async function getSupabaseGroceryList(userId: string): Promise<GroceryItem[] | null> {
  const { data: row, error } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching grocery list from Supabase:', error.message);
    throw error;
  }

  if (!row) {
    return null;
  }

  return Array.isArray(row.items) ? (row.items as GroceryItem[]) : [];
}

/**
 * Save or upsert the authenticated user's grocery list in Supabase.
 */
export async function saveSupabaseGroceryList(
  userId: string,
  items: GroceryItem[]
): Promise<GroceryItem[]> {
  const now = new Date().toISOString();

  const payload = {
    user_id: userId,
    items: items || [],
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('grocery_lists')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving grocery list to Supabase:', error.message);
    throw error;
  }

  return Array.isArray(data.items) ? (data.items as GroceryItem[]) : [];
}

/**
 * Delete the authenticated user's grocery list from Supabase.
 */
export async function deleteSupabaseGroceryList(userId: string): Promise<void> {
  const { error } = await supabase
    .from('grocery_lists')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting grocery list from Supabase:', error.message);
    throw error;
  }
}
