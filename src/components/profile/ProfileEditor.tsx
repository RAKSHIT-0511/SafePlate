import React, { useState } from 'react';
import { UserProfile, DEFAULT_AVATARS } from '../../types/profile';
import { AllergenRule, AllergenSeverity } from '../../safety/types';
import { INITIAL_ALLERGENS_LIST } from '../../data/allergens';
import { Check, AlertTriangle, ShieldCheck, ShieldAlert, Plus, X, UserCheck } from 'lucide-react';

interface ProfileEditorProps {
  initialProfile?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  initialProfile,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(
    initialProfile?.avatarUrl || DEFAULT_AVATARS[0]
  );
  const [allergens, setAllergens] = useState<AllergenRule[]>(
    initialProfile?.allergens || []
  );
  const [customInput, setCustomInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Toggle allergen chip on/off
  const toggleAllergen = (id: string, allergenName: string) => {
    const existing = allergens.find(
      (a) => a.allergenId.toLowerCase() === id.toLowerCase()
    );

    if (existing) {
      setAllergens((prev) => prev.filter((a) => a.allergenId.toLowerCase() !== id.toLowerCase()));
    } else {
      setAllergens((prev) => [
        ...prev,
        {
          allergenId: id,
          allergenName,
          severity: 'AVOID', // Sensible default
        },
      ]);
    }
  };

  const handleSeverityChange = (allergenId: string, severity: AllergenSeverity) => {
    setAllergens((prev) =>
      prev.map((a) =>
        a.allergenId.toLowerCase() === allergenId.toLowerCase() ? { ...a, severity } : a
      )
    );
  };

  // Quick helper to apply a severity across all selected allergens
  const handleSetAllSeverities = (severity: AllergenSeverity) => {
    setAllergens((prev) => prev.map((a) => ({ ...a, severity })));
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    if (allergens.some((a) => a.allergenName.toLowerCase() === lower)) {
      setCustomInput('');
      return;
    }

    setAllergens((prev) => [
      ...prev,
      {
        allergenId: `custom_${Date.now()}`,
        allergenName: trimmed,
        severity: 'AVOID',
        isCustom: true,
      },
    ]);
    setCustomInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for this profile.');
      return;
    }

    const updated: UserProfile = {
      id: initialProfile?.id || `profile_${Date.now()}`,
      name: name.trim(),
      relationship: initialProfile?.relationship || 'Member',
      avatarUrl,
      allergens,
      customAllergens: allergens.filter((a) => a.isCustom).map((a) => a.allergenName),
      sharedKitchenNotes: initialProfile?.sharedKitchenNotes || ['Separate food prep utensils'],
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest p-5 sm:p-7 rounded-2xl shadow-tactile border border-outline-variant/40 flex flex-col gap-6 animate-scale-up"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-container">
        <div>
          <h2 className="text-lg font-black text-on-surface">
            {initialProfile ? `Edit ${initialProfile.name}` : 'Create Household Profile'}
          </h2>
          <p className="text-xs text-on-surface-variant">
            Select allergies and severity levels to safeguard this member.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {DEFAULT_AVATARS.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAvatarUrl(url)}
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                avatarUrl === url
                  ? 'border-primary scale-110 shadow-sm ring-2 ring-primary/30'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              title={`Choose avatar ${i + 1}`}
            >
              <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* 1. SIMPLE INPUT: NAME */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="p_name" className="text-xs font-bold text-on-surface uppercase tracking-wider">
          Name
        </label>
        <input
          id="p_name"
          type="text"
          required
          autoFocus={!initialProfile}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. Maya"
          className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-bold text-base border border-outline-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
        />
        {error && <span className="text-xs text-error font-bold">{error}</span>}
      </div>

      {/* 2. SELECTABLE ALLERGEN CHIPS */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Select Allergies
          </label>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {allergens.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {INITIAL_ALLERGENS_LIST.map((alg) => {
            const isSelected = allergens.some(
              (a) => a.allergenId.toLowerCase() === alg.id.toLowerCase()
            );

            return (
              <button
                key={alg.id}
                type="button"
                onClick={() => toggleAllergen(alg.id, alg.name)}
                className={`h-11 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary-fixed'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/40'
                }`}
              >
                {isSelected ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-outline-variant" />
                )}
                <span>{alg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick add custom allergen */}
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
            placeholder="Add custom allergy (e.g. Avocado, Lupin)..."
            className="flex-1 h-10 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
          />
          <button
            type="button"
            onClick={() => handleAddCustom()}
            className="h-10 px-4 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 3. SEVERITY - 3 LARGE SELECTABLE OPTIONS */}
      {allergens.length > 0 && (
        <div className="flex flex-col gap-3 pt-4 border-t border-surface-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Choose Severity
            </span>
            {allergens.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="text-[11px] font-medium mr-1">Set all to:</span>
                <button
                  type="button"
                  onClick={() => handleSetAllSeverities('AVOID')}
                  className="px-2 py-0.5 rounded-md bg-secondary-fixed/40 text-secondary text-[11px] font-bold hover:bg-secondary-fixed transition-colors cursor-pointer"
                >
                  Avoid
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllSeverities('TRACE_OK')}
                  className="px-2 py-0.5 rounded-md bg-surface-container-high text-primary text-[11px] font-bold hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  Trace OK
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllSeverities('LIFE_THREATENING')}
                  className="px-2 py-0.5 rounded-md bg-error-container text-error text-[11px] font-bold hover:opacity-80 transition-colors cursor-pointer"
                >
                  Life-Threatening
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {allergens.map((alg) => (
              <div
                key={alg.allergenId}
                className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface">{alg.allergenName}</span>
                  <button
                    type="button"
                    onClick={() => toggleAllergen(alg.allergenId, alg.allergenName)}
                    className="text-xs text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* 3 LARGE SELECTABLE OPTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Avoid */}
                  <button
                    type="button"
                    onClick={() => handleSeverityChange(alg.allergenId, 'AVOID')}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-center min-h-[60px] border select-none active:scale-[0.98] ${
                      alg.severity === 'AVOID'
                        ? 'bg-secondary-fixed/50 border-secondary text-on-secondary-fixed ring-2 ring-secondary/50 font-bold shadow-sm'
                        : 'bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-secondary shrink-0" />
                        <span>Avoid</span>
                      </span>
                      {alg.severity === 'AVOID' && <Check className="w-4 h-4 text-secondary stroke-[3]" />}
                    </div>
                    <span className="text-[11px] opacity-80 mt-1">Direct intolerance</span>
                  </button>

                  {/* Trace OK */}
                  <button
                    type="button"
                    onClick={() => handleSeverityChange(alg.allergenId, 'TRACE_OK')}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-center min-h-[60px] border select-none active:scale-[0.98] ${
                      alg.severity === 'TRACE_OK'
                        ? 'bg-surface-container-highest border-primary text-primary ring-2 ring-primary/50 font-bold shadow-sm'
                        : 'bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        <span>Trace OK</span>
                      </span>
                      {alg.severity === 'TRACE_OK' && <Check className="w-4 h-4 text-primary stroke-[3]" />}
                    </div>
                    <span className="text-[11px] opacity-80 mt-1">Shared facility OK</span>
                  </button>

                  {/* Life-Threatening */}
                  <button
                    type="button"
                    onClick={() => handleSeverityChange(alg.allergenId, 'LIFE_THREATENING')}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-center min-h-[60px] border select-none active:scale-[0.98] ${
                      alg.severity === 'LIFE_THREATENING'
                        ? 'bg-error-container border-error text-error ring-2 ring-error/50 font-bold shadow-sm'
                        : 'bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-error">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Life-Threatening</span>
                      </span>
                      {alg.severity === 'LIFE_THREATENING' && <Check className="w-4 h-4 text-error stroke-[3]" />}
                    </div>
                    <span className="text-[11px] opacity-85 mt-1 text-on-error-container">Strict zero cross-contact</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONE OBVIOUS PRIMARY ACTION: [Create Profile] */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-surface-container">
        {initialProfile && onDelete ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete profile for ${initialProfile.name}?`)) {
                onDelete(initialProfile.id);
              }
            }}
            className="w-full sm:w-auto h-11 px-3 text-error hover:bg-error-container/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Delete Profile</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-initial h-12 px-5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-initial h-12 px-7 rounded-xl bg-primary hover:bg-tertiary text-on-primary text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            <span>{initialProfile ? 'Save Profile' : 'Create Profile'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
