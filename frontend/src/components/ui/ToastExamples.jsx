import React from 'react';
import { useToast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Loader2,
  Zap,
  Trophy,
  Users,
  Settings
} from 'lucide-react';

// Example component showing different toast use cases
export const ToastExamples = () => {
  const toast = useToast();

  // Success examples
  const handleChallengeComplete = () => {
    toast.success('Challenge completed successfully! You earned 150 points and maintained your streak.', {
      title: '🎉 Well Done!',
      action: {
        label: 'View Stats',
        onClick: () => console.log('Viewing stats...')
      }
    });
  };

  const handleLeetCodeSync = () => {
    toast.success('Synced 5 problems from LeetCode! Your profile is now up to date.', {
      title: '⚡ Sync Complete'
    });
  };

  const handleTeamJoin = () => {
    toast.success('Successfully joined Team Alpha! Welcome to the squad.', {
      title: '👥 Team Joined',
      action: {
        label: 'View Team',
        onClick: () => console.log('Opening team view...')
      }
    });
  };

  // Error examples
  const handleSubmissionError = () => {
    toast.error('Your solution failed 3 test cases. Please review your logic and try again.', {
      title: '❌ Submission Failed',
      action: {
        label: 'View Details',
        onClick: () => console.log('Showing error details...')
      }
    });
  };

  const handleNetworkError = () => {
    toast.error('Unable to connect to server. Please check your internet connection.', {
      title: '🌐 Connection Error'
    });
  };

  const handleAuthError = () => {
    toast.error('Session expired. Please log in again to continue.', {
      title: '🔒 Authentication Required',
      action: {
        label: 'Login',
        onClick: () => console.log('Redirecting to login...')
      }
    });
  };

  // Warning examples
  const handleSessionWarning = () => {
    toast.warning('Your session will expire in 5 minutes. Please save your work.', {
      title: '⏰ Session Warning',
      action: {
        label: 'Extend',
        onClick: () => console.log('Extending session...')
      }
    });
  };

  const handleMemoryWarning = () => {
    toast.warning('Your solution is using high memory. Consider optimizing for better performance.', {
      title: '💾 Memory Warning'
    });
  };

  // Info examples
  const handleDailyChallenge = () => {
    toast.info('New daily challenge is available! Complete it to maintain your streak.', {
      title: '🎯 Daily Challenge',
      action: {
        label: 'Start Now',
        onClick: () => console.log('Starting challenge...')
      }
    });
  };

  const handleUpdateAvailable = () => {
    toast.info('A new version of CodeBattle is available with bug fixes and improvements.', {
      title: '🚀 Update Available',
      action: {
        label: 'Update',
        onClick: () => console.log('Updating app...')
      }
    });
  };

  // Loading examples
  const handleAnalysisStart = () => {
    const loadingToastId = toast.loading('Analyzing your code performance and suggesting optimizations...');
    
    // Simulate analysis completion
    setTimeout(() => {
      toast.removeToast(loadingToastId);
      toast.success('Analysis complete! Your code runs in O(n log n) time complexity.', {
        title: '📊 Analysis Results',
        action: {
          label: 'View Report',
          onClick: () => console.log('Opening analysis report...')
        }
      });
    }, 4000);
  };

  const handleFileUpload = () => {
    toast.loading('Uploading your solution file... This may take a moment.');
  };

  // Promise example
  const handleComplexOperation = async () => {
    const complexPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve({ score: 95, rank: 12 });
        } else {
          reject(new Error('Operation failed'));
        }
      }, 3000);
    });

    try {
      const result = await toast.promise(complexPromise, {
        loading: 'Processing your submission and calculating your rank...',
        success: 'Submission processed! You scored 95/100 and are now ranked #12.',
        error: 'Failed to process submission. Please try again.'
      });
      console.log('Operation result:', result);
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };

  // Bulk operations
  const handleMultipleToasts = () => {
    toast.info('Starting batch sync operation...');
    
    setTimeout(() => {
      toast.success('Synced problems from LeetCode');
    }, 1000);
    
    setTimeout(() => {
      toast.success('Updated team rankings');
    }, 2000);
    
    setTimeout(() => {
      toast.success('Calculated new user statistics');
    }, 3000);
    
    setTimeout(() => {
      toast.success('Batch operation completed successfully!', {
        title: '✅ All Done'
      });
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Toast System Examples</h1>
        <p className="text-gray-600">Click the buttons below to see different toast notifications in action</p>
      </div>

      {/* Success Examples */}
      <section>
        <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Success Toasts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleChallengeComplete}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            Challenge Complete
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLeetCodeSync}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Zap className="w-6 h-6 mx-auto mb-2" />
            LeetCode Sync
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTeamJoin}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            Team Joined
          </motion.button>
        </div>
      </section>

      {/* Error Examples */}
      <section>
        <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Error Toasts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmissionError}
            className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Submission Failed
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNetworkError}
            className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Network Error
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAuthError}
            className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Auth Error
          </motion.button>
        </div>
      </section>

      {/* Warning Examples */}
      <section>
        <h2 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Warning Toasts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSessionWarning}
            className="p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Session Warning
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMemoryWarning}
            className="p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Memory Warning
          </motion.button>
        </div>
      </section>

      {/* Info Examples */}
      <section>
        <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Info Toasts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDailyChallenge}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Daily Challenge
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpdateAvailable}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Update Available
          </motion.button>
        </div>
      </section>

      {/* Loading Examples */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <Loader2 className="w-5 h-5 mr-2" />
          Loading Toasts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalysisStart}
            className="p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Code Analysis
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFileUpload}
            className="p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            File Upload
          </motion.button>
        </div>
      </section>

      {/* Advanced Examples */}
      <section>
        <h2 className="text-xl font-semibold text-purple-700 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Advanced Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplexOperation}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Promise-based Operation
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMultipleToasts}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Multiple Toasts
          </motion.button>
        </div>
      </section>

      <div className="text-center pt-8 border-t">
        <p className="text-gray-600 text-sm">
          This demo showcases the comprehensive toast system with different types, actions, and use cases.
        </p>
      </div>
    </div>
  );
};

export default ToastExamples;
