const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  problemTitle: {
    type: String,
    required: true
  },
  problemUrl: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  points: {
    type: Number,
    default: 0
  },
  bonusPoints: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  submissionDetails: {
    runtime: String,
    memory: String,
    language: String,
    submissionTime: Date
  },
  timeToComplete: {
    type: Number, // in minutes
    default: null
  }
}, {
  timestamps: true
});

// Calculate points based on difficulty
challengeSchema.methods.calculatePoints = function() {
  const basePoints = {
    'Easy': 1,
    'Medium': 3,
    'Hard': 5
  };
  
  this.points = basePoints[this.difficulty] || 0;
  
  // Add bonus points if completed within 2 hours
  if (this.completedAt && this.assignedAt) {
    const timeDiff = (this.completedAt - this.assignedAt) / (1000 * 60); // minutes
    this.timeToComplete = Math.round(timeDiff);
    
    if (timeDiff <= 120) { // 2 hours
      this.bonusPoints = 1;
    }
  }
  
  return this.points + this.bonusPoints;
};

// Mark challenge as completed
challengeSchema.methods.markCompleted = function(submissionDetails = {}) {
  this.isCompleted = true;
  this.completedAt = new Date();
  this.submissionDetails = submissionDetails;
  return this.calculatePoints();
};

// Check if challenge is expired (more than 24 hours old)
challengeSchema.methods.isExpired = function() {
  const now = new Date();
  const timeDiff = (now - this.assignedAt) / (1000 * 60 * 60); // hours
  return timeDiff > 24;
};

// Index for efficient queries
challengeSchema.index({ userId: 1, assignedAt: -1 });
challengeSchema.index({ isCompleted: 1, assignedAt: -1 });

module.exports = mongoose.model('Challenge', challengeSchema);
