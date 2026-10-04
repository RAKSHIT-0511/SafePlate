import React, { useState } from 'react';
import { UserProfile } from '../../types/profile';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileEditor } from '../../components/profile/ProfileEditor';
import { UserPlus, Shield, Users } from 'lucide-react';

interface ProfilesPageProps {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfilesPage: React.FC<ProfilesPageProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(activeProfile);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setEditingProfile(null);
  };

  const handleSave = (saved: UserProfile) => {
    onSaveProfile(saved);
    setIsCreatingNew(false);
    setEditingProfile(saved);
  };

  const handleDelete = (id: string) => {
    onDeleteProfile(id);
    setIsCreatingNew(false);
    setEditingProfile(null);
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
                  }}
                  onEdit={() => {
                    setEditingProfile(p);
                    setIsCreatingNew(false);
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
              initialProfile={null}
              onSave={handleSave}
              onCancel={() => {
                setIsCreatingNew(false);
                setEditingProfile(activeProfile);
              }}
            />
          ) : editingProfile ? (
            <ProfileEditor
              key={editingProfile.id}
              initialProfile={editingProfile}
              onSave={handleSave}
              onCancel={() => setEditingProfile(activeProfile)}
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
