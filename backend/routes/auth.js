const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const mockDB = require('../utils/mockDB');
const mongoose = require('mongoose');
const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { leetcodeUsername, displayName, email, password } = req.body;

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({
        $or: [{ email }, { leetcodeUsername }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this email or LeetCode username'
        });
      }

      const user = new User({
        leetcodeUsername,
        displayName,
        email,
        password
      });

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
          streak: user.streak
        }
      });
    } else {
      // Use Mock Database
      const existingUser = mockDB.findUserByEmail(email) || mockDB.findUserByLeetcodeUsername(leetcodeUsername);

      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this email or LeetCode username'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = mockDB.createUser({
        leetcodeUsername,
        displayName,
        email,
        password: hashedPassword
      });

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
          streak: user.streak
        }
      });
    }
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

    if (isMongoConnected()) {
      // Use MongoDB
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
    } else {
      // Use Mock Database
      const user = mockDB.findUserByEmail(email);

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // For demo purposes, allow 'demo' as password or check hashed password
      let isMatch = false;
      if (password === 'demo' && email === 'demo@codebattle.com') {
        isMatch = true;
      } else {
        isMatch = await bcrypt.compare(password, user.password);
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Update last active
      mockDB.updateUser(user._id, { lastActive: new Date() });

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
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
