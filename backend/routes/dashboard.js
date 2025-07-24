const express = require('express');
const auth = require('../middleware/auth');
const leetcodeService = require('../services/leetcodeQueryService');
const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard data for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user; // Already populated by auth middleware

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare user stats with real data
    const userStats = {
      problemsSolved: user.leetcodeData?.submitStats?.easy + user.leetcodeData?.submitStats?.medium + user.leetcodeData?.submitStats?.hard || 0,
      successRate: 0, // TODO: Calculate from submission history
      currentStreak: user.streak || 0,
      weeklyProgress: 0, // TODO: Calculate weekly progress
      rank: user.leetcodeData?.ranking || 0,
      rating: user.totalScore || 0,
      recentSolves: [] // TODO: Get from LeetCode API recent submissions
    };

    // Fetch today's LeetCode daily challenge
    let dailyChallenge = null;
    try {
      const dailyProblem = await leetcodeService.getDailyProblem();
      dailyChallenge = {
        id: dailyProblem.question.titleSlug,
        title: dailyProblem.question.title,
        difficulty: dailyProblem.question.difficulty,
        description: dailyProblem.question.content?.replace(/<[^>]*>/g, '').substring(0, 200) + '...', // Strip HTML and truncate
        link: dailyProblem.link,
        date: dailyProblem.date,
        topicTags: dailyProblem.question.topicTags || [],
        completed: false, // TODO: Check if user has solved this problem
        points: dailyProblem.question.difficulty === 'Easy' ? 100 : 
                dailyProblem.question.difficulty === 'Medium' ? 200 : 300
      };
    } catch (error) {
      console.error('Failed to fetch daily LeetCode problem:', error);
      // Fallback to default challenge
      dailyChallenge = {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        completed: false,
        points: 100
      };
    }

    // Get dashboard data
    const dashboardData = {
      dailyChallenge,
      teamMembers: [],
      leaderboard: [
        {
          id: user._id,
          name: user.displayName || user.name,
          score: user.totalScore || 0,
          rank: 1,
          leetcodeUsername: user.leetcodeUsername
        }
      ],
      userStats
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

module.exports = router;
