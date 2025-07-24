import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { useAuth } from '@/hooks/useAuth';
import { withLazyLoading } from '@/lib/performance';
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  return (
    <OAuthCallback>
      <ConnectionStatus />
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
