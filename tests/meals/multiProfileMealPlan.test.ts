import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSupabaseMealPlan,
  saveSupabaseMealPlan,
  deleteSupabaseMealPlan,
} from '../../src/storage/supabaseMealRepository';
import { supabase } from '../../src/lib/supabase';
import { WeeklyMealPlan } from '../../src/types/mealPlan';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Multi-Profile Weekly Meal Plan Repository', () => {
  const mockUserId = 'usr_ohm_family';
  const ohmProfileId = '11111111-1111-4111-8111-111111111111';
  const momProfileId = '22222222-2222-4222-8222-222222222222';
  const dadProfileId = '33333333-3333-4333-8333-333333333333';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OHM and Mom can have different weekly plans; loading OHM retrieves only OHM plan', async () => {
    const ohmMealPlanRow = {
      id: 'plan_ohm_uuid',
      user_id: mockUserId,
      profile_id: ohmProfileId,
      slots: [
        { day: 'mon', mealType: 'breakfast', recipeId: 'recipe_oatmeal', locked: false },
        { day: 'mon', mealType: 'lunch', recipeId: 'recipe_salad', locked: false },
      ],
      updated_at: '2026-10-05T01:00:00Z',
    };

    let queriedUserId: string | null = null;
    let queriedProfileId: string | null = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'meal_plans') {
        const queryBuilder: any = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === 'user_id') queriedUserId = val;
            if (col === 'profile_id') queriedProfileId = val;
            return queryBuilder;
          }),
          maybeSingle: vi.fn().mockImplementation(() => {
            if (queriedUserId === mockUserId && queriedProfileId === ohmProfileId) {
              return Promise.resolve({ data: ohmMealPlanRow, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          }),
        };
        return queryBuilder;
      }
      return {};
    });

    const result = await getSupabaseMealPlan(mockUserId, ohmProfileId);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('plan_ohm_uuid');
    expect(result?.profileId).toBe(ohmProfileId);
    expect(result?.slots).toHaveLength(2);
    expect(result?.slots[0].recipeId).toBe('recipe_oatmeal');
    expect(queriedUserId).toBe(mockUserId);
    expect(queriedProfileId).toBe(ohmProfileId);
  });

  it('loading Mom retrieves only Moms plan', async () => {
    const momMealPlanRow = {
      id: 'plan_mom_uuid',
      user_id: mockUserId,
      profile_id: momProfileId,
      slots: [
        { day: 'mon', mealType: 'breakfast', recipeId: 'recipe_smoothie', locked: true },
        { day: 'mon', mealType: 'dinner', recipeId: 'recipe_salmon', locked: false },
      ],
      updated_at: '2026-10-05T02:00:00Z',
    };

    let queriedUserId: string | null = null;
    let queriedProfileId: string | null = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'meal_plans') {
        const queryBuilder: any = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === 'user_id') queriedUserId = val;
            if (col === 'profile_id') queriedProfileId = val;
            return queryBuilder;
          }),
          maybeSingle: vi.fn().mockImplementation(() => {
            if (queriedUserId === mockUserId && queriedProfileId === momProfileId) {
              return Promise.resolve({ data: momMealPlanRow, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          }),
        };
        return queryBuilder;
      }
      return {};
    });

    const result = await getSupabaseMealPlan(mockUserId, momProfileId);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('plan_mom_uuid');
    expect(result?.profileId).toBe(momProfileId);
    expect(result?.slots[0].recipeId).toBe('recipe_smoothie');
    expect(result?.slots[0].locked).toBe(true);
    expect(queriedUserId).toBe(mockUserId);
    expect(queriedProfileId).toBe(momProfileId);
  });

  it('saving Moms plan targets Moms profile_id and does not overwrite OHMs plan', async () => {
    const momNewPlan: WeeklyMealPlan = {
      id: 'plan_mom_uuid',
      profileId: momProfileId,
      slots: [{ day: 'tue', mealType: 'lunch', recipeId: 'recipe_quinoa', locked: false }],
      updatedAt: '2026-10-05T03:00:00Z',
    };

    let savedPayload: any = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'meal_plans') {
        const queryBuilder: any = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          upsert: vi.fn().mockImplementation((payload: any) => {
            savedPayload = payload;
            return {
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { ...payload, id: payload.id },
                error: null,
              }),
            };
          }),
        };
        return queryBuilder;
      }
      return {};
    });

    const saved = await saveSupabaseMealPlan(mockUserId, momProfileId, momNewPlan);

    expect(saved.profileId).toBe(momProfileId);
    expect(savedPayload.user_id).toBe(mockUserId);
    expect(savedPayload.profile_id).toBe(momProfileId);
    expect(savedPayload.profile_id).not.toBe(ohmProfileId);
  });

  it('locking / swapping updates only the active profile plan payload', async () => {
    const updatedPlan: WeeklyMealPlan = {
      id: 'plan_ohm_uuid',
      profileId: ohmProfileId,
      slots: [{ day: 'mon', mealType: 'breakfast', recipeId: 'recipe_oatmeal', locked: true }],
      updatedAt: '2026-10-05T03:30:00Z',
    };

    let savedPayload: any = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'meal_plans') {
        const queryBuilder: any = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'plan_ohm_uuid' }, error: null }),
          upsert: vi.fn().mockImplementation((payload: any) => {
            savedPayload = payload;
            return {
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: payload,
                error: null,
              }),
            };
          }),
        };
        return queryBuilder;
      }
      return {};
    });

    const result = await saveSupabaseMealPlan(mockUserId, ohmProfileId, updatedPlan);

    expect(result.profileId).toBe(ohmProfileId);
    expect(savedPayload.profile_id).toBe(ohmProfileId);
    expect(savedPayload.slots[0].locked).toBe(true);
  });

  it('no-profile / empty state returns null for profile without meal plan', async () => {
    let queriedProfileId: string | null = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'meal_plans') {
        const queryBuilder: any = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === 'profile_id') queriedProfileId = val;
            return queryBuilder;
          }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
        return queryBuilder;
      }
      return {};
    });

    const result = await getSupabaseMealPlan(mockUserId, dadProfileId);

    expect(result).toBeNull();
    expect(queriedProfileId).toBe(dadProfileId);
  });

  it('deleting a meal plan uses both user_id and profile_id', async () => {
    let deletedUserId: string | null = null;
    let deletedProfileId: string | null = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'meal_plans') {
        const queryBuilder: any = {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === 'user_id') deletedUserId = val;
            if (col === 'profile_id') deletedProfileId = val;
            return queryBuilder;
          }),
        };
        return queryBuilder;
      }
      return {};
    });

    await deleteSupabaseMealPlan(mockUserId, momProfileId);

    expect(deletedUserId).toBe(mockUserId);
    expect(deletedProfileId).toBe(momProfileId);
  });
});
