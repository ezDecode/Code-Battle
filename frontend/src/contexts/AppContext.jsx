import { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '@/services/api';

// Initial state
const initialState = {
  // User state
  user: null,
  isAuthenticated: false,
  loading: false,
  
  // Dashboard data
  dailyChallenge: null,
  teamMembers: [],
  leaderboard: [],
  userStats: {
    problemsSolved: 0,
    successRate: 0,
    currentStreak: 0,
    weeklyProgress: 0
  },
  
  // UI state
  notifications: [],
  modals: {
    auth: false,
    teamDetails: false,
    leaderboard: false,
    notifications: false
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
      
    case ActionTypes.FETCH_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        dailyChallenge: action.payload.dailyChallenge,
        teamMembers: action.payload.teamMembers,
        leaderboard: action.payload.leaderboard,
        userStats: action.payload.userStats,
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

  // Actions
  const actions = {
    // Auth actions
    login: async (credentials) => {
      dispatch({ type: ActionTypes.LOGIN_START });
      try {
        const user = await api.auth.login(credentials);
        dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: user });
        
        // Fetch initial data after login
        await actions.fetchDashboardData();
        
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
      actions.addNotification({
        type: 'info',
        message: 'You have been logged out.',
        duration: 3000
      });
    },

    // Data fetching
    fetchDashboardData: async () => {
      if (!state.isAuthenticated) return;
      
      dispatch({ type: ActionTypes.FETCH_DATA_START });
      try {
        const data = await api.dashboard.getData();
        dispatch({ type: ActionTypes.FETCH_DATA_SUCCESS, payload: data });
      } catch (error) {
        dispatch({ type: ActionTypes.FETCH_DATA_FAILURE, payload: error.message });
      }
    },

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

    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }
  };

  // Auto-fetch data on mount if authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      actions.fetchDashboardData();
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
