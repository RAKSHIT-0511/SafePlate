import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSupabaseProfiles,
  saveSupabaseProfile,
  deleteSupabaseProfile,
} from '../../src/storage/supabaseProfileRepository';
import { supabase } from '../../src/lib/supabase';
import { UserProfile } from '../../src/types/profile';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Multi-Profile Household Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all profiles for an authenticated user with their respective allergens', async () => {
    const mockUserId = 'usr_ohm_123';
    const profile1Id = '11111111-1111-4111-8111-111111111111';
    const profile2Id = '22222222-2222-4222-8222-222222222222';

    const mockProfiles = [
      {
        id: profile1Id,
        user_id: mockUserId,
        name: 'OHM',
        relationship: 'Self',
        avatar_url: 'https://avatar1.png',
        custom_allergens: [],
        shared_kitchen_notes: ['Dedicated drawer'],
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
      {
        id: profile2Id,
        user_id: mockUserId,
        name: 'Mom',
        relationship: 'Mother',
        avatar_url: 'https://avatar2.png',
        custom_allergens: ['Lupin'],
        shared_kitchen_notes: ['No tree nuts on counter'],
        created_at: '2026-10-02T00:00:00Z',
        updated_at: '2026-10-02T00:00:00Z',
      },
    ];

    const mockAllergens = [
      {
        profile_id: profile2Id,
        allergen_id: 'tree_nuts',
        allergen_name: 'Tree Nuts',
        severity: 'LIFE_THREATENING',
      },
    ];

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
        };
      }
      if (table === 'profile_allergens') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: mockAllergens, error: null }),
        };
      }
      return {};
    });

    const result = await getSupabaseProfiles(mockUserId);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('OHM');
    expect(result[0].id).toBe(profile1Id);
    expect(result[0].allergens).toHaveLength(0);

    expect(result[1].name).toBe('Mom');
    expect(result[1].id).toBe(profile2Id);
    expect(result[1].allergens).toHaveLength(1);
    expect(result[1].allergens[0].allergenName).toBe('Tree Nuts');
    expect(result[1].allergens[0].severity).toBe('LIFE_THREATENING');
  });

  it('preserves existing profile ID when saving an existing profile', async () => {
    const mockUserId = 'usr_ohm_123';
    const existingId = '33333333-3333-4333-8333-333333333333';

    const existingProfile: UserProfile = {
      id: existingId,
      name: 'Dad',
      relationship: 'Father',
      allergens: [
        {
          allergenId: 'shellfish',
          allergenName: 'Shellfish',
          severity: 'AVOID',
        },
      ],
      customAllergens: [],
      sharedKitchenNotes: [],
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    };

    let upsertPayload: any = null;
    let deletedProfileId: string | null = null;
    let insertedAllergens: any[] = [];

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          upsert: vi.fn().mockImplementation((payload: any) => {
            upsertPayload = payload;
            return Promise.resolve({ error: null });
          }),
        };
      }
      if (table === 'profile_allergens') {
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === 'profile_id') deletedProfileId = val;
            return Promise.resolve({ error: null });
          }),
          insert: vi.fn().mockImplementation((rows: any[]) => {
            insertedAllergens = rows;
            return Promise.resolve({ error: null });
          }),
        };
      }
      return {};
    });

    const saved = await saveSupabaseProfile(mockUserId, existingProfile);

    expect(saved.id).toBe(existingId);
    expect(upsertPayload.id).toBe(existingId);
    expect(upsertPayload.user_id).toBe(mockUserId);
    expect(deletedProfileId).toBe(existingId);
    expect(insertedAllergens).toHaveLength(1);
    expect(insertedAllergens[0].profile_id).toBe(existingId);
    expect(insertedAllergens[0].allergen_id).toBe('shellfish');
  });

  it('generates a new UUID when saving a new profile with empty or non-uuid id', async () => {
    const mockUserId = 'usr_ohm_123';

    const newProfile: UserProfile = {
      id: '',
      name: 'Sister',
      relationship: 'Sister',
      allergens: [],
      customAllergens: [],
      sharedKitchenNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let upsertPayload: any = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          upsert: vi.fn().mockImplementation((payload: any) => {
            upsertPayload = payload;
            return Promise.resolve({ error: null });
          }),
        };
      }
      if (table === 'profile_allergens') {
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const saved = await saveSupabaseProfile(mockUserId, newProfile);

    expect(saved.id).not.toBe('');
    expect(saved.id).not.toBe(mockUserId);
    expect(saved.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(upsertPayload.id).toBe(saved.id);
    expect(upsertPayload.user_id).toBe(mockUserId);
  });

  it('deletes by profileId, NOT by auth userId', async () => {
    const targetProfileId = '44444444-4444-4444-8444-444444444444';

    let deletedAllergensForProfileId: string | null = null;
    let deletedProfileId: string | null = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === 'id') deletedProfileId = val;
            return Promise.resolve({ error: null });
          }),
        };
      }
      if (table === 'profile_allergens') {
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === 'profile_id') deletedAllergensForProfileId = val;
            return Promise.resolve({ error: null });
          }),
        };
      }
      return {};
    });

    await deleteSupabaseProfile(targetProfileId);

    expect(deletedAllergensForProfileId).toBe(targetProfileId);
    expect(deletedProfileId).toBe(targetProfileId);
  });

  it('uses update().eq("id", profile.id) for existing profiles and insert({ id, user_id }) for new profiles', async () => {
    const mockUserId = 'usr_ohm_123';
    const existingId = '55555555-5555-4555-8555-555555555555';
    let updatedPayload: any = null;
    let updatedEqCol: string | null = null;
    let updatedEqVal: string | null = null;
    let insertedPayload: any = null;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === 'id' && val === existingId) {
              return {
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: existingId } }),
              };
            }
            return {
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            };
          }),
          update: vi.fn().mockImplementation((payload: any) => {
            updatedPayload = payload;
            return {
              eq: vi.fn().mockImplementation((col: string, val: string) => {
                updatedEqCol = col;
                updatedEqVal = val;
                return Promise.resolve({ error: null });
              }),
            };
          }),
          insert: vi.fn().mockImplementation((payload: any) => {
            insertedPayload = payload;
            return Promise.resolve({ error: null });
          }),
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'profile_allergens') {
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    // 1. Update existing profile (Dad)
    const existingDad: UserProfile = {
      id: existingId,
      name: 'Dad',
      relationship: 'Father',
      allergens: [],
      customAllergens: [],
      sharedKitchenNotes: [],
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    };
    await saveSupabaseProfile(mockUserId, existingDad);

    expect(updatedPayload).not.toBeNull();
    expect(updatedPayload.name).toBe('Dad');
    expect(updatedEqCol).toBe('id');
    expect(updatedEqVal).toBe(existingId);

    // 2. Insert new profile (Mom)
    const newMom: UserProfile = {
      id: crypto.randomUUID(),
      name: 'Mom',
      relationship: 'Mother',
      allergens: [],
      customAllergens: [],
      sharedKitchenNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveSupabaseProfile(mockUserId, newMom);

    expect(insertedPayload).not.toBeNull();
    expect(insertedPayload.name).toBe('Mom');
    expect(insertedPayload.user_id).toBe(mockUserId);
    expect(insertedPayload.id).toBe(newMom.id);
  });

  it('correctly handles sequential creation of OHM, Mom, and Dad under the same user without collision', async () => {
    const mockUserId = 'auth_user_ohm_999';
    const store: Record<string, any> = {};

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          upsert: vi.fn().mockImplementation((payload: any) => {
            store[payload.id] = payload;
            return Promise.resolve({ error: null });
          }),
        };
      }
      if (table === 'profile_allergens') {
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    // 1. Create OHM
    const ohmProfile: UserProfile = {
      id: crypto.randomUUID(),
      name: 'OHM',
      relationship: 'Self',
      allergens: [
        { allergenId: 'shellfish', allergenName: 'Shellfish', severity: 'AVOID' },
        { allergenId: 'sesame', allergenName: 'Sesame', severity: 'AVOID' },
      ],
      customAllergens: [],
      sharedKitchenNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const savedOhm = await saveSupabaseProfile(mockUserId, ohmProfile);

    // 2. Create Mom with blank new profile state (id generated anew)
    const momProfile: UserProfile = {
      id: crypto.randomUUID(),
      name: 'Mom',
      relationship: 'Self',
      allergens: [
        { allergenId: 'peanuts', allergenName: 'Peanuts', severity: 'LIFE_THREATENING' },
      ],
      customAllergens: [],
      sharedKitchenNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const savedMom = await saveSupabaseProfile(mockUserId, momProfile);

    // 3. Create Dad with blank new profile state
    const dadProfile: UserProfile = {
      id: crypto.randomUUID(),
      name: 'Dad',
      relationship: 'Self',
      allergens: [],
      customAllergens: [],
      sharedKitchenNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const savedDad = await saveSupabaseProfile(mockUserId, dadProfile);

    // All three exist as distinct entities
    expect(Object.keys(store)).toHaveLength(3);
    expect(store[savedOhm.id].name).toBe('OHM');
    expect(store[savedMom.id].name).toBe('Mom');
    expect(store[savedDad.id].name).toBe('Dad');
    expect(store[savedOhm.id].user_id).toBe(mockUserId);
    expect(store[savedMom.id].user_id).toBe(mockUserId);
    expect(store[savedDad.id].user_id).toBe(mockUserId);
    expect(savedOhm.id).not.toBe(savedMom.id);
    expect(savedMom.id).not.toBe(savedDad.id);
  });
});
