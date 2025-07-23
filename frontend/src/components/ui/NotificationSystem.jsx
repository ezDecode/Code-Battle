import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-600" />;
  }
};

const Notification = ({ notification, onRemove }) => {
  const { id, type, message, title, duration } = notification;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.3 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      className={`
        w-full max-w-sm p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${getNotificationStyles(type)}
      `}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={type} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 
              className="font-bold mb-1"
              style={{ fontFamily: 'Outreque, sans-serif' }}
            >
              {title}
            </h4>
          )}
          <p 
            className="text-sm break-words"
            style={{ fontFamily: 'Outreque, sans-serif' }}
          >
            {message}
          </p>
        </div>
        
        <button
          onClick={() => onRemove(id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar for timed notifications */}
      {duration && (
        <motion.div
          className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-current opacity-60"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export const NotificationSystem = () => {
  const { state, actions } = useApp();
  const { notifications } = state;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              notification={notification}
              onRemove={actions.removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for easy notification usage
export const useNotifications = () => {
  const { actions } = useApp();

  return {
    success: (message, options = {}) => actions.addNotification({
      type: 'success',
      message,
      duration: 5000,
      ...options
    }),
    
    error: (message, options = {}) => actions.addNotification({
      type: 'error',
      message,
      duration: 7000,
      ...options
    }),
    
    warning: (message, options = {}) => actions.addNotification({
      type: 'warning',
      message,
      duration: 6000,
      ...options
    }),
    
    info: (message, options = {}) => actions.addNotification({
      type: 'info',
      message,
      duration: 4000,
      ...options
    }),
    
    custom: (notification) => actions.addNotification(notification)
  };
};
