import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfile } from '../../types/profile';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileEditor } from '../../components/profile/ProfileEditor';
import { UserPlus, Shield, Users } from 'lucide-react';

interface ProfilesPageProps {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: UserProfile, isNew?: boolean) => Promise<UserProfile | void> | void;
  onDeleteProfile: (id: string) => Promise<void> | void;
  onReloadProfiles?: () => Promise<void> | void;
}

export const ProfilesPage: React.FC<ProfilesPageProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
  onReloadProfiles,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldCreateNew = searchParams.get('new') === 'true';

  const [isCreatingNew, setIsCreatingNew] = useState(shouldCreateNew);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(
    shouldCreateNew ? null : (activeProfile || profiles[0] || null)
  );

  // If search param ?new=true changes, update state
  useEffect(() => {
    if (shouldCreateNew && !isCreatingNew) {
      console.log('[ProfilesPage] URL ?new=true detected. Activating create mode.');
      setIsCreatingNew(true);
      setEditingProfile(null);
    }
  }, [shouldCreateNew, isCreatingNew]);

  // If editingProfile was deleted from profiles list, clear it
  useEffect(() => {
    if (isCreatingNew) return;
    if (editingProfile && !profiles.some((p) => p.id === editingProfile.id)) {
      setEditingProfile(null);
    }
  }, [profiles, editingProfile, isCreatingNew]);

  const handleStartCreate = () => {
    console.log('[ProfilesPage] handleStartCreate clicked. Setting isCreatingNew = true, editingProfile = null');
    setEditingProfile(null);
    setIsCreatingNew(true);
    if (searchParams.get('new') !== 'true') {
      setSearchParams({ new: 'true' });
    }
  };

  const handleSave = async (saved: UserProfile, isNew?: boolean) => {
    console.log("[CREATE DEBUG] ProfilesPage handleSave called", saved, isNew);
    try {
      await onSaveProfile(saved, isNew);
      setEditingProfile(null);
      setIsCreatingNew(false);
      if (onReloadProfiles) {
        console.log('[ProfilesPage] Reloading fresh profiles...');
        await onReloadProfiles();
      }
      setSearchParams({});
      console.log('[ProfilesPage] handleSave completed successfully.');
    } catch (err) {
      console.error('[ProfilesPage] Failed to save profile:', err);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteProfile(id);
      setEditingProfile(null);
      setIsCreatingNew(false);
      if (onReloadProfiles) {
        await onReloadProfiles();
      }
      setSearchParams({});
    } catch (err) {
      console.error('Failed to delete profile from page:', err);
    }
  };

  const handleCancel = () => {
    setEditingProfile(null);
    setIsCreatingNew(false);
    setSearchParams({});
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Top Banner Context Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-low px-5 py-4 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-on-surface">
                Household Allergy Matrix
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live Sync
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Cross-referencing {profiles.length} member profiles across shared kitchen surfaces and
              meal plans.
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Household Directory */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="font-bold text-base text-on-surface">Household Profiles</h2>
              <p className="text-xs text-on-surface-variant">
                {profiles.length} registered members
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartCreate}
              className="h-11 px-4 rounded-xl bg-primary text-on-primary hover:bg-tertiary transition-all flex items-center gap-2 shadow-md text-xs sm:text-sm font-bold cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Profile</span>
            </button>
          </div>

          {/* Members Stack */}
          <div className="flex flex-col gap-3">
            {profiles.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/40">
                <p className="text-sm text-on-surface-variant">No profiles found.</p>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="mt-3 text-xs font-bold text-primary underline"
                >
                  Create your first profile
                </button>
              </div>
            ) : (
              profiles.map((p) => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  isActive={p.id === activeProfile?.id}
                  onSelect={() => {
                    onSelectProfile(p.id);
                    setIsCreatingNew(false);
                    setEditingProfile(p);
                    setSearchParams({});
                  }}
                  onEdit={() => {
                    setIsCreatingNew(false);
                    setEditingProfile(p);
                    setSearchParams({});
                  }}
                />
              ))
            )}
          </div>
        </aside>

        {/* Right Column: Profile Editor */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {isCreatingNew ? (
            <ProfileEditor
              key={isCreatingNew ? 'create-new' : editingProfile?.id ?? 'none'}
              initialProfile={null}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : editingProfile ? (
            <ProfileEditor
              key={isCreatingNew ? 'create-new' : editingProfile?.id ?? 'none'}
              initialProfile={editingProfile}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          ) : (
            <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/40 flex flex-col items-center justify-center gap-3">
              <Shield className="w-12 h-12 text-primary/40" />
              <h3 className="font-bold text-base text-on-surface">No Profile Selected</h3>
              <p className="text-xs text-on-surface-variant max-w-sm">
                Select a household member on the left to edit their allergies and severity thresholds,
                or create a new profile.
              </p>
              <button
                type="button"
                onClick={handleStartCreate}
                className="mt-2 h-10 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer active:scale-95"
              >
                Create Profile
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
