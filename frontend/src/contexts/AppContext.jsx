import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';

// Initial state
const initialState = {
  // User state
  user: null,
  isAuthenticated: false,
  loading: false,
  oauthPending: false,
  
  // Dashboard data
  dailyChallenge: null,
  teamMembers: [],
  leaderboard: [],
  userStats: {
    problemsSolved: 0,
    successRate: 0,
    currentStreak: 0,
    weeklyProgress: 0,
    rank: 0,
    rating: 0,
    recentSolves: []
  },
  
  // UI state
  notifications: [],
  modals: {
    auth: false,
    teamDetails: false,
    leaderboard: false,
    notifications: false,
    leetcodeOnboarding: false
  },
  
  // Error handling
  error: null
};

// Action types
export const ActionTypes = {
  // Auth actions
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_OAUTH_PENDING: 'SET_OAUTH_PENDING',
  
  // Data actions
  FETCH_DATA_START: 'FETCH_DATA_START',
  FETCH_DATA_SUCCESS: 'FETCH_DATA_SUCCESS',
  FETCH_DATA_FAILURE: 'FETCH_DATA_FAILURE',
  
  // UI actions
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  
  // LeetCode sync
  SYNC_LEETCODE_START: 'SYNC_LEETCODE_START',
  SYNC_LEETCODE_SUCCESS: 'SYNC_LEETCODE_SUCCESS',
  SYNC_LEETCODE_FAILURE: 'SYNC_LEETCODE_FAILURE',
  
  // Clear errors
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
    case ActionTypes.FETCH_DATA_START:
    case ActionTypes.SYNC_LEETCODE_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null
      };
      
    case ActionTypes.LOGIN_FAILURE:
    case ActionTypes.FETCH_DATA_FAILURE:
    case ActionTypes.SYNC_LEETCODE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case ActionTypes.LOGOUT:
      return {
        ...initialState
      };
      
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
      
    case ActionTypes.SET_OAUTH_PENDING:
      return {
        ...state,
        oauthPending: action.payload
      };
      
    case ActionTypes.FETCH_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        dailyChallenge: action.payload.dailyChallenge,
        teamMembers: action.payload.teamMembers,
        leaderboard: action.payload.leaderboard,
        userStats: { ...state.userStats, ...action.payload.userStats },
        error: null
      };
      
    case ActionTypes.SYNC_LEETCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        user: { ...state.user, ...action.payload.user },
        userStats: { ...state.userStats, ...action.payload.stats },
        error: null
      };
      
    case ActionTypes.TOGGLE_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modal]: action.payload.isOpen
        }
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const hasInitializedRef = useRef(false);
  const hasFetchedDataRef = useRef(false);

  // Memoize the initialization function
  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('🔍 Found existing token, checking if valid...');
      try {
        const user = await api.auth.getCurrentUser();
        console.log('✅ Token is valid, logging in user:', user);
        dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: user });
      } catch (error) {
        console.log('❌ Token is invalid, removing...');
        // Clear the token from the api instance and localStorage
        localStorage.removeItem('authToken');
        api.token = null;
      }
    }
  }, [dispatch]);

  // Memoize the critical actions to prevent useEffect dependency issues
  const checkOAuthCallback = useCallback(async () => {
    try {
      console.log('🔍 Checking OAuth callback...');
      const result = api.auth.checkOAuthStatus();
      console.log('🔍 OAuth status result:', result);
      
      // If no OAuth parameters found or already processed, return early
      if (!result || !result.success) {
        console.log('❌ No valid OAuth parameters found or already processed');
        return false;
      }
      
      console.log('✅ OAuth successful, getting user data...');
      
      // Verify token was set correctly before proceeding
      if (!api.token) {
        console.error('❌ Token not found in API service after OAuth');
        throw new Error('Authentication token not properly set');
      }
      
      // Token was set, now get user data
      const user = await api.auth.getCurrentUser();
      console.log('👤 Current user:', user);
      
      // Check if user needs onboarding
      if (result.needsOnboarding) {
        console.log('📝 User needs onboarding');
        // Don't log in yet, let the onboarding modal handle it
        dispatch({ type: ActionTypes.SET_OAUTH_PENDING, payload: true });
        return { needsOnboarding: true, user };
      }
      
      console.log('🚀 Logging in user and redirecting to dashboard...');
      dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: user });
      
      // Add notification using the actions object (will be available after this function is defined)
      setTimeout(() => {
        actions.addNotification({
          type: 'success',
          message: `Welcome, ${user.displayName || user.name}!`,
          duration: 5000
        });
      }, 0);
      
      return { needsOnboarding: false, user };
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      // Clean up on error
      sessionStorage.removeItem('processedOAuthToken');
      sessionStorage.removeItem('oauthCallback');
      localStorage.removeItem('authToken');
      api.token = null;
      
      // Add notification using the actions object (will be available after this function is defined)
      setTimeout(() => {
        actions.addNotification({
          type: 'error',
          message: 'OAuth authentication failed. Please try again.',
          duration: 5000
        });
      }, 0);
      return false;
    }
  }, [dispatch]);

  // Memoize fetchDashboardData to prevent dependency issues
  const fetchDashboardData = useCallback(async () => {
    // Only fetch if authenticated and not currently loading
    if (!state.isAuthenticated || state.loading) {
      console.log('⚠️ Skipping dashboard data fetch - not authenticated or already loading');
      return;
    }
    
    dispatch({ type: ActionTypes.FETCH_DATA_START });
    try {
      const data = await api.dashboard.getData();
      dispatch({ type: ActionTypes.FETCH_DATA_SUCCESS, payload: data });
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      dispatch({ type: ActionTypes.FETCH_DATA_FAILURE, payload: error.message });
    }
  }, [dispatch]); // Remove unstable dependencies

  // Actions
  const actions = {
    // Auth actions
    login: async (credentials) => {
      dispatch({ type: ActionTypes.LOGIN_START });
      try {
        const user = await api.auth.login(credentials);
        dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: user });
        
        // Fetch initial data after login
        setTimeout(() => fetchDashboardData(), 100);
        
        actions.addNotification({
          type: 'success',
          message: `Welcome back, ${user.name}!`,
          duration: 5000
        });
      } catch (error) {
        dispatch({ type: ActionTypes.LOGIN_FAILURE, payload: error.message });
        actions.addNotification({
          type: 'error',
          message: 'Login failed. Please try again.',
          duration: 5000
        });
      }
    },

    register: async (userData) => {
      dispatch({ type: ActionTypes.LOGIN_START });
      try {
        const user = await api.auth.register(userData);
        dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: user });
        
        actions.addNotification({
          type: 'success',
          message: 'Account created successfully!',
          duration: 5000
        });
      } catch (error) {
        dispatch({ type: ActionTypes.LOGIN_FAILURE, payload: error.message });
        actions.addNotification({
          type: 'error',
          message: 'Registration failed. Please try again.',
          duration: 5000
        });
      }
    },

    logout: () => {
      api.auth.logout();
      dispatch({ type: ActionTypes.LOGOUT });
      
      // Clean up OAuth processing flags
      sessionStorage.removeItem('processedOAuthToken');
      sessionStorage.removeItem('oauthCallback');
      
      actions.addNotification({
        type: 'info',
        message: 'You have been logged out.',
        duration: 3000
      });
    },

    updateUser: (userData) => {
      dispatch({ type: ActionTypes.UPDATE_USER, payload: userData });
    },

    // OAuth actions
    initiateGoogleAuth: () => {
      try {
        api.auth.initiateGoogleAuth();
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Google authentication is not available.',
          duration: 5000
        });
      }
    },

    initiateGitHubAuth: () => {
      try {
        api.auth.initiateGitHubAuth();
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'GitHub authentication is not available.',
          duration: 5000
        });
      }
    },

    // Check for OAuth callback
    checkOAuthCallback,

    // Complete OAuth onboarding
    completeOAuthOnboarding: async (user) => {
      dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: user });
      dispatch({ type: ActionTypes.SET_OAUTH_PENDING, payload: false });
      
      actions.addNotification({
        type: 'success',
        message: `Welcome to CodeBattle, ${user.displayName}!`,
        duration: 5000
      });
      
      // Fetch dashboard data
      setTimeout(() => fetchDashboardData(), 100);
    },

    // Data fetching
    fetchDashboardData,

    // LeetCode sync
    syncLeetCode: async () => {
      dispatch({ type: ActionTypes.SYNC_LEETCODE_START });
      try {
        const result = await api.leetcode.sync();
        dispatch({ type: ActionTypes.SYNC_LEETCODE_SUCCESS, payload: result });
        
        actions.addNotification({
          type: 'success',
          message: 'LeetCode data synced successfully!',
          duration: 5000
        });
      } catch (error) {
        dispatch({ type: ActionTypes.SYNC_LEETCODE_FAILURE, payload: error.message });
        actions.addNotification({
          type: 'error',
          message: 'Failed to sync LeetCode data.',
          duration: 5000
        });
      }
    },

    // UI actions
    toggleModal: (modal, isOpen) => {
      dispatch({ 
        type: ActionTypes.TOGGLE_MODAL, 
        payload: { modal, isOpen } 
      });
    },

    addNotification: (notification) => {
      const id = Date.now() + Math.random();
      const notificationWithId = {
        ...notification,
        id,
        timestamp: new Date()
      };
      
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: notificationWithId 
      });

      // Auto-remove notification after duration
      if (notification.duration) {
        setTimeout(() => {
          actions.removeNotification(id);
        }, notification.duration);
      }
    },

    removeNotification: (id) => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    },

    // Initialize authentication state
    initializeAuth: initializeAuth,

    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }
  };

  // Initialize authentication state on mount - run only once
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    let isMounted = true;
    hasInitializedRef.current = true;
    
    const initAuth = async () => {
      if (!isMounted) return;
      
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log('🔍 Found existing token, checking if valid...');
        // Set token in API service first
        api.setToken(token);
        try {
          const user = await api.auth.getCurrentUser();
          console.log('✅ Token is valid, logging in user:', user);
          if (isMounted) {
            dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: user });
          }
        } catch (error) {
          console.log('❌ Token is invalid, removing...', error);
          // Clear the token from the api instance and localStorage
          localStorage.removeItem('authToken');
          api.token = null;
        }
      } else {
        console.log('ℹ️ No existing token found');
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run only once

  // Auto-fetch data when user becomes authenticated (only once per authentication)
  useEffect(() => {
    if (!state.isAuthenticated || hasFetchedDataRef.current || state.loading) {
      return;
    }
    
    console.log('🔄 User authenticated, fetching dashboard data...');
    hasFetchedDataRef.current = true;
    
    // Use a timeout to avoid dependency issues
    const timeoutId = setTimeout(() => {
      fetchDashboardData().catch(error => {
        console.error('Failed to fetch dashboard data:', error);
        hasFetchedDataRef.current = false; // Reset on error so it can be retried
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [state.isAuthenticated, state.loading]);

  // Reset fetch flag when user logs out
  useEffect(() => {
    if (!state.isAuthenticated) {
      hasFetchedDataRef.current = false;
    }
  }, [state.isAuthenticated]);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
