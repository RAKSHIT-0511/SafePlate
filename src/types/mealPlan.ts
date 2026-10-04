import { MealType } from './recipe';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface PlannedMealSlot {
  day: DayOfWeek;
  mealType: MealType;
  recipeId: string;
  locked: boolean;
}

export interface WeeklyMealPlan {
  id: string; // e.g., 'current_plan' or week key
  profileId: string;
  slots: PlannedMealSlot[];
  updatedAt: string;
}

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string; shortLabel: string }[] = [
  { key: 'mon', label: 'Monday', shortLabel: 'Mon' },
  { key: 'tue', label: 'Tuesday', shortLabel: 'Tue' },
  { key: 'wed', label: 'Wednesday', shortLabel: 'Wed' },
  { key: 'thu', label: 'Thursday', shortLabel: 'Thu' },
  { key: 'fri', label: 'Friday', shortLabel: 'Fri' },
  { key: 'sat', label: 'Saturday', shortLabel: 'Sat' },
  { key: 'sun', label: 'Sunday', shortLabel: 'Sun' },
];
