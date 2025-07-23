const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'CodeBattle API is running!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/leetcode', require('./routes/leetcode'));

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
    console.log('📝 Server will continue running without database connection');

    // For demo purposes, we'll continue without DB
    // In production, you might want to exit the process
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
