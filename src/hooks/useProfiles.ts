import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/profile';
import {
  getAllProfiles,
  saveProfile,
  deleteProfile as deleteProfileFromDb,
  getActiveProfileId,
  setActiveProfileId as setActiveProfileIdInDb,
} from '../storage/profileRepository';

export function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const all = await getAllProfiles();
      setProfiles(all);

      let activeId = await getActiveProfileId();
      if (!activeId || !all.some((p) => p.id === activeId)) {
        activeId = all.length > 0 ? all[0].id : null;
        if (activeId) await setActiveProfileIdInDb(activeId);
      }
      setActiveProfileIdState(activeId);
    } catch (err: any) {
      console.error('Failed to load profiles from IndexedDB:', err);
      setError('Could not access local storage for profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const selectActiveProfile = async (id: string) => {
    setActiveProfileIdState(id);
    await setActiveProfileIdInDb(id);
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    await saveProfile(profile);
    await loadProfiles();
  };

  const handleDeleteProfile = async (id: string) => {
    await deleteProfileFromDb(id);
    if (activeProfileId === id) {
      const remaining = profiles.filter((p) => p.id !== id);
      const newActive = remaining.length > 0 ? remaining[0].id : null;
      if (newActive) await selectActiveProfile(newActive);
    }
    await loadProfiles();
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;

  return {
    profiles,
    activeProfile,
    activeProfileId,
    loading,
    error,
    selectActiveProfile,
    saveProfile: handleSaveProfile,
    deleteProfile: handleDeleteProfile,
    refreshProfiles: loadProfiles,
  };
}
