import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { UserProfile } from '../../types/profile';
import { User } from '@supabase/supabase-js';

interface LayoutProps {
  children: React.ReactNode;
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  onSelectProfile: (id: string) => void;
  user?: User | null;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  profiles,
  activeProfile,
  onSelectProfile,
  user,
  onLogout,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Navbar
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={onSelectProfile}
        user={user}
        onLogout={onLogout}
      />
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-8">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};
