const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/teams/check-name/:name
// @desc    Check if team name is available
// @access  Private
router.get('/check-name/:name', auth, async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name || name.trim().length < 3) {
      return res.json({ available: false, message: 'Team name must be at least 3 characters' });
    }
    
    const existingTeam = await Team.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    res.json({ 
      available: !existingTeam,
      message: existingTeam ? 'Team name already exists' : 'Team name is available'
    });
  } catch (error) {
    console.error('Check team name error:', error);
    res.status(500).json({ available: false, message: 'Server error' });
  }
});

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

// @route   GET /api/teams/:teamId
// @desc    Get specific team details
// @access  Private
router.get('/:teamId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('members', 'displayName leetcodeUsername totalScore skillLevel streak lastActive')
      .populate('captain', 'displayName leetcodeUsername');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if team is public or user is a member
    const user = await User.findById(req.userId);
    if (!team.isPublic && !team.members.some(member => member._id.equals(req.userId))) {
      return res.status(403).json({ message: 'Access denied to private team' });
    }

    res.json(team);
  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/teams/:teamId
// @desc    Update team details (Captain only)
// @access  Private
router.put('/:teamId', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the captain
    if (!team.captain.equals(req.userId)) {
      return res.status(403).json({ message: 'Only team captain can update team details' });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ name, _id: { $ne: team._id } });
      if (existingTeam) {
        return res.status(400).json({ message: 'Team name already exists' });
      }
      team.name = name;
    }

    // Update other fields
    if (description !== undefined) team.description = description;
    if (isPublic !== undefined) team.isPublic = isPublic;

    await team.save();
    await team.populate('members', 'displayName leetcodeUsername totalScore');
    await team.populate('captain', 'displayName leetcodeUsername');

    res.json({
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/teams/:teamId
// @desc    Delete team (Captain only)
// @access  Private
router.delete('/:teamId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the captain
    if (!team.captain.equals(req.userId)) {
      return res.status(403).json({ message: 'Only team captain can delete the team' });
    }

    // Remove team reference from all members
    await User.updateMany(
      { _id: { $in: team.members } },
      { $unset: { teamId: 1 } }
    );

    // Delete the team
    await Team.findByIdAndDelete(req.params.teamId);

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teams/:teamId/invite
// @desc    Invite member by LeetCode username
// @access  Private
router.post('/:teamId/invite', auth, async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    
    if (!leetcodeUsername) {
      return res.status(400).json({ message: 'LeetCode username is required' });
    }

    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the captain
    if (!team.captain.equals(req.userId)) {
      return res.status(403).json({ message: 'Only team captain can invite members' });
    }

    // Check if team is full
    if (team.isFull()) {
      return res.status(400).json({ message: 'Team is full' });
    }

    // Verify LeetCode username exists
    const leetcodeService = require('../services/leetcodeQueryService');
    const isValidLeetCode = await leetcodeService.verifyUsername(leetcodeUsername);
    
    if (!isValidLeetCode) {
      return res.status(404).json({ message: 'LeetCode username not found' });
    }

    // Find user with this LeetCode username
    const targetUser = await User.findOne({ leetcodeUsername });
    
    if (!targetUser) {
      return res.status(404).json({ 
        message: 'No user found with this LeetCode username in our platform' 
      });
    }

    // Check if user is already in a team
    if (targetUser.teamId) {
      return res.status(400).json({ message: 'User is already in a team' });
    }

    // Check if user is already in this team
    if (team.members.includes(targetUser._id)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Add user to team
    team.addMember(targetUser._id);
    await team.save();

    // Update user's team reference
    targetUser.teamId = team._id;
    await targetUser.save();

    await team.populate('members', 'displayName leetcodeUsername totalScore');
    await team.populate('captain', 'displayName leetcodeUsername');

    res.json({
      message: `Successfully invited ${leetcodeUsername} to the team`,
      team,
      invitedUser: {
        id: targetUser._id,
        displayName: targetUser.displayName,
        leetcodeUsername: targetUser.leetcodeUsername
      }
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teams/:teamId/remove-member
// @desc    Remove member from team (Captain only)
// @access  Private
router.post('/:teamId/remove-member', auth, async (req, res) => {
  try {
    const { memberId } = req.body;
    
    if (!memberId) {
      return res.status(400).json({ message: 'Member ID is required' });
    }

    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the captain
    if (!team.captain.equals(req.userId)) {
      return res.status(403).json({ message: 'Only team captain can remove members' });
    }

    // Cannot remove the captain
    if (team.captain.equals(memberId)) {
      return res.status(400).json({ message: 'Cannot remove team captain' });
    }

    // Check if member exists in team
    if (!team.members.includes(memberId)) {
      return res.status(400).json({ message: 'User is not a member of this team' });
    }

    // Remove member from team
    team.removeMember(memberId);
    await team.save();

    // Update user's team reference
    await User.findByIdAndUpdate(memberId, { $unset: { teamId: 1 } });

    await team.populate('members', 'displayName leetcodeUsername totalScore');
    await team.populate('captain', 'displayName leetcodeUsername');

    res.json({
      message: 'Member removed successfully',
      team
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/teams/members
// @desc    Get current user's team members
// @access  Private
router.get('/members', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.teamId) {
      return res.status(404).json({ message: 'You are not in a team' });
    }

    const team = await Team.findById(user.teamId)
      .populate('members', 'displayName leetcodeUsername totalScore skillLevel streak lastActive')
      .populate('captain', 'displayName leetcodeUsername');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({
      team,
      members: team.members
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
