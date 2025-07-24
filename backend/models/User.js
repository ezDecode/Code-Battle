const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic fields
  leetcodeUsername: {
    type: String,
    trim: true,
    sparse: true // Allow null/undefined for OAuth users during onboarding
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // OAuth fields
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  githubId: {
    type: String,
    sparse: true,
    unique: true
  },
  githubUsername: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Profile fields
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  totalScore: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // LeetCode integration
  leetcodeData: {
    ranking: Number,
    userAvatar: String,
    realName: String,
    submitStats: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 }
    }
  },
  
  // OAuth completion tracking
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving (skip for OAuth users with placeholder passwords)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Skip hashing for OAuth placeholder passwords
  if (this.password === 'oauth-user') {
    this.isOAuthUser = true;
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  // OAuth users cannot login with password
  if (this.isOAuthUser) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user needs to complete onboarding
userSchema.methods.needsOnboarding = function() {
  return this.isOAuthUser && (!this.leetcodeUsername || !this.onboardingCompleted);
};

module.exports = mongoose.model('User', userSchema);
