import { getDatabase } from './db';
import { UserProfile } from '../types/profile';

/**
 * Safely removes legacy demo profile IDs from IndexedDB if they exist.
 * Only removes exact legacy IDs ('profile_maya', 'profile_alex', 'profile_sam').
 * Does not delete any other IndexedDB data, meal plans, grocery items, or preferences.
 */
export async function cleanupLegacyDemoProfiles(): Promise<void> {
  try {
    const db = await getDatabase();
    const legacyIds = ['profile_maya', 'profile_alex', 'profile_sam'];
    const tx = db.transaction('profiles', 'readwrite');
    for (const id of legacyIds) {
      await tx.store.delete(id);
    }
    await tx.done;

    // If active_profile_id preference was left pointing to a legacy demo ID, remove it
    const activePref = await db.get('preferences', 'active_profile_id');
    if (activePref && legacyIds.includes(activePref.value)) {
      await db.delete('preferences', 'active_profile_id');
    }
  } catch (err) {
    console.warn('Could not clean up legacy demo profiles from IndexedDB:', err);
  }
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const db = await getDatabase();
  return db.getAll('profiles');
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
  if (record && typeof record.value === 'string') {
    if (!['profile_maya', 'profile_alex', 'profile_sam'].includes(record.value)) {
      return record.value;
    }
  }
  return null;
}

export async function setActiveProfileId(id: string | null): Promise<void> {
  const db = await getDatabase();
  if (id) {
    await db.put('preferences', { key: 'active_profile_id', value: id });
  } else {
    await db.delete('preferences', 'active_profile_id');
  }
}
