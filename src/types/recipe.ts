export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface Recipe {
  id: string;
  title: string;
  mealType: MealType;
  prepTimeMinutes: number;
  calories: number;
  servings: number;
  cuisine: string;
  tags: string[]; // 'Vegetarian', 'Budget-friendly', 'Under 30 Mins', 'High Protein', 'Batch Cook'
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
}
