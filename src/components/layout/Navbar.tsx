import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, ChevronDown, Check, UserPlus } from 'lucide-react';
import { UserProfile } from '../../types/profile';

interface NavbarProps {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  onSelectProfile: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/profiles', label: 'Profiles' },
    { to: '/this-week', label: 'This Week' },
    { to: '/scanner', label: 'Scanner' },
    { to: '/grocery', label: 'Grocery' },
  ];

  const getProfileSummary = (p: UserProfile) => {
    if (!p.allergens || p.allergens.length === 0) return 'No allergies';
    return p.allergens.map((a) => a.allergenName).join(', ') + ' allergy';
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container/60">
      <div className="h-16 sm:h-20 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg sm:text-xl text-primary tracking-tight font-sans">
              SafePlate
            </span>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium hidden sm:inline leading-none">
              Allergy Safety Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low/70 p-1.5 rounded-xl border border-surface-container">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap select-none min-h-[38px] flex items-center ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Active Profile Dropdown Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container px-3 py-1.5 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30 cursor-pointer transition-all min-h-[44px]"
            aria-label="Household Member Selector"
            aria-expanded={dropdownOpen}
          >
            {activeProfile?.avatarUrl ? (
              <img
                src={activeProfile.avatarUrl}
                alt={activeProfile.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                {activeProfile ? activeProfile.name.slice(0, 2).toUpperCase() : 'HP'}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-none">
                {activeProfile ? activeProfile.name : 'Select Profile'}
              </span>
              <span className="text-[11px] text-on-surface-variant font-normal leading-tight truncate max-w-[120px]">
                {activeProfile ? getProfileSummary(activeProfile) : 'No active member'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />
          </button>

          {/* Profile Switcher Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/60 py-2 z-40 animate-scale-up">
                <div className="px-4 py-2 border-b border-surface-container">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                    Active Household Member
                  </span>
                  <p className="text-xs text-on-surface-variant/80 mt-0.5">
                    SafePlate filters all recipes & groceries for the active person.
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {profiles.map((p) => {
                    const isSelected = p.id === activeProfile?.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectProfile(p.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.avatarUrl ? (
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-sm text-on-surface block truncate">
                              {p.name} {p.relationship && `(${p.relationship})`}
                            </span>
                            <span className="text-xs text-on-surface-variant block truncate">
                              {getProfileSummary(p)}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-surface-container px-2">
                  <Link
                    to="/profiles"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Manage or Add Profiles</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
