import { getDatabase } from './db';
import { UserProfile } from '../types/profile';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'profile_maya',
    name: 'Maya',
    relationship: 'Roommate',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    allergens: [
      {
        allergenId: 'peanut',
        allergenName: 'Peanut',
        severity: 'LIFE_THREATENING',
      },
      {
        allergenId: 'dairy',
        allergenName: 'Dairy',
        severity: 'AVOID',
      },
    ],
    customAllergens: [],
    sharedKitchenNotes: [
      'Dedicated toaster slot for nut-free breads',
      'Green cutting board reserved for Maya',
      'Dedicated dishwashing sponge in separate caddy',
    ],
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-10-04T12:00:00.000Z',
  },
  {
    id: 'profile_alex',
    name: 'Alex',
    relationship: 'Self',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    allergens: [],
    customAllergens: [],
    sharedKitchenNotes: ['Wipes down food prep areas after cooking with dairy'],
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 'profile_sam',
    name: 'Sam',
    relationship: 'Frequent Guest',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    allergens: [
      {
        allergenId: 'gluten',
        allergenName: 'Gluten',
        severity: 'TRACE_OK',
      },
    ],
    customAllergens: [],
    sharedKitchenNotes: ['Visits alternate weekends'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-20T12:00:00.000Z',
  },
];

export async function getAllProfiles(): Promise<UserProfile[]> {
  const db = await getDatabase();
  const profiles = await db.getAll('profiles');

  if (profiles.length === 0) {
    // Seed initial profiles
    const tx = db.transaction('profiles', 'readwrite');
    for (const p of INITIAL_PROFILES) {
      await tx.store.put(p);
    }
    await tx.done;
    return INITIAL_PROFILES;
  }

  return profiles;
}

export async function getProfileById(id: string): Promise<UserProfile | undefined> {
  const db = await getDatabase();
  return db.get('profiles', id);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDatabase();
  profile.updatedAt = new Date().toISOString();
  await db.put('profiles', profile);
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('profiles', id);
}

export async function getActiveProfileId(): Promise<string | null> {
  const db = await getDatabase();
  const record = await db.get('preferences', 'active_profile_id');
  if (record) {
    return record.value;
  }
  // Default to Maya
  return 'profile_maya';
}

export async function setActiveProfileId(id: string): Promise<void> {
  const db = await getDatabase();
  await db.put('preferences', { key: 'active_profile_id', value: id });
}
