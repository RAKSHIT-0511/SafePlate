import { getDatabase } from './db';
import { GroceryItem } from '../types/grocery';

const DEFAULT_GROCERY_KEY = 'active_grocery_list';

export async function getStoredGroceryList(): Promise<GroceryItem[] | null> {
  const db = await getDatabase();
  const record = await db.get('grocery', DEFAULT_GROCERY_KEY);
  if (!record) return null;
  return record.items;
}

export async function saveStoredGroceryList(items: GroceryItem[]): Promise<void> {
  const db = await getDatabase();
  await db.put('grocery', {
    id: DEFAULT_GROCERY_KEY,
    items,
    updatedAt: new Date().toISOString(),
  });
}
