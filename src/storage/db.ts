import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserProfile } from '../types/profile';
import { WeeklyMealPlan } from '../types/mealPlan';
import { GroceryItem } from '../types/grocery';

interface SafePlateDB extends DBSchema {
  profiles: {
    key: string;
    value: UserProfile;
  };
  preferences: {
    key: string;
    value: { key: string; value: any };
  };
  mealPlans: {
    key: string;
    value: WeeklyMealPlan;
  };
  grocery: {
    key: string;
    value: { id: string; items: GroceryItem[]; updatedAt: string };
  };
}

const DB_NAME = 'safeplate_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SafePlateDB>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<SafePlateDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SafePlateDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('mealPlans')) {
          db.createObjectStore('mealPlans', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('grocery')) {
          db.createObjectStore('grocery', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}
