const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('teamId')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, leetcodeUsername } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if leetcode username is already taken by another user
    if (leetcodeUsername && leetcodeUsername !== user.leetcodeUsername) {
      const existingUser = await User.findOne({ 
        leetcodeUsername, 
        _id: { $ne: req.userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'LeetCode username already taken' 
        });
      }
    }

    // Update fields
    if (displayName) user.displayName = displayName;
    if (leetcodeUsername) user.leetcodeUsername = leetcodeUsername;
    
    user.lastActive = new Date();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        leetcodeUsername: user.leetcodeUsername,
        displayName: user.displayName,
        email: user.email,
        skillLevel: user.skillLevel,
        totalScore: user.totalScore,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TODO: Add challenge statistics from Challenge model
    const stats = {
      totalScore: user.totalScore,
      streak: user.streak,
      skillLevel: user.skillLevel,
      leetcodeData: user.leetcodeData,
      // These will be populated when we implement challenge tracking
      challengesCompleted: 0,
      challengesAssigned: 0,
      averageCompletionTime: 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
