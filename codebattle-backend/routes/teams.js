const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    // Check if user is already in a team
    const user = await User.findById(req.userId);
    if (user.teamId) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Create new team
    const team = new Team({
      name,
      description: description || '',
      captain: req.userId,
      members: [req.userId],
      isPublic: isPublic !== false
    });

    await team.save();

    // Update user's team reference
    user.teamId = team._id;
    await user.save();

    await team.populate('members', 'displayName leetcodeUsername totalScore');
    await team.populate('captain', 'displayName leetcodeUsername');

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/teams
// @desc    Get all public teams
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({ isPublic: true })
      .populate('members', 'displayName leetcodeUsername totalScore')
      .populate('captain', 'displayName leetcodeUsername')
      .sort({ totalScore: -1 });

    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teams/join/:teamId
// @desc    Join a team
// @access  Private
router.post('/join/:teamId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.teamId) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.isFull()) {
      return res.status(400).json({ message: 'Team is full' });
    }

    // Add user to team
    team.addMember(req.userId);
    await team.save();

    // Update user's team reference
    user.teamId = team._id;
    await user.save();

    await team.populate('members', 'displayName leetcodeUsername totalScore');
    await team.populate('captain', 'displayName leetcodeUsername');

    res.json({
      message: 'Successfully joined team',
      team
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teams/leave
// @desc    Leave current team
// @access  Private
router.post('/leave', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.teamId) {
      return res.status(400).json({ message: 'You are not in a team' });
    }

    const team = await Team.findById(user.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Remove user from team
    team.removeMember(req.userId);
    
    // If user was captain and team still has members, assign new captain
    if (team.captain.equals(req.userId) && team.members.length > 0) {
      team.captain = team.members[0];
    }

    // If team is empty, delete it
    if (team.members.length === 0) {
      await Team.findByIdAndDelete(team._id);
    } else {
      await team.save();
    }

    // Update user's team reference
    user.teamId = null;
    await user.save();

    res.json({ message: 'Successfully left team' });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
