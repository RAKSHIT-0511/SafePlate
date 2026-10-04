import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../types/profile';
import {
  cleanupLegacyDemoProfiles,
  getActiveProfileId,
  setActiveProfileId,
} from '../storage/profileRepository';
import {
  getSupabaseProfiles,
  saveSupabaseProfile,
  deleteSupabaseProfile,
} from '../storage/supabaseProfileRepository';

export function useProfiles(user?: User | null) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCleanedLegacy = useRef(false);

  useEffect(() => {
    // Run safe one-time legacy cleanup for demo profiles in IndexedDB
    if (!hasCleanedLegacy.current) {
      hasCleanedLegacy.current = true;
      cleanupLegacyDemoProfiles().catch((err) =>
        console.warn('Legacy demo cleanup error:', err)
      );
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (user && user.id) {
        // Authenticated Supabase user mode: fetch ALL household profiles
        let supabaseProfiles: UserProfile[] = [];
        try {
          supabaseProfiles = await getSupabaseProfiles(user.id);
        } catch (supaErr: any) {
          console.warn('Could not load profiles from Supabase:', supaErr.message);
        }

        setProfiles(supabaseProfiles);

        if (supabaseProfiles.length > 0) {
          const savedActiveId = await getActiveProfileId();
          let targetActiveId: string | null = null;

          if (savedActiveId && supabaseProfiles.some((p) => p.id === savedActiveId)) {
            targetActiveId = savedActiveId;
          } else {
            const selfProfile = supabaseProfiles.find((p) => p.relationship === 'Self');
            targetActiveId = selfProfile ? selfProfile.id : supabaseProfiles[0].id;
          }

          setActiveProfileIdState(targetActiveId);
          if (targetActiveId) {
            await setActiveProfileId(targetActiveId);
          }
        } else {
          setActiveProfileIdState(null);
          await setActiveProfileId(null);
        }
      } else {
        // Unauthenticated state: strictly empty
        setProfiles([]);
        setActiveProfileIdState(null);
      }
    } catch (err: any) {
      console.error('Failed to load profiles:', err);
      setError('Could not access storage for profiles.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const selectActiveProfile = async (id: string) => {
    setActiveProfileIdState(id);
    await setActiveProfileId(id);
  };

  const handleSaveProfile = async (profile: UserProfile, isNew?: boolean): Promise<UserProfile> => {
    console.log("[CREATE DEBUG] useProfiles handleSave called", profile, isNew);
    try {
      if (user && user.id) {
        // Save directly to Supabase public.profiles and public.profile_allergens
        const saved = await saveSupabaseProfile(user.id, profile, isNew);
        console.log('[useProfiles] saveSupabaseProfile finished with saved id:', saved.id);

        // Optimistically update/append in local state
        setProfiles((prev) => {
          const exists = prev.some((p) => p.id === saved.id);
          if (exists) {
            return prev.map((p) => (p.id === saved.id ? saved : p));
          } else {
            return [...prev, saved];
          }
        });

        setActiveProfileIdState(saved.id);
        await setActiveProfileId(saved.id);

        // Immediately fetch ALL profiles for the current user again from Supabase
        const freshProfiles = await getSupabaseProfiles(user.id);
        console.log('[useProfiles] freshProfiles fetched from Supabase:', freshProfiles.length, freshProfiles);
        setProfiles(freshProfiles);

        return saved;
      }
      throw new Error('User is not authenticated');
    } catch (err: any) {
      console.error('PROFILE SAVE ERROR:', err);
      setError(err.message || 'Could not save profile.');
      throw err;
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      if (user && user.id) {
        await deleteSupabaseProfile(id);

        setProfiles((prev) => {
          const remaining = prev.filter((p) => p.id !== id);

          // If the active profile was deleted, pick another remaining profile
          if (activeProfileId === id) {
            const nextActive =
              remaining.find((p) => p.relationship === 'Self') || remaining[0] || null;
            const nextId = nextActive ? nextActive.id : null;
            setActiveProfileIdState(nextId);
            setActiveProfileId(nextId).catch(() => {});
          }

          return remaining;
        });

        // Immediately fetch ALL profiles for the current user again from Supabase
        try {
          const freshProfiles = await getSupabaseProfiles(user.id);
          setProfiles(freshProfiles);
        } catch (fetchErr) {
          console.warn('Could not reload fresh profiles after delete:', fetchErr);
        }
      }
    } catch (err: any) {
      console.error('Failed to delete profile:', err);
      setError(err.message || 'Could not delete profile.');
      throw err;
    }
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
