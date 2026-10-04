import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useProfiles } from './hooks/useProfiles';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/Home/HomePage';
import { ProfilesPage } from './pages/Profiles/ProfilesPage';
import { ThisWeekPage } from './pages/ThisWeek/ThisWeekPage';
import { ScannerPage } from './pages/Scanner/ScannerPage';
import { GroceryPage } from './pages/Grocery/GroceryPage';

export const App: React.FC = () => {
  const {
    profiles,
    activeProfile,
    loading,
    selectActiveProfile,
    saveProfile,
    deleteProfile,
  } = useProfiles();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-on-surface">Initializing SafePlate...</span>
        </div>
      </div>
    );
  }

  return (
    <Layout
      profiles={profiles}
      activeProfile={activeProfile}
      onSelectProfile={selectActiveProfile}
    >
      <Routes>
        <Route path="/" element={<HomePage activeProfile={activeProfile} />} />
        <Route
          path="/profiles"
          element={
            <ProfilesPage
              profiles={profiles}
              activeProfile={activeProfile}
              onSelectProfile={selectActiveProfile}
              onSaveProfile={saveProfile}
              onDeleteProfile={deleteProfile}
            />
          }
        />
        <Route path="/this-week" element={<ThisWeekPage activeProfile={activeProfile} />} />
        <Route path="/scanner" element={<ScannerPage activeProfile={activeProfile} />} />
        <Route path="/grocery" element={<GroceryPage activeProfile={activeProfile} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
