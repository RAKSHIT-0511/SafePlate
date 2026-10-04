import { supabase } from '../lib/supabase';
import { UserProfile, DEFAULT_AVATARS } from '../types/profile';
import { AllergenRule, AllergenSeverity } from '../safety/types';

/**
 * Fetch all household profiles belonging to the authenticated user from Supabase,
 * including all associated allergens.
 */
export async function getSupabaseProfiles(userId: string): Promise<UserProfile[]> {
  const { data: profileRows, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (profilesError) {
    console.error('Error fetching household profiles from Supabase:', profilesError.message);
    throw profilesError;
  }

  if (!profileRows || profileRows.length === 0) {
    return [];
  }

  const profileIds = profileRows.map((r) => r.id);

  // Fetch all associated allergen rules for all returned profiles
  const { data: allergensData, error: allergensError } = await supabase
    .from('profile_allergens')
    .select('profile_id, allergen_id, allergen_name, severity')
    .in('profile_id', profileIds);

  if (allergensError) {
    console.error('Error fetching profile allergens from Supabase:', allergensError.message);
    throw allergensError;
  }

  const allergensByProfileId = new Map<string, AllergenRule[]>();
  for (const row of allergensData || []) {
    const list = allergensByProfileId.get(row.profile_id) || [];
    list.push({
      allergenId: row.allergen_id,
      allergenName: row.allergen_name,
      severity: row.severity as AllergenSeverity,
    });
    allergensByProfileId.set(row.profile_id, list);
  }

  return profileRows.map((profileRow) => {
    const allergens = allergensByProfileId.get(profileRow.id) || [];
    const customAllergens: string[] = Array.isArray(profileRow.custom_allergens)
      ? profileRow.custom_allergens
      : [];
    const sharedKitchenNotes: string[] = Array.isArray(profileRow.shared_kitchen_notes)
      ? profileRow.shared_kitchen_notes
      : [];

    return {
      id: profileRow.id,
      name: profileRow.name || '',
      relationship: profileRow.relationship || 'Self',
      avatarUrl: profileRow.avatar_url || DEFAULT_AVATARS[0],
      allergens,
      customAllergens,
      sharedKitchenNotes,
      createdAt: profileRow.created_at || new Date().toISOString(),
      updatedAt: profileRow.updated_at || new Date().toISOString(),
    };
  });
}

/**
 * Create or update a household profile and its allergens in Supabase.
 * - Preserves profile.id if present and valid UUID.
 * - Generates a new UUID with crypto.randomUUID() for new profiles.
 * - Sets user_id to the authenticated account's userId.
 */
export async function saveSupabaseProfile(
  userId: string,
  profile: UserProfile,
  isNew?: boolean
): Promise<UserProfile> {
  console.log("[CREATE DEBUG] saveSupabaseProfile called", {
    userId,
    profile,
    isNew
  });

  const isUuid = (str?: string) =>
    str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;

  const hasValidId = isUuid(profile.id);
  const profileId = hasValidId ? profile.id : crypto.randomUUID();

  // If isNew was not explicitly provided, determine by checking existence in database
  let shouldInsert = isNew;
  if (shouldInsert === undefined) {
    if (!profile.id || !hasValidId) {
      shouldInsert = true;
    } else {
      try {
        const { data: existingRow, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', profile.id)
          .eq('user_id', userId)
          .maybeSingle();

        shouldInsert = Boolean(checkError || !existingRow);
      } catch {
        shouldInsert = true;
      }
    }
  }

  const avatarUrl = profile.avatarUrl || (profile as any).avatar_url || null;
  const customAllergens = profile.customAllergens || (profile as any).custom_allergens || [];
  const sharedKitchenNotes = profile.sharedKitchenNotes || (profile as any).shared_kitchen_notes || [];

  if (shouldInsert) {
    console.log('[supabaseProfileRepository] Executing INSERT into profiles:', {
      id: profileId,
      user_id: userId,
      name: profile.name.trim(),
    });

    const builder = supabase.from('profiles');
    if (typeof (builder as any).insert === 'function') {
      const { error: insertError } = await (builder as any).insert({
        id: profileId,
        user_id: userId,
        name: profile.name.trim(),
        relationship: profile.relationship || 'Self',
        avatar_url: avatarUrl,
        custom_allergens: customAllergens,
        shared_kitchen_notes: sharedKitchenNotes,
      });

      if (insertError) {
        console.error('PROFILE SAVE ERROR:', insertError);
        throw insertError;
      }
    } else if (typeof (builder as any).upsert === 'function') {
      const { error: upsertErr } = await (builder as any).upsert({
        id: profileId,
        user_id: userId,
        name: profile.name.trim(),
        relationship: profile.relationship || 'Self',
        avatar_url: avatarUrl,
        custom_allergens: customAllergens,
        shared_kitchen_notes: sharedKitchenNotes,
      });
      if (upsertErr) {
        console.error('PROFILE SAVE ERROR:', upsertErr);
        throw upsertErr;
      }
    }
  } else {
    console.log('[supabaseProfileRepository] Executing UPDATE profiles:', {
      id: profile.id,
      user_id: userId,
      name: profile.name.trim(),
    });

    const builder = supabase.from('profiles');
    if (typeof (builder as any).update === 'function') {
      const updateQuery = (builder as any).update({
        name: profile.name.trim(),
        relationship: profile.relationship || 'Self',
        avatar_url: avatarUrl,
        custom_allergens: customAllergens,
        shared_kitchen_notes: sharedKitchenNotes,
        updated_at: new Date().toISOString(),
      });

      let queryWithId = updateQuery.eq('id', profile.id);
      if (typeof queryWithId?.eq === 'function') {
        queryWithId = queryWithId.eq('user_id', userId);
      }
      const { error: updateError } = await queryWithId;

      if (updateError) {
        console.error('PROFILE SAVE ERROR:', updateError);
        throw updateError;
      }
    } else if (typeof (builder as any).upsert === 'function') {
      const { error: upsertErr } = await (builder as any).upsert({
        id: profile.id,
        user_id: userId,
        name: profile.name.trim(),
        relationship: profile.relationship || 'Self',
        avatar_url: avatarUrl,
        custom_allergens: customAllergens,
        shared_kitchen_notes: sharedKitchenNotes,
        updated_at: new Date().toISOString(),
      });
      if (upsertErr) {
        console.error('PROFILE SAVE ERROR:', upsertErr);
        throw upsertErr;
      }
    }
  }

  // Sync profile_allergens
  const { error: deleteError } = await supabase
    .from('profile_allergens')
    .delete()
    .eq('profile_id', profileId);

  if (deleteError) {
    console.error('PROFILE SAVE ERROR (delete profile_allergens):', deleteError);
    throw deleteError;
  }

  if (profile.allergens && profile.allergens.length > 0) {
    const allergenRows = profile.allergens.map((alg) => ({
      profile_id: profileId,
      allergen_id: alg.allergenId,
      allergen_name: alg.allergenName,
      severity: alg.severity,
    }));

    const { error: insertAllergensError } = await supabase
      .from('profile_allergens')
      .insert(allergenRows);

    if (insertAllergensError) {
      console.error('PROFILE SAVE ERROR (insert profile_allergens):', insertAllergensError);
      throw insertAllergensError;
    }
  }

  return {
    ...profile,
    id: profileId,
    avatarUrl: avatarUrl || undefined,
    customAllergens,
    sharedKitchenNotes,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete a specific household profile and its allergens from Supabase.
 * Uses profileId, NOT auth user ID.
 */
export async function deleteSupabaseProfile(profileId: string): Promise<void> {
  // Delete allergens first
  const { error: allergensError } = await supabase
    .from('profile_allergens')
    .delete()
    .eq('profile_id', profileId);

  if (allergensError) {
    console.error('Error deleting profile allergens from Supabase:', allergensError.message);
    throw allergensError;
  }

  // Delete profile record by profileId
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId);

  if (profileError) {
    console.error('Error deleting profile from Supabase:', profileError.message);
    throw profileError;
  }
}
