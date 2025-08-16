import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { withLazyLoading } from '@/lib/performance';
import { LandingPageLoader, DashboardLoader } from '@/components/ui/UnifiedLoader';
import './index.css';

// Lazy load components for better performance
const LandingPage = withLazyLoading(() => import('@/components/layout/LandingPage'));
const Dashboard = withLazyLoading(() => import('@/components/layout/Dashboard'));
const OnboardingPage = withLazyLoading(() => import('@/components/layout/OnboardingPage'));
const OAuthCallback = withLazyLoading(() => import('@/components/OAuthCallback'));
const LeetCodeOnboardingModal = withLazyLoading(() => import('@/components/ui/LeetCodeOnboardingModal'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showDashboardLoader, setShowDashboardLoader] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setShowDashboardLoader(true);
      // Show dashboard loader for a brief moment before showing dashboard
      const timer = setTimeout(() => {
        setShowDashboardLoader(false);
      }, 2000); // Show for 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading]);
  
  if (loading) {
    return <DashboardLoader />;
  }

  if (showDashboardLoader) {
    return <DashboardLoader />;
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route Component with proper landing page loading
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showLandingLoader, setShowLandingLoader] = useState(true);
  
  // Show landing loader on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLandingLoader(false);
    }, 3000); // Show for 3 seconds on initial load
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading || showLandingLoader) {
    return <LandingPageLoader />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  const location = useLocation();
  
  // Determine which loader to show based on the current route
  const getFallbackLoader = () => {
    if (location.pathname === '/dashboard') {
      return <DashboardLoader />;
    }
    return <LandingPageLoader />;
  };

  return (
    <OAuthCallback>
      <Suspense fallback={getFallbackLoader()}>
        <Routes>
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={<OnboardingPage />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </OAuthCallback>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
