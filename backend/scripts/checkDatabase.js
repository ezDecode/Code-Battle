const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Challenge = require('../models/Challenge');
require('dotenv').config();

async function checkDatabaseState() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebattle');

    console.log('Connected to MongoDB');

    // Get all collection counts
    const userCount = await User.countDocuments();
    const teamCount = await Team.countDocuments();
    const challengeCount = await Challenge.countDocuments();

    console.log('📊 Current Database State:');
    console.log('==========================');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏆 Teams: ${teamCount}`);
    console.log(`🎯 Challenges: ${challengeCount}`);
    console.log('==========================');

    // If there are any users, show a sample
    if (userCount > 0) {
      console.log('\n📋 Sample Users:');
      const sampleUsers = await User.find({}).select('name email leetcodeUsername').limit(5);
      sampleUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - LeetCode: ${user.leetcodeUsername || 'N/A'}`);
      });
    }

    // If there are any teams, show a sample
    if (teamCount > 0) {
      console.log('\n🏆 Sample Teams:');
      const sampleTeams = await Team.find({}).select('name description members').limit(5);
      sampleTeams.forEach((team, index) => {
        console.log(`${index + 1}. ${team.name} - ${team.members?.length || 0} members`);
      });
    }

    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

checkDatabaseState();
