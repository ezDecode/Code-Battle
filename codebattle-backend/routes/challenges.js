const express = require('express');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/challenges
// @desc    Get user's challenges
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({ userId: req.userId })
      .sort({ assignedAt: -1 })
      .limit(10);

    res.json(challenges);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/challenges/current
// @desc    Get current active challenge
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      userId: req.userId,
      isCompleted: false
    }).sort({ assignedAt: -1 });

    if (!challenge) {
      return res.status(404).json({ message: 'No active challenge found' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Get current challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/challenges/:challengeId/complete
// @desc    Mark challenge as completed
// @access  Private
router.post('/:challengeId/complete', auth, async (req, res) => {
  try {
    const { submissionDetails } = req.body;
    
    const challenge = await Challenge.findOne({
      _id: req.params.challengeId,
      userId: req.userId
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.isCompleted) {
      return res.status(400).json({ message: 'Challenge already completed' });
    }

    // Mark as completed and calculate points
    const totalPoints = challenge.markCompleted(submissionDetails);
    await challenge.save();

    // Update user's total score
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalScore: totalPoints }
    });

    res.json({
      message: 'Challenge completed successfully',
      challenge,
      pointsEarned: totalPoints
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/challenges/history
// @desc    Get challenge history (last 7 days)
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const challenges = await Challenge.find({
      userId: req.userId,
      assignedAt: { $gte: sevenDaysAgo }
    }).sort({ assignedAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error('Get challenge history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
