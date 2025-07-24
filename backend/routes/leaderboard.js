const express = require('express');
const User = require('../models/User');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/leaderboard/users
// @desc    Get individual user leaderboard
// @access  Private
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('displayName leetcodeUsername totalScore streak skillLevel avatar leetcodeData.userAvatar')
      .sort({ totalScore: -1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      displayName: user.displayName,
      leetcodeUsername: user.leetcodeUsername,
      totalScore: user.totalScore,
      streak: user.streak,
      skillLevel: user.skillLevel,
      avatar: user.avatar,
      leetcodeAvatar: user.leetcodeData?.userAvatar
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Get user leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/teams
// @desc    Get team leaderboard
// @access  Private
router.get('/teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate('members', 'displayName totalScore')
      .populate('captain', 'displayName leetcodeUsername')
      .sort({ totalScore: -1 })
      .limit(50);

    const leaderboard = teams.map((team, index) => {
      // Calculate team score as sum of all member scores
      const teamScore = team.members.reduce((sum, member) => sum + member.totalScore, 0);
      
      return {
        rank: index + 1,
        id: team._id,
        name: team.name,
        totalScore: teamScore,
        memberCount: team.members.length,
        captain: {
          displayName: team.captain.displayName,
          leetcodeUsername: team.captain.leetcodeUsername
        },
        members: team.members.map(member => ({
          displayName: member.displayName,
          totalScore: member.totalScore
        }))
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get team leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/user/:userId
// @desc    Get specific user's rank and nearby users
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId)
      .select('displayName leetcodeUsername totalScore streak skillLevel');

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get users with higher scores
    const higherScoreCount = await User.countDocuments({
      totalScore: { $gt: targetUser.totalScore }
    });

    const userRank = higherScoreCount + 1;

    // Get nearby users (5 above and 5 below)
    const nearbyUsers = await User.find({})
      .select('displayName leetcodeUsername totalScore streak skillLevel avatar leetcodeData.userAvatar')
      .sort({ totalScore: -1 })
      .skip(Math.max(0, userRank - 6))
      .limit(11);

    const leaderboard = nearbyUsers.map((user, index) => ({
      rank: Math.max(1, userRank - 5) + index,
      id: user._id,
      displayName: user.displayName,
      leetcodeUsername: user.leetcodeUsername,
      totalScore: user.totalScore,
      streak: user.streak,
      skillLevel: user.skillLevel,
      avatar: user.avatar,
      leetcodeAvatar: user.leetcodeData?.userAvatar,
      isCurrentUser: user._id.equals(targetUser._id)
    }));

    res.json({
      userRank,
      leaderboard
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
