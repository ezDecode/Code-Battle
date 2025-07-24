import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LeetCodeOnboardingModal } from '@/components/ui/LeetCodeOnboardingModal';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { completeOAuthOnboarding, isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleOnboardingComplete = async (user) => {
    try {
      await completeOAuthOnboarding(user);
      setShowOnboarding(false);
      // Navigation will be handled by the authentication state change
      // Remove direct navigation to prevent race conditions
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // If there's an error, show it to the user
      setShowOnboarding(true);
    }
  };

  const handleOnboardingClose = () => {
    // Redirect back to landing page if user closes onboarding
    navigate('/', { replace: true });
  };

  // If user is already authenticated and no onboarding needed, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to CodeBattle!</h1>
        <p className="text-gray-600 text-lg mb-8">Let's get you set up with your LeetCode account.</p>
        
        {showOnboarding && (
          <LeetCodeOnboardingModal
            isOpen={showOnboarding}
            onClose={handleOnboardingClose}
            onComplete={handleOnboardingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
