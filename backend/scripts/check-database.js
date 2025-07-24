const mongoose = require('mongoose');
require('dotenv').config();

// Import your models
const User = require('../models/User');
const Team = require('../models/Team');
const Challenge = require('../models/Challenge');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-battle';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);
    console.log('📊 Database Name:', mongoose.connection.name);
    
    // Get database instance
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Available Collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    console.log('\n📊 Document Counts:');
    
    // Check Users collection
    try {
      const userCount = await User.countDocuments();
      console.log(`  👥 Users: ${userCount} documents`);
      
      if (userCount > 0) {
        const sampleUser = await User.findOne().select('name email leetcodeUsername').lean();
        console.log('    Sample User:', {
          name: sampleUser?.name || 'N/A',
          email: sampleUser?.email || 'N/A',
          leetcodeUsername: sampleUser?.leetcodeUsername || 'N/A'
        });
      }
    } catch (error) {
      console.log('  👥 Users: Error -', error.message);
    }
    
    // Check Teams collection
    try {
      const teamCount = await Team.countDocuments();
      console.log(`  🏆 Teams: ${teamCount} documents`);
      
      if (teamCount > 0) {
        const sampleTeam = await Team.findOne().select('name members').populate('members', 'name').lean();
        console.log('    Sample Team:', {
          name: sampleTeam?.name || 'N/A',
          memberCount: sampleTeam?.members?.length || 0
        });
      }
    } catch (error) {
      console.log('  🏆 Teams: Error -', error.message);
    }
    
    // Check Challenges collection
    try {
      const challengeCount = await Challenge.countDocuments();
      console.log(`  🎯 Challenges: ${challengeCount} documents`);
      
      if (challengeCount > 0) {
        const sampleChallenge = await Challenge.findOne().select('title difficulty points').lean();
        console.log('    Sample Challenge:', {
          title: sampleChallenge?.title || 'N/A',
          difficulty: sampleChallenge?.difficulty || 'N/A',
          points: sampleChallenge?.points || 'N/A'
        });
      }
    } catch (error) {
      console.log('  🎯 Challenges: Error -', error.message);
    }
    
    // Check for any other collections
    console.log('\n🔍 Raw Collection Counts:');
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`  - ${collection.name}: Error - ${error.message}`);
      }
    }
    
    // Database connection info
    console.log('\n🔧 Connection Info:');
    console.log(`  - Host: ${mongoose.connection.host}`);
    console.log(`  - Port: ${mongoose.connection.port}`);
    console.log(`  - Database: ${mongoose.connection.name}`);
    console.log(`  - Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    console.log('\n✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Additional function to check specific data integrity
async function checkDataIntegrity() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/code-battle');
    
    console.log('\n🔍 Data Integrity Checks:');
    
    // Check for users without required fields
    const usersWithoutEmail = await User.countDocuments({ email: { $exists: false } });
    const usersWithoutName = await User.countDocuments({ name: { $exists: false } });
    console.log(`  - Users without email: ${usersWithoutEmail}`);
    console.log(`  - Users without name: ${usersWithoutName}`);
    
    // Check for teams without captains
    const teamsWithoutCaptain = await Team.countDocuments({ captain: { $exists: false } });
    console.log(`  - Teams without captain: ${teamsWithoutCaptain}`);
    
    // Check for orphaned team members
    const teams = await Team.find().populate('members');
    let orphanedMembers = 0;
    for (const team of teams) {
      const invalidMembers = team.members.filter(member => !member);
      orphanedMembers += invalidMembers.length;
    }
    console.log(`  - Orphaned team members: ${orphanedMembers}`);
    
  } catch (error) {
    console.error('❌ Data integrity check failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the checks
console.log('🚀 Starting MongoDB Database Check...\n');
checkDatabase().then(() => {
  // Uncomment the line below to also run integrity checks
  // checkDataIntegrity();
});
