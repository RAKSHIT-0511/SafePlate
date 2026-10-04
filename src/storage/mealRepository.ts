import { getDatabase } from './db';
import { WeeklyMealPlan } from '../types/mealPlan';

const DEFAULT_PLAN_ID = 'current_weekly_plan';

export async function getMealPlan(planId: string = DEFAULT_PLAN_ID): Promise<WeeklyMealPlan | undefined> {
  const db = await getDatabase();
  return db.get('mealPlans', planId);
}

export async function saveMealPlan(plan: WeeklyMealPlan): Promise<void> {
  const db = await getDatabase();
  plan.updatedAt = new Date().toISOString();
  await db.put('mealPlans', plan);
}
