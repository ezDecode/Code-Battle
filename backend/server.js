const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

// Import passport AFTER dotenv is configured
const passport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session middleware (required for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'CodeBattle API is running!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/daily-challenge', require('./routes/dailyChallenge'));

// MongoDB connection
const connectDB = async () => {
  try {
    // Try MongoDB Atlas first
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb+srv://your-username:your-password@cluster.mongodb.net/codebattle?retryWrites=true&w=majority') {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Atlas connected successfully');
    } else {
      // Fallback to local MongoDB for development
      await mongoose.connect('mongodb://localhost:27017/codebattle');
      console.log('✅ Local MongoDB connected successfully');
    }
  } catch (err) {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('💡 Please set up MongoDB Atlas or install MongoDB locally');
    console.log('📝 Application requires MongoDB to function properly');
    
    // Exit the process since we now require MongoDB
    process.exit(1);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`📱 Frontend expected at ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
