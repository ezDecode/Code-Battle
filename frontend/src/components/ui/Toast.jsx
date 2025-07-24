import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Loader2 
} from 'lucide-react';

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// Toast Positions
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
};

// Initial state
const initialState = {
  toasts: [],
  position: TOAST_POSITIONS.TOP_RIGHT
};

// Action types
const ACTION_TYPES = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  SET_POSITION: 'SET_POSITION',
  CLEAR_ALL: 'CLEAR_ALL'
};

// Reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_TOAST:
      return {
        ...state,
        toasts: [action.payload, ...state.toasts]
      };
    case ACTION_TYPES.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    case ACTION_TYPES.SET_POSITION:
      return {
        ...state,
        position: action.payload
      };
    case ACTION_TYPES.CLEAR_ALL:
      return {
        ...state,
        toasts: []
      };
    default:
      return state;
  }
};

// Context
const ToastContext = createContext();

// Toast Provider
export const ToastProvider = ({ children, defaultPosition = TOAST_POSITIONS.TOP_RIGHT }) => {
  const [state, dispatch] = useReducer(toastReducer, {
    ...initialState,
    position: defaultPosition
  });

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type: TOAST_TYPES.INFO,
      duration: 4000,
      dismissible: true,
      ...toast
    };

    dispatch({ type: ACTION_TYPES.ADD_TOAST, payload: newToast });

    // Auto remove toast after duration (if not loading type)
    if (newToast.duration && newToast.type !== TOAST_TYPES.LOADING) {
      setTimeout(() => {
        dispatch({ type: ACTION_TYPES.REMOVE_TOAST, payload: id });
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: ACTION_TYPES.REMOVE_TOAST, payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ALL });
  }, []);

  const setPosition = useCallback((position) => {
    dispatch({ type: ACTION_TYPES.SET_POSITION, payload: position });
  }, []);

  const value = {
    toasts: state.toasts,
    position: state.position,
    addToast,
    removeToast,
    clearAll,
    setPosition
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearAll, setPosition } = context;

  return {
    toast: addToast,
    removeToast,
    clearAll,
    setPosition,
    success: (message, options = {}) => addToast({
      type: TOAST_TYPES.SUCCESS,
      message,
      duration: 4000,
      ...options
    }),
    error: (message, options = {}) => addToast({
      type: TOAST_TYPES.ERROR,
      message,
      duration: 6000,
      ...options
    }),
    warning: (message, options = {}) => addToast({
      type: TOAST_TYPES.WARNING,
      message,
      duration: 5000,
      ...options
    }),
    info: (message, options = {}) => addToast({
      type: TOAST_TYPES.INFO,
      message,
      duration: 4000,
      ...options
    }),
    loading: (message, options = {}) => addToast({
      type: TOAST_TYPES.LOADING,
      message,
      duration: null,
      dismissible: false,
      ...options
    }),
    promise: async (promise, messages) => {
      const loadingId = addToast({
        type: TOAST_TYPES.LOADING,
        message: messages.loading || 'Loading...',
        duration: null,
        dismissible: false
      });

      try {
        const result = await promise;
        removeToast(loadingId);
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: messages.success || 'Success!',
          duration: 4000
        });
        return result;
      } catch (error) {
        removeToast(loadingId);
        addToast({
          type: TOAST_TYPES.ERROR,
          message: messages.error || 'Something went wrong!',
          duration: 6000
        });
        throw error;
      }
    }
  };
};

// Toast Icon Component
const ToastIcon = ({ type }) => {
  const iconProps = { className: "w-5 h-5" };
  
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-600" />;
    case TOAST_TYPES.ERROR:
      return <AlertCircle {...iconProps} className="w-5 h-5 text-[#FF0000]" />;
    case TOAST_TYPES.WARNING:
      return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-600" />;
    case TOAST_TYPES.LOADING:
      return <Loader2 {...iconProps} className="w-5 h-5 text-blue-600 animate-spin" />;
    case TOAST_TYPES.INFO:
    default:
      return <Info {...iconProps} className="w-5 h-5 text-blue-600" />;
  }
};

// Toast styling
const getToastStyles = (type) => {
  const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";
  
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return `${baseStyles} border-green-500 bg-[#D9D9D9]/90`;
    case TOAST_TYPES.ERROR:
      return `${baseStyles} border-[#FF0000] bg-[#D9D9D9]/90`;
    case TOAST_TYPES.WARNING:
      return `${baseStyles} border-yellow-500 bg-[#D9D9D9]/90`;
    case TOAST_TYPES.LOADING:
      return `${baseStyles} border-blue-500 bg-[#D9D9D9]/90`;
    case TOAST_TYPES.INFO:
    default:
      return `${baseStyles} border-blue-500 bg-[#D9D9D9]/90`;
  }
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const { id, type, message, title, dismissible, action } = toast;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.5 }}
      transition={{ 
        duration: 0.4, 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }}
      className={`
        relative overflow-hidden rounded-lg p-4 pr-8 min-w-[320px] max-w-[500px]
        ${getToastStyles(type)}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <ToastIcon type={type} />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 
              className="font-bold text-black mb-1 text-sm"
              style={{ fontFamily: 'Outreque, sans-serif' }}
            >
              {title}
            </h4>
          )}
          <p 
            className="text-black text-sm leading-relaxed break-words"
            style={{ fontFamily: 'Outreque, sans-serif' }}
          >
            {message}
          </p>
          
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 underline"
              style={{ fontFamily: 'Outreque, sans-serif' }}
            >
              {action.label}
            </button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={() => onRemove(id)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors group"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          </button>
        )}
      </div>

      {/* Progress bar for timed toasts */}
      {toast.duration && type !== TOAST_TYPES.LOADING && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ 
            duration: toast.duration / 1000, 
            ease: "linear" 
          }}
        />
      )}

      {/* Glow effect for loading toasts */}
      {type === TOAST_TYPES.LOADING && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      )}
    </motion.div>
  );
};

// Get container position styles
const getPositionStyles = (position) => {
  switch (position) {
    case TOAST_POSITIONS.TOP_LEFT:
      return "top-4 left-4";
    case TOAST_POSITIONS.TOP_CENTER:
      return "top-4 left-1/2 transform -translate-x-1/2";
    case TOAST_POSITIONS.TOP_RIGHT:
      return "top-4 right-4";
    case TOAST_POSITIONS.BOTTOM_LEFT:
      return "bottom-4 left-4";
    case TOAST_POSITIONS.BOTTOM_CENTER:
      return "bottom-4 left-1/2 transform -translate-x-1/2";
    case TOAST_POSITIONS.BOTTOM_RIGHT:
      return "bottom-4 right-4";
    default:
      return "top-4 right-4";
  }
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts, position, removeToast } = useContext(ToastContext);

  return (
    <div 
      className={`fixed z-[9999] pointer-events-none ${getPositionStyles(position)}`}
    >
      <div className="space-y-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToastProvider;
