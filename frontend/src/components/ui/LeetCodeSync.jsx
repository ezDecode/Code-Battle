import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, AlertCircle, RefreshCw, ExternalLink, User, Trophy, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/Toast';

export const LeetCodeSync = () => {
  const { state, actions } = useApp();
  const { user, loading } = state;
  const toast = useToast();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncData, setSyncData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSync = async () => {
    setSyncStatus('syncing');
    setSyncData(null);
    
    try {
      const result = await toast.promise(
        actions.syncLeetCode ? actions.syncLeetCode() : Promise.reject(new Error('Sync service not available')),
        {
          loading: 'Syncing with LeetCode... This may take a moment.',
          success: 'Successfully synced with LeetCode!',
          error: 'Failed to sync with LeetCode. Please check your connection and try again.'
        }
      );
      
      setSyncStatus('success');
      setSyncData(result);
      
      // Close the modal after successful sync
      setTimeout(() => {
        actions.toggleModal('leetcodeSync', false);
      }, 1000);
      
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync failed:', error);
    }
  };

  const getSyncButtonContent = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Syncing...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            Synced!
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            Retry Sync
          </>
        );
      default:
        return (
          <>
            <Zap className="w-4 h-4" />
            Sync LeetCode
          </>
        );
    }
  };

  const getSyncButtonStyles = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'bg-yellow-500 hover:bg-yellow-600 cursor-wait';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-red-500 hover:bg-red-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Sync Button */}
      <motion.button
        onClick={handleSync}
        disabled={loading || syncStatus === 'syncing'}
        className={`
          w-full px-6 py-3 text-white font-bold rounded-xl transition-all duration-200
          ${getSyncButtonStyles()}
          ${(loading || syncStatus === 'syncing') ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{ fontFamily: 'Outreque, sans-serif' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {getSyncButtonContent()}
      </motion.button>

      {/* LeetCode Profile Link */}
      {user?.leetcodeUsername && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-600" />
            <span 
              className="text-sm text-gray-700"
              style={{ fontFamily: 'Outreque, sans-serif' }}
            >
              @{user.leetcodeUsername}
            </span>
          </div>
          <a
            href={`https://leetcode.com/${user.leetcodeUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            style={{ fontFamily: 'Outreque, sans-serif' }}
          >
            View Profile
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Sync Results Modal */}
      <AnimatePresence>
        {showDetails && syncData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                </motion.div>
                <h2 
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  Sync Complete!
                </h2>
                <p 
                  className="text-green-100 mt-2"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  Your LeetCode progress has been updated
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Trophy className="w-5 h-5 text-blue-600" />
                    </div>
                    <div 
                      className="text-2xl font-bold text-blue-600"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      {syncData.problemsSynced}
                    </div>
                    <div 
                      className="text-xs text-blue-700"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      Problems
                    </div>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div 
                      className="text-2xl font-bold text-orange-600"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      {syncData.pointsEarned}
                    </div>
                    <div 
                      className="text-xs text-orange-700"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      Points
                    </div>
                  </div>
                  
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="w-5 h-5 text-red-600" />
                    </div>
                    <div 
                      className="text-2xl font-bold text-red-600"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      {syncData.newStreak}
                    </div>
                    <div 
                      className="text-xs text-red-700"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      Day Streak
                    </div>
                  </div>
                </div>

                {/* New Problems */}
                {syncData.newProblems.length > 0 && (
                  <div>
                    <h3 
                      className="font-bold text-gray-800 mb-3"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      New Problems Detected:
                    </h3>
                    <div className="space-y-2">
                      {syncData.newProblems.map((problem, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div 
                              className="font-medium text-gray-800"
                              style={{ fontFamily: 'Outreque, sans-serif' }}
                            >
                              {problem.title}
                            </div>
                            <span 
                              className={`text-xs px-2 py-1 rounded-full ${
                                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                              style={{ fontFamily: 'Outreque, sans-serif' }}
                            >
                              {problem.difficulty}
                            </span>
                          </div>
                          <div 
                            className="text-green-600 font-bold"
                            style={{ fontFamily: 'Outreque, sans-serif' }}
                          >
                            +{problem.points}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Sync Info */}
      <div className="text-center">
        <p 
          className="text-xs text-gray-500"
          style={{ fontFamily: 'Outreque, sans-serif' }}
        >
          Last synced: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};
