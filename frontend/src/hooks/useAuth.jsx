import { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

// Create a simple auth wrapper that bridges to the main AppContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // This is a simplified auth provider that works with our AppContext
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const { state, actions } = useApp();
  
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    oauthPending: state.oauthPending,
    login: actions.login,
    register: actions.register,
    logout: actions.logout,
    initiateGoogleAuth: actions.initiateGoogleAuth,
    initiateGitHubAuth: actions.initiateGitHubAuth,
    checkOAuthCallback: actions.checkOAuthCallback,
    completeOAuthOnboarding: actions.completeOAuthOnboarding,
    initializeAuth: actions.initializeAuth,
    error: state.error
  };
};
