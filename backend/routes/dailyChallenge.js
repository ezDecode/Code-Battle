const express = require('express');
const auth = require('../middleware/auth');
const leetcodeService = require('../services/leetcodeQueryService');
const router = express.Router();

// @route   GET /api/daily-challenge
// @desc    Get today's LeetCode daily challenge
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const dailyProblem = await leetcodeService.getDailyProblem();
    
    const dailyChallenge = {
      id: dailyProblem.question.titleSlug,
      title: dailyProblem.question.title,
      difficulty: dailyProblem.question.difficulty,
      description: dailyProblem.question.content?.replace(/<[^>]*>/g, '').substring(0, 300) + '...', // Strip HTML and truncate
      link: dailyProblem.link,
      date: dailyProblem.date,
      topicTags: dailyProblem.question.topicTags || [],
      exampleTestcases: dailyProblem.question.exampleTestcases,
      points: dailyProblem.question.difficulty === 'Easy' ? 100 : 
              dailyProblem.question.difficulty === 'Medium' ? 200 : 300,
      completed: false, // TODO: Check if user has solved this problem
      fetchedAt: new Date()
    };

    res.json(dailyChallenge);
  } catch (error) {
    console.error('Failed to fetch daily LeetCode problem:', error);
    res.status(500).json({ 
      message: 'Failed to fetch daily challenge',
      error: error.message 
    });
  }
});

// @route   GET /api/daily-challenge/status/:titleSlug
// @desc    Check if user has completed a specific problem
// @access  Private
router.get('/status/:titleSlug', auth, async (req, res) => {
  try {
    const { titleSlug } = req.params;
    const user = req.user;
    
    if (!user.leetcodeUsername) {
      return res.json({ completed: false, message: 'No LeetCode username found' });
    }

    // TODO: Implement checking if user has solved the specific problem
    // This would require additional API calls to check user's submission history
    // For now, return false
    res.json({ 
      completed: false,
      titleSlug,
      message: 'Problem completion checking not yet implemented'
    });
  } catch (error) {
    console.error('Failed to check problem status:', error);
    res.status(500).json({ 
      message: 'Failed to check problem status',
      error: error.message 
    });
  }
});

module.exports = router;
