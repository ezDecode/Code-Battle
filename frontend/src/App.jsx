import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import LandingPage from '@/components/layout/LandingPage';
import Dashboard from '@/components/layout/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import './index.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? <Dashboard /> : <LandingPage />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
