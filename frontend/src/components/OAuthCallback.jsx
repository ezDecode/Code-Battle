import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const OAuthCallback = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkOAuthCallback, isAuthenticated, oauthPending } = useAuth();
  const processedTokenRef = useRef(null);
  const processingRef = useRef(false);

  // Memoize the OAuth callback handler to prevent unnecessary re-renders
  const handleOAuthCallback = useCallback(async () => {
    // Prevent processing if currently processing
    if (processingRef.current) {
      console.log('🔄 OAuth callback currently processing, skipping...');
      return;
    }
    
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const oauth = urlParams.get('oauth');
    const error = urlParams.get('error');
    
    // Handle OAuth error
    if (error) {
      console.error('❌ OAuth error from URL:', error);
      // Clean URL and redirect
      window.history.replaceState({}, document.title, location.pathname);
      navigate('/', { replace: true });
      return;
    }
    
    // Only process if we have valid OAuth parameters
    if (!token || oauth !== 'true') {
      return;
    }
    
    // Check if we've already processed this exact token
    if (processedTokenRef.current === token) {
      console.log('🔄 OAuth token already processed, cleaning URL...');
      // Clean URL if we've already processed this token
      window.history.replaceState({}, document.title, location.pathname);
      return;
    }
    
    console.log('🔍 OAuth callback processing:', { 
      token: token?.substring(0, 10) + '...', 
      oauth,
      pathname: location.pathname 
    });
    
    // Mark as processing to prevent race conditions
    processingRef.current = true;
    
    try {
      console.log('📞 Processing OAuth callback...');
      
      // Store the OAuth parameters temporarily to prevent race conditions
      const oauthData = { token, oauth, pathname: location.pathname };
      sessionStorage.setItem('oauthCallback', JSON.stringify(oauthData));
      
      const result = await checkOAuthCallback();
      console.log('📞 OAuth callback result:', result);
      
      // Mark this token as processed only after successful processing
      processedTokenRef.current = token;
      
      // Clean up temporary storage
      sessionStorage.removeItem('oauthCallback');
      
      // Handle different result scenarios
      if (result && result.needsOnboarding) {
        console.log('🚀 Redirecting to onboarding...');
        navigate('/onboarding', { replace: true });
      } else if (result && !result.needsOnboarding) {
        console.log('🚀 OAuth complete, redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('❌ OAuth failed, redirecting to home...');
        // Clean up any stored tokens on failure
        sessionStorage.removeItem('processedOAuthToken');
        localStorage.removeItem('authToken');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      // Clean URL and stored data on error
      window.history.replaceState({}, document.title, location.pathname);
      sessionStorage.removeItem('processedOAuthToken');
      sessionStorage.removeItem('oauthCallback');
      localStorage.removeItem('authToken');
      navigate('/', { replace: true });
    } finally {
      processingRef.current = false;
    }
  }, [location.search, location.pathname, navigate, checkOAuthCallback]);

  useEffect(() => {
    // Only run when there are search parameters
    if (location.search) {
      handleOAuthCallback();
    }
  }, [location.search, handleOAuthCallback]);

  // Auto-redirect based on authentication state (separate effect)
  useEffect(() => {
    // Don't auto-redirect if we're processing OAuth or have OAuth pending
    if (processingRef.current || oauthPending) {
      return;
    }
    
    // Don't redirect if we have OAuth parameters in the URL
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('token') && urlParams.get('oauth') === 'true') {
      return;
    }
    
    // Only redirect if we're authenticated and on the landing page, and not already redirecting
    if (isAuthenticated && location.pathname === '/' && !processedTokenRef.current) {
      console.log('🚀 User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, oauthPending, location.pathname, location.search, navigate]);

  return children;
};

export default OAuthCallback;
