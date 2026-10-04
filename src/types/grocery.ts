export type GroceryCategory =
  | 'Fresh Produce'
  | 'Dairy Alternatives'
  | 'Grains & Baking'
  | 'Proteins'
  | 'Pantry'
  | 'Other';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: GroceryCategory;
  checked: boolean;
  isCustom?: boolean;
  note?: string;
  recipeSource?: string;
}

export interface GroceryListState {
  items: GroceryItem[];
  updatedAt: string;
}

export const GROCERY_CATEGORIES: GroceryCategory[] = [
  'Fresh Produce',
  'Dairy Alternatives',
  'Grains & Baking',
  'Proteins',
  'Pantry',
  'Other',
];
