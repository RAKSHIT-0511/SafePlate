import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, CalendarDays, ScanText, ShoppingCart } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const tabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/profiles', label: 'Profiles', icon: Users },
    { to: '/this-week', label: 'Plan', icon: CalendarDays },
    { to: '/scanner', label: 'Scan', icon: ScanText },
    { to: '/grocery', label: 'Grocery', icon: ShoppingCart },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-container shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-2 py-1.5"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-xl py-1 px-2 transition-all select-none ${
                  isActive
                    ? 'text-primary font-bold scale-105'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
