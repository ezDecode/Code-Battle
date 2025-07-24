const express = require('express');
const leetcodeService = require('../services/leetcodeQueryService');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/leetcode/verify/:username
// @desc    Verify if a LeetCode username exists
// @access  Public
router.get('/verify/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`Verifying LeetCode username: ${username}`);
    
    const isValid = await leetcodeService.verifyUsername(username);
    
    if (isValid) {
      // Get basic profile data using the comprehensive method
      try {
        const userData = await leetcodeService.getComprehensiveUserData(username);
        
        res.json({
          valid: true,
          profile: {
            username: userData.profile.username,
            name: userData.profile.name,
            avatar: userData.profile.avatar,
            ranking: userData.profile.ranking
          }
        });
      } catch (profileError) {
        console.log('Profile fetch failed, but username is valid:', profileError.message);
        // Username is valid but profile fetch failed, still return success
        res.json({
          valid: true,
          profile: {
            username: username,
            name: username,
            avatar: null,
            ranking: null
          }
        });
      }
    } else {
      res.status(404).json({
        valid: false,
        message: 'LeetCode username not found'
      });
    }
  } catch (error) {
    console.error('LeetCode verification error:', error);
    res.status(500).json({
      valid: false,
      message: 'Error verifying LeetCode username',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/leetcode/profile/:username
// @desc    Get LeetCode profile data
// @access  Private
router.get('/profile/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    
    const comprehensiveData = await leetcodeService.getComprehensiveUserData(username);
    
    res.json({
      success: true,
      data: comprehensiveData
    });
  } catch (error) {
    console.error('LeetCode profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch LeetCode profile data'
    });
  }
});

// @route   POST /api/leetcode/sync
// @desc    Sync current user's LeetCode data
// @access  Private
router.post('/sync', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.leetcodeUsername) {
      return res.status(400).json({ 
        message: 'No LeetCode username associated with this account' 
      });
    }
    
    console.log(`Syncing LeetCode data for user: ${user.leetcodeUsername}`);
    
    // Fetch comprehensive LeetCode data
    const leetcodeData = await leetcodeService.getComprehensiveUserData(user.leetcodeUsername);
    
    // Update user's skill level and LeetCode data
    const updates = {
      skillLevel: leetcodeData.skillLevel,
      leetcodeData: {
        ranking: leetcodeData.profile.ranking,
        userAvatar: leetcodeData.profile.avatar,
        realName: leetcodeData.profile.name,
        submitStats: {
          easy: leetcodeData.solvedStats.easySolved,
          medium: leetcodeData.solvedStats.mediumSolved,
          hard: leetcodeData.solvedStats.hardSolved
        },
        totalSolved: leetcodeData.solvedStats.totalSolved,
        contestInfo: leetcodeData.contestInfo,
        streak: leetcodeData.calendar.streak,
        lastSyncAt: new Date()
      },
      lastActive: new Date()
    };
    
    await User.findByIdAndUpdate(req.userId, updates);
    const updatedUser = await User.findById(req.userId);
    
    res.json({
      success: true,
      message: 'LeetCode data synced successfully',
      user: {
        id: updatedUser._id,
        displayName: updatedUser.displayName,
        leetcodeUsername: updatedUser.leetcodeUsername,
        skillLevel: updatedUser.skillLevel,
        totalScore: updatedUser.totalScore,
        leetcodeData: updatedUser.leetcodeData
      },
      syncedData: {
        totalSolved: leetcodeData.solvedStats.totalSolved,
        skillLevel: leetcodeData.skillLevel,
        ranking: leetcodeData.profile.ranking,
        streak: leetcodeData.calendar.streak
      }
    });
  } catch (error) {
    console.error('LeetCode sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync LeetCode data'
    });
  }
});

// @route   POST /api/leetcode/sync-all
// @desc    Sync all users' LeetCode data (Admin only)
// @access  Private
router.post('/sync-all', auth, async (req, res) => {
  try {
    // Find all users with LeetCode usernames
    const users = await User.find({
      leetcodeUsername: { $exists: true, $ne: null }
    });

    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'No users found with LeetCode usernames',
        syncedUsers: []
      });
    }

    const syncResults = [];
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`Syncing LeetCode data for user: ${user.displayName} (${user.leetcodeUsername})`);
        
        // Fetch comprehensive LeetCode data
        const leetcodeData = await leetcodeService.getComprehensiveUserData(user.leetcodeUsername);
        
        // Update user's skill level and LeetCode data
        const updates = {
          skillLevel: leetcodeData.skillLevel,
          submitStats: {
            easy: leetcodeData.solvedStats.easySolved,
            medium: leetcodeData.solvedStats.mediumSolved,
            hard: leetcodeData.solvedStats.hardSolved
          },
          leetcodeData: {
            ranking: leetcodeData.profile.ranking,
            userAvatar: leetcodeData.profile.avatar,
            realName: leetcodeData.profile.name,
            submitStats: {
              easy: leetcodeData.solvedStats.easySolved,
              medium: leetcodeData.solvedStats.mediumSolved,
              hard: leetcodeData.solvedStats.hardSolved
            },
            totalSolved: leetcodeData.solvedStats.totalSolved,
            contestInfo: leetcodeData.contestInfo,
            streak: leetcodeData.calendar.streak || 0,
            lastSyncAt: new Date()
          },
          streak: leetcodeData.calendar.streak || 0,
          lastActive: new Date()
        };

        await User.findByIdAndUpdate(user._id, updates);
        
        syncResults.push({
          userId: user._id,
          displayName: user.displayName,
          leetcodeUsername: user.leetcodeUsername,
          success: true,
          totalSolved: leetcodeData.solvedStats.totalSolved,
          skillLevel: leetcodeData.skillLevel
        });
        
        successCount++;
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (userError) {
        console.error(`Error syncing ${user.displayName}:`, userError.message);
        
        syncResults.push({
          userId: user._id,
          displayName: user.displayName,
          leetcodeUsername: user.leetcodeUsername,
          success: false,
          error: userError.message
        });
        
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `Sync completed: ${successCount} successful, ${errorCount} failed`,
      syncedUsers: syncResults,
      summary: {
        totalUsers: users.length,
        successCount,
        errorCount
      }
    });
    
  } catch (error) {
    console.error('Bulk sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync all users LeetCode data'
    });
  }
});

// @route   GET /api/leetcode/daily
// @desc    Get daily LeetCode problem
// @access  Public
router.get('/daily', async (req, res) => {
  try {
    const dailyProblem = await leetcodeService.getDailyProblem();
    
    res.json({
      success: true,
      data: dailyProblem
    });
  } catch (error) {
    console.error('Daily problem fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily problem'
    });
  }
});

// @route   GET /api/leetcode/problems
// @desc    Get problems list with filters
// @access  Private
router.get('/problems', auth, async (req, res) => {
  try {
    const { limit, tags, difficulty, skip } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit) : 20,
      skip: skip ? parseInt(skip) : 0,
      tags: tags ? tags.split(',') : [],
      difficulty: difficulty || null
    };
    
    const problems = await leetcodeService.getProblems(options);
    
    res.json({
      success: true,
      data: problems
    });
  } catch (error) {
    console.error('Problems fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems'
    });
  }
});

// @route   GET /api/leetcode/submissions/:username
// @desc    Get user's recent submissions
// @access  Private
router.get('/submissions/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const { limit } = req.query;
    
    const submissions = await leetcodeService.getUserSubmissions(
      username, 
      limit ? parseInt(limit) : 20
    );
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Submissions fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

// @route   GET /api/leetcode/stats/:username
// @desc    Get user's LeetCode statistics
// @access  Private
router.get('/stats/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    
    const [solvedStats, calendar] = await Promise.all([
      leetcodeService.getUserSolvedStats(username),
      leetcodeService.getUserCalendar(username)
    ]);
    
    res.json({
      success: true,
      data: {
        solved: solvedStats,
        calendar: calendar,
        skillLevel: leetcodeService.detectSkillLevel(solvedStats)
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
