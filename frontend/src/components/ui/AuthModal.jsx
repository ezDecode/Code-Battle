import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

function AuthModal({ mode, onClose, isOpen }) {
  const { login, register, initiateGoogleAuth, initiateGitHubAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState(mode || 'login');
  const [leetcodeVerified, setLeetcodeVerified] = useState(false);
  const [isVerifyingLeetcode, setIsVerifyingLeetcode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    leetcodeUsername: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        // For registration, validate that LeetCode username is verified
        if (!leetcodeVerified) {
          setError('Please verify your LeetCode username before registering');
          setIsLoading(false);
          return;
        }

        await register({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          leetcodeUsername: formData.leetcodeUsername
        });
      }
      
      // Close modal on success
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyLeetcodeUsername = async () => {
    if (!formData.leetcodeUsername.trim()) {
      setError('Please enter a LeetCode username');
      return;
    }

    setIsVerifyingLeetcode(true);
    setError('');

    try {
      const response = await api.leetcode.verify(formData.leetcodeUsername.trim());
      if (response.valid) {
        setLeetcodeVerified(true);
      } else {
        setLeetcodeVerified(false);
        setError('LeetCode username not found. Please check and try again.');
      }
    } catch (error) {
      setLeetcodeVerified(false);
      setError('Error verifying LeetCode username. Please try again.');
    } finally {
      setIsVerifyingLeetcode(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Close modal immediately to reduce latency
      onClose();
      
      // Add a small delay to ensure modal closes before redirect
      setTimeout(async () => {
        await initiateGoogleAuth();
      }, 100);
    } catch (err) {
      setError(err.message || 'Google authentication failed');
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Close modal immediately to reduce latency
      onClose();
      
      // Add a small delay to ensure modal closes before redirect
      setTimeout(async () => {
        await initiateGitHubAuth();
      }, 100);
    } catch (err) {
      setError(err.message || 'GitHub authentication failed');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Reset LeetCode verification if username changes
    if (name === 'leetcodeUsername') {
      setLeetcodeVerified(false);
      setError('');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#D9D9D9]/80 flex items-center justify-center z-50 p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#D9D9D9]/90 rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'rgba(217, 217, 217, 0.95)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <h2 
            className="text-black font-bold text-center mb-6 sm:mb-8"
            style={{
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: '700',
              fontFamily: 'Outreque, sans-serif'
            }}
          >
            {authMode === 'login' ? 'Welcome Back' : 'Join CodeBattle'}
          </h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {authMode === 'register' && (
              <div>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 text-black bg-white/70 border border-black/30 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-black/50 backdrop-blur-sm"
                  placeholder="Display Name"
                  style={{
                    fontSize: 'clamp(14px, 3vw, 16px)',
                    fontFamily: 'Outreque, sans-serif',
                    background: 'rgba(255, 255, 255, 0.7)'
                  }}
                  required
                />
              </div>
            )}

            {authMode === 'register' && (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="leetcodeUsername"
                    value={formData.leetcodeUsername}
                    onChange={handleInputChange}
                    className="flex-1 px-3 sm:px-4 py-3 sm:py-4 text-black bg-white/70 border border-black/30 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-black/50 backdrop-blur-sm"
                    placeholder="LeetCode Username"
                    style={{
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontFamily: 'Outreque, sans-serif',
                      background: 'rgba(255, 255, 255, 0.7)'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={verifyLeetcodeUsername}
                    disabled={isVerifyingLeetcode || !formData.leetcodeUsername.trim()}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    style={{ fontFamily: 'Outreque, sans-serif' }}
                  >
                    {isVerifyingLeetcode ? 'Checking...' : 'Verify'}
                  </button>
                </div>
                {leetcodeVerified && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <span>✓</span>
                    <span>Username verified!</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 text-black bg-white/70 border border-black/30 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-black/50 backdrop-blur-sm"
                placeholder="Email Address"
                style={{
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontFamily: 'Outreque, sans-serif',
                  background: 'rgba(255, 255, 255, 0.7)'
                }}
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 text-black bg-white/70 border border-black/30 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-black/50 backdrop-blur-sm"
                placeholder="Password"
                style={{
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontFamily: 'Outreque, sans-serif',
                  background: 'rgba(255, 255, 255, 0.7)'
                }}
                required
              />
            </div>

            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                className="w-full py-3 sm:py-4 px-6 text-white bg-red-600 hover:bg-red-700 rounded-lg sm:rounded-xl transition-all duration-200 font-medium shadow-lg active:scale-95"
                style={{
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  fontFamily: 'Outreque, sans-serif',
                  background: '#FF0000',
                  minHeight: '48px'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
              </button>
            </div>

            {/* Social Auth Divider */}
            <div className="flex items-center my-4 sm:my-6">
              <div className="flex-1 border-t border-black/20"></div>
              <span className="px-4 text-black/60 text-sm" style={{ fontFamily: 'Outreque, sans-serif' }}>
                or continue with
              </span>
              <div className="flex-1 border-t border-black/20"></div>
            </div>

            {/* Social Auth Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-6 text-black bg-white hover:bg-gray-50 border border-black/20 rounded-lg sm:rounded-xl transition-all duration-200 font-medium shadow-sm active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontFamily: 'Outreque, sans-serif',
                  minHeight: '48px'
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <button
                type="button"
                onClick={handleGitHubAuth}
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-6 text-white bg-gray-900 hover:bg-gray-800 rounded-lg sm:rounded-xl transition-all duration-200 font-medium shadow-sm active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontFamily: 'Outreque, sans-serif',
                  minHeight: '48px'
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Continue with GitHub'}</span>
              </button>
            </div>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-black hover:text-black/70 transition-colors duration-200 active:scale-95 py-2 cursor-pointer"
              style={{
                fontSize: 'clamp(14px, 3vw, 16px)',
                fontFamily: 'Outreque, sans-serif',
                color: '#000000',
                minHeight: '44px'
              }}
            >
              {authMode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AuthModal };
