import React from 'react';
import { UserProfile } from '../../types/profile';
import { SeverityBadge } from '../common/SeverityBadge';
import { Check, Edit3 } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isActive,
  onSelect,
  onEdit,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer border select-none ${
        isActive
          ? 'bg-surface-container-lowest border-primary shadow-lg ring-2 ring-primary/40'
          : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/50 shadow-sm hover:shadow-md'
      }`}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-surface-container"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base">
                {profile.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            {isActive && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-on-surface">{profile.name}</h3>
              {profile.relationship && (
                <span className="text-xs text-on-surface-variant font-medium">
                  ({profile.relationship})
                </span>
              )}
            </div>
            {isActive ? (
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Active Safety Filter
              </span>
            ) : (
              <span className="text-xs text-on-surface-variant mt-0.5 block">
                Tap to set as active filter
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
          title="Edit Profile"
          aria-label={`Edit ${profile.name}`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Allergens List */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.allergens.length === 0 ? (
          <span className="text-xs text-on-surface-variant/80 italic py-0.5">
            No known allergy restrictions
          </span>
        ) : (
          profile.allergens.map((rule) => (
            <SeverityBadge
              key={rule.allergenId}
              severity={rule.severity}
              label={rule.allergenName}
              className="text-[11px]"
            />
          ))
        )}
      </div>

      {/* Shared Kitchen Protocol Tag */}
      {profile.sharedKitchenNotes && profile.sharedKitchenNotes.length > 0 && (
        <div className="mt-3 pt-2 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
          <span className="truncate max-w-[200px]">
            {profile.sharedKitchenNotes[0]}
          </span>
          <span className="font-medium text-primary shrink-0 ml-2">
            {profile.allergens.length} active triggers
          </span>
        </div>
      )}
    </div>
  );
};
