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
      rating: user.totalScore || 0
    };

    // Fetch today's LeetCode daily challenge
    let dailyChallenge = null;
    try {
      console.log('📡 Fetching today\'s LeetCode daily challenge...');
      const startTime = Date.now();
      
      const dailyProblem = await leetcodeService.getDailyProblem();
      
      const fetchTime = Date.now() - startTime;
      console.log(`✅ Daily challenge fetched in ${fetchTime}ms`);
      
      // Enhanced daily challenge object with more details
      dailyChallenge = {
        id: dailyProblem.question.titleSlug,
        title: dailyProblem.question.title,
        difficulty: dailyProblem.question.difficulty,
        description: dailyProblem.question.content 
          ? dailyProblem.question.content.replace(/<[^>]*>/g, '').substring(0, 300) + '...' 
          : 'Click to view the full problem description on LeetCode.',
        link: `https://leetcode.com${dailyProblem.link}`, // Full URL for external access
        date: dailyProblem.date,
        topicTags: dailyProblem.question.topicTags || [],
        exampleTestcases: dailyProblem.question.exampleTestcases,
        completed: false, // TODO: Check if user has solved this problem
        points: dailyProblem.question.difficulty === 'Easy' ? 100 : 
                dailyProblem.question.difficulty === 'Medium' ? 200 : 300,
        fetchedAt: new Date().toISOString(),
        // Additional metadata
        isToday: dailyProblem.date === new Date().toISOString().split('T')[0],
        topicCount: dailyProblem.question.topicTags?.length || 0
      };
      
      console.log(`📝 Today's challenge: "${dailyChallenge.title}" (${dailyChallenge.difficulty})`);
      
    } catch (error) {
      console.error('❌ Failed to fetch daily LeetCode problem:', error.message);
      
      // Enhanced fallback with today's date
      dailyChallenge = {
        id: 'two-sum',
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        link: "https://leetcode.com/problems/two-sum/",
        date: new Date().toISOString().split('T')[0],
        topicTags: [
          { name: "Array", slug: "array" },
          { name: "Hash Table", slug: "hash-table" }
        ],
        completed: false,
        points: 100,
        fetchedAt: new Date().toISOString(),
        isFallback: true,
        isToday: true,
        topicCount: 2,
        fallbackReason: error.message
      };
      
      console.log('🔄 Using fallback challenge: Two Sum');
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
