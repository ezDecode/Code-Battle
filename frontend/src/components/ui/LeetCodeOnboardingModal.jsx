import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Loader } from "lucide-react";
import { api } from "@/services/api";

export function LeetCodeOnboardingModal({ isOpen, onClose, onComplete }) {
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState('');

  const handleUsernameChange = (e) => {
    setLeetcodeUsername(e.target.value);
    setVerificationStatus(null);
    setError('');
  };

  const verifyUsername = async () => {
    if (!leetcodeUsername.trim()) {
      setError('Please enter a LeetCode username');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await api.leetcode.verify(leetcodeUsername.trim());
      if (response.valid) {
        setVerificationStatus('valid');
      } else {
        setVerificationStatus('invalid');
        setError('LeetCode username not found');
      }
    } catch (error) {
      setVerificationStatus('invalid');
      setError('Error verifying username. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = async () => {
    if (verificationStatus !== 'valid') {
      setError('Please verify your LeetCode username first');
      return;
    }

    setIsCompleting(true);
    setError('');

    try {
      // Get token from localStorage (set during OAuth processing)
      const token = localStorage.getItem('authToken');

      if (!token) {
        // If no token in localStorage, check if API service has it
        if (!api.token) {
          throw new Error('Authentication token not found. Please try logging in again.');
        }
        // Use token from API service
        console.log('Using token from API service');
      } else {
        // Ensure API service has the token
        api.setToken(token);
      }

      // Validate current user before completing onboarding
      try {
        const currentUser = await api.auth.getCurrentUser();
        console.log('Current user validated for onboarding:', currentUser.email);
      } catch (validationError) {
        console.error('User validation failed during onboarding:', validationError);
        throw new Error('Session validation failed. Please try logging in again.');
      }

      console.log('Completing onboarding with LeetCode username:', leetcodeUsername.trim());
      const user = await api.auth.completeOnboarding(leetcodeUsername.trim(), api.token);
      
      // Update the token if a new one is provided
      if (user.token) {
        api.setToken(user.token);
      }

      // Clear any cached data to ensure fresh user data
      sessionStorage.clear();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_') || key.startsWith('leetcode_') || key.startsWith('dashboard_')) {
          localStorage.removeItem(key);
        }
      });

      onComplete(user);
    } catch (error) {
      console.error('Onboarding completion error:', error);
      setError(error.message || 'Failed to complete onboarding');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isCompleting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Complete Your Profile
                  </h2>
                  <p className="text-gray-600 text-left">
                    Connect your LeetCode account to get started
                  </p>
                </div>
                {!isCompleting && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mt-1"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* LeetCode Username Input */}
                <div className="space-y-4">   
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={leetcodeUsername}
                        onChange={handleUsernameChange}
                        placeholder="Verify your LeetCode ID"
                        className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                        disabled={isVerifying || isCompleting}
                      />
                      {verificationStatus === 'valid' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={verifyUsername}
                      disabled={isVerifying || isCompleting || !leetcodeUsername.trim()}
                      className="px-6 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg"
                    >
                      {isVerifying ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify</span>
                      )}
                    </button>
                  </div>
                  
                  {verificationStatus === 'valid' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200"
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Username verified successfully!</span>
                    </motion.div>
                  )}

                  {verificationStatus === 'invalid' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200"
                    >
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Username not found. Please check and try again.</span>
                    </motion.div>
                  )}
                </div>

                {/* Complete Button */}
                <div className="pt-4">
                  <button
                    onClick={handleComplete}
                    disabled={verificationStatus !== 'valid' || isCompleting}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 shadow-lg"
                  >
                    {isCompleting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Setting up your account...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter CodeBattle</span>
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
