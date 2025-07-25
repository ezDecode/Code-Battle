const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const mongoose = require('mongoose');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { leetcodeUsername, displayName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { leetcodeUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or LeetCode username'
      });
    }

    // If LeetCode username is provided, verify it exists and fetch data
    let leetcodeData = null;
    let skillLevel = 'beginner';
    let submitStats = { easy: 0, medium: 0, hard: 0 };
    let streak = 0;

    if (leetcodeUsername) {
      try {
        const leetcodeService = require('../services/leetcodeQueryService');
        
        console.log(`Verifying and syncing LeetCode data for: ${leetcodeUsername}`);
        
        // Verify username exists
        const isValidUsername = await leetcodeService.verifyUsername(leetcodeUsername);
        if (!isValidUsername) {
          return res.status(400).json({ 
            message: 'LeetCode username not found' 
          });
        }

        // Fetch comprehensive LeetCode data
        leetcodeData = await leetcodeService.getComprehensiveUserData(leetcodeUsername);
        skillLevel = leetcodeData.skillLevel;
        submitStats = {
          easy: leetcodeData.solvedStats.easySolved,
          medium: leetcodeData.solvedStats.mediumSolved,
          hard: leetcodeData.solvedStats.hardSolved
        };
        streak = leetcodeData.calendar.streak || 0;
      } catch (syncError) {
        console.error('LeetCode sync error during registration:', syncError);
        // Continue with registration even if sync fails
      }
    }

    const user = new User({
      leetcodeUsername,
      displayName,
      email,
      password,
      skillLevel,
      submitStats,
      streak
    });

    // Add LeetCode data if successfully fetched
    if (leetcodeData) {
      user.leetcodeData = {
        ranking: leetcodeData.profile.ranking,
        userAvatar: leetcodeData.profile.avatar,
        realName: leetcodeData.profile.name,
        submitStats,
        totalSolved: leetcodeData.solvedStats.totalSolved,
        contestInfo: leetcodeData.contestInfo,
        streak: leetcodeData.calendar.streak || 0,
        lastSyncAt: new Date()
      };
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        leetcodeUsername: user.leetcodeUsername,
        displayName: user.displayName,
        email: user.email,
        skillLevel: user.skillLevel,
        totalScore: user.totalScore,
        streak: user.streak,
        submitStats: user.submitStats,
        leetcodeData: user.leetcodeData
      },
      syncedData: leetcodeData ? {
        totalSolved: leetcodeData.solvedStats.totalSolved,
        skillLevel: leetcodeData.skillLevel,
        ranking: leetcodeData.profile.ranking,
        streak: leetcodeData.calendar.streak || 0
      } : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('teamId');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        leetcodeUsername: user.leetcodeUsername,
        displayName: user.displayName,
        email: user.email,
        skillLevel: user.skillLevel,
        totalScore: user.totalScore,
        streak: user.streak,
        team: user.teamId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).populate('teamId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add timestamp to help with cache validation
    const responseData = {
      id: user._id,
      leetcodeUsername: user.leetcodeUsername,
      displayName: user.displayName,
      email: user.email,
      skillLevel: user.skillLevel,
      totalScore: user.totalScore,
      streak: user.streak,
      team: user.teamId,
      isOAuthUser: user.isOAuthUser || false,
      onboardingCompleted: user.onboardingCompleted || false,
      avatar: user.avatar,
      leetcodeData: user.leetcodeData,
      submitStats: user.submitStats,
      lastActive: user.lastActive,
      fetchedAt: new Date().toISOString() // Add timestamp for cache validation
    };

    res.json(responseData);
  } catch (error) {
    console.error('Get current user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (clear session)
// @access  Private
router.post('/logout', async (req, res) => {
  try {
    // If using sessions, destroy the session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
    }
    
    // Clear any server-side caches if applicable
    // Note: With JWT, there's no server-side session to clear,
    // but we can perform cleanup operations here
    
    res.json({ 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// OAuth Routes

// @route   GET /api/auth/oauth-status
// @desc    Check OAuth configuration status
// @access  Public
router.get('/oauth-status', (req, res) => {
  const googleConfigured = process.env.GOOGLE_CLIENT_ID && 
                           process.env.GOOGLE_CLIENT_SECRET && 
                           process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id';
  
  const githubConfigured = process.env.GITHUB_CLIENT_ID && 
                          process.env.GITHUB_CLIENT_SECRET && 
                          process.env.GITHUB_CLIENT_ID !== 'your-github-client-id';

  res.json({
    oauth: {
      google: {
        configured: googleConfigured,
        clientId: googleConfigured ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 12)}...` : 'Not configured'
      },
      github: {
        configured: githubConfigured,
        clientId: githubConfigured ? `${process.env.GITHUB_CLIENT_ID.substring(0, 12)}...` : 'Not configured'
      }
    },
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL
  });
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', (req, res, next) => {
  console.log('🔵 Google OAuth initiated');
  console.log('🔵 Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
  console.log('🔵 Callback URL:', process.env.GOOGLE_REDIRECT_URI);
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('❌ Google OAuth not configured');
    return res.status(503).json({ 
      message: 'Google OAuth not configured',
      error: 'OAUTH_NOT_CONFIGURED'
    });
  }
  
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Check if user needs onboarding (OAuth users without LeetCode username)
      const needsOnboarding = req.user.needsOnboarding 
        ? req.user.needsOnboarding() 
        : (req.user.isOAuthUser && (!req.user.leetcodeUsername || !req.user.onboardingCompleted));
      
      const redirectUrl = needsOnboarding 
        ? `${process.env.FRONTEND_URL}/onboarding?token=${token}&oauth=true`
        : `${process.env.FRONTEND_URL}/dashboard?token=${token}&oauth=true`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/?error=oauth_failed`);
    }
  }
);

// @route   GET /api/auth/github
// @desc    Initiate GitHub OAuth
// @access  Public
router.get('/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(503).json({ 
      message: 'GitHub OAuth not configured',
      error: 'OAUTH_NOT_CONFIGURED'
    });
  }
  passport.authenticate('github', {
    scope: ['user:email']
  })(req, res, next);
});

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Check if user needs onboarding (OAuth users without LeetCode username)
      const needsOnboarding = req.user.needsOnboarding 
        ? req.user.needsOnboarding() 
        : (req.user.isOAuthUser && (!req.user.leetcodeUsername || !req.user.onboardingCompleted));
      
      const redirectUrl = needsOnboarding 
        ? `${process.env.FRONTEND_URL}/onboarding?token=${token}&oauth=true`
        : `${process.env.FRONTEND_URL}/dashboard?token=${token}&oauth=true`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/?error=oauth_failed`);
    }
  }
);

// @route   POST /api/auth/complete-onboarding
// @desc    Complete OAuth user onboarding
// @access  Private
router.post('/complete-onboarding', async (req, res) => {
  try {
    const { leetcodeUsername, token } = req.body;

    if (!token || !leetcodeUsername) {
      return res.status(400).json({ 
        message: 'Token and LeetCode username are required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isOAuthUser) {
      return res.status(400).json({ message: 'User is not an OAuth user' });
    }

    // Check if LeetCode username is already taken
    const existingUser = await User.findOne({ 
      leetcodeUsername, 
      _id: { $ne: user._id } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'LeetCode username already taken' 
      });
    }

    // Verify LeetCode username exists and fetch initial data
    const leetcodeService = require('../services/leetcodeQueryService');
    
    console.log(`Verifying and syncing LeetCode data for: ${leetcodeUsername}`);
    
    // Verify username exists
    const isValidUsername = await leetcodeService.verifyUsername(leetcodeUsername);
    if (!isValidUsername) {
      return res.status(400).json({ 
        message: 'LeetCode username not found' 
      });
    }

    // Fetch comprehensive LeetCode data
    let leetcodeData = null;
    let skillLevel = 'beginner';
    let submitStats = { easy: 0, medium: 0, hard: 0 };
    
    try {
      leetcodeData = await leetcodeService.getComprehensiveUserData(leetcodeUsername);
      skillLevel = leetcodeData.skillLevel;
      submitStats = {
        easy: leetcodeData.solvedStats.easySolved,
        medium: leetcodeData.solvedStats.mediumSolved,
        hard: leetcodeData.solvedStats.hardSolved
      };
    } catch (syncError) {
      console.error('LeetCode sync error during onboarding:', syncError);
      // Continue with onboarding even if sync fails
    }

    // Update user with LeetCode username, mark onboarding complete, and sync data
    const updates = {
      leetcodeUsername,
      onboardingCompleted: true,
      skillLevel,
      submitStats,
      lastActive: new Date()
    };

    // Add LeetCode data if successfully fetched
    if (leetcodeData) {
      updates.leetcodeData = {
        ranking: leetcodeData.profile.ranking,
        userAvatar: leetcodeData.profile.avatar,
        realName: leetcodeData.profile.name,
        submitStats,
        totalSolved: leetcodeData.solvedStats.totalSolved,
        contestInfo: leetcodeData.contestInfo,
        streak: leetcodeData.calendar.streak || 0,
        lastSyncAt: new Date()
      };
      updates.streak = leetcodeData.calendar.streak || 0;
    }

    await User.findByIdAndUpdate(user._id, updates);
    const updatedUser = await User.findById(user._id);

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser._id,
        leetcodeUsername: updatedUser.leetcodeUsername,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        skillLevel: updatedUser.skillLevel,
        totalScore: updatedUser.totalScore,
        streak: updatedUser.streak,
        submitStats: updatedUser.submitStats,
        leetcodeData: updatedUser.leetcodeData,
        isOAuthUser: updatedUser.isOAuthUser,
        onboardingCompleted: updatedUser.onboardingCompleted
      },
      syncedData: leetcodeData ? {
        totalSolved: leetcodeData.solvedStats.totalSolved,
        skillLevel: leetcodeData.skillLevel,
        ranking: leetcodeData.profile.ranking,
        streak: leetcodeData.calendar.streak || 0
      } : null
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error during onboarding' });
  }
});

module.exports = router;
