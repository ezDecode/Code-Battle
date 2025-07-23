const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  maxMembers: {
    type: Number,
    default: 4,
    max: 4
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate invite code before saving
teamSchema.pre('save', function(next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Check if team is full
teamSchema.methods.isFull = function() {
  return this.members.length >= this.maxMembers;
};

// Add member to team
teamSchema.methods.addMember = function(userId) {
  if (!this.isFull() && !this.members.includes(userId)) {
    this.members.push(userId);
    return true;
  }
  return false;
};

// Remove member from team
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => !member.equals(userId));
};

module.exports = mongoose.model('Team', teamSchema);
