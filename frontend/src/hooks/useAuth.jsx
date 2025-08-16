import { useApp } from '@/contexts/AppContext';

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
