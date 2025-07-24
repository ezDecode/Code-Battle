const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Challenge = require('../models/Challenge');
require('dotenv').config();

async function clearDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebattle', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get counts before deletion
    const userCount = await User.countDocuments();
    const teamCount = await Team.countDocuments();
    const challengeCount = await Challenge.countDocuments();

    console.log('📊 Current database state:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Teams: ${teamCount}`);
    console.log(`- Challenges: ${challengeCount}`);

    if (userCount === 0 && teamCount === 0 && challengeCount === 0) {
      console.log('Database is already empty');
      return;
    }

    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    
    // Clear all collections
    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users`);

    const teamResult = await Team.deleteMany({});
    console.log(`✅ Deleted ${teamResult.deletedCount} teams`);

    const challengeResult = await Challenge.deleteMany({});
    console.log(`✅ Deleted ${challengeResult.deletedCount} challenges`);

    // Verify all deletions
    const remainingUsers = await User.countDocuments();
    const remainingTeams = await Team.countDocuments();
    const remainingChallenges = await Challenge.countDocuments();

    console.log('\n📊 Final database state:');
    console.log(`- Users: ${remainingUsers}`);
    console.log(`- Teams: ${remainingTeams}`);
    console.log(`- Challenges: ${remainingChallenges}`);

    console.log('\n🎉 Database cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the script
clearDatabase();
