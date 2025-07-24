require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Challenge = require('../models/Challenge');

/**
 * Master Database Cleanup Script
 * 
 * This script completely wipes ALL data from your MongoDB database:
 * - All Users (including LeetCode usernames, emails, passwords, etc.)
 * - All Teams (team names, members, scores, etc.)
 * - All Challenges (daily challenges, custom challenges, etc.)
 * - All user statistics and scores
 * 
 * ⚠️  WARNING: This will permanently delete ALL your application data!
 * 
 * Usage: node scripts/masterCleanup.js [--confirm]
 * 
 * Options:
 *   --confirm     Skip confirmation prompt (for automated scripts)
 *   --dry-run     Show what would be deleted without actually deleting
 *   --help        Show this help message
 */

const args = process.argv.slice(2);
const skipConfirmation = args.includes('--confirm');
const isDryRun = args.includes('--dry-run');

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function getDatabaseStats() {
  try {
    const stats = {
      users: await User.countDocuments(),
      teams: await Team.countDocuments(),
      challenges: await Challenge.countDocuments(),
      collections: []
    };
    
    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    stats.collections = collections.map(col => ({
      name: col.name,
      count: 0 // We'll get counts for known collections only
    }));
    
    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error.message);
    return { users: 0, teams: 0, challenges: 0, collections: [] };
  }
}

async function displayCurrentState() {
  console.log('📊 Current Database State:');
  console.log('==========================');
  
  const stats = await getDatabaseStats();
  
  console.log(`👥 Users: ${stats.users}`);
  console.log(`🏆 Teams: ${stats.teams}`);
  console.log(`🎯 Challenges: ${stats.challenges}`);
  
  if (stats.collections.length > 0) {
    console.log('\n📁 All Collections:');
    stats.collections.forEach(col => {
      console.log(`   • ${col.name}`);
    });
  }
  
  const totalRecords = stats.users + stats.teams + stats.challenges;
  console.log(`\n📈 Total Records: ${totalRecords}`);
  
  if (totalRecords === 0) {
    console.log('\n✨ Database is already empty!');
    return false;
  }
  
  return true;
}

async function performCleanup() {
  console.log('\n🚀 Starting complete database cleanup...\n');
  
  const results = {
    users: 0,
    teams: 0,
    challenges: 0,
    errors: []
  };
  
  try {
    // Step 1: Delete all users
    console.log('1️⃣  Removing all users...');
    const userResult = await User.deleteMany({});
    results.users = userResult.deletedCount;
    console.log(`   ✅ Deleted ${results.users} users`);
    
    // Step 2: Delete all teams
    console.log('2️⃣  Removing all teams...');
    const teamResult = await Team.deleteMany({});
    results.teams = teamResult.deletedCount;
    console.log(`   ✅ Deleted ${results.teams} teams`);
    
    // Step 3: Delete all challenges
    console.log('3️⃣  Removing all challenges...');
    const challengeResult = await Challenge.deleteMany({});
    results.challenges = challengeResult.deletedCount;
    console.log(`   ✅ Deleted ${results.challenges} challenges`);
    
    // Step 4: Clean up any other collections (sessions, etc.)
    console.log('4️⃣  Cleaning up system collections...');
    try {
      // Clear sessions if they exist
      const collections = await mongoose.connection.db.listCollections().toArray();
      const sessionCollection = collections.find(col => col.name.includes('session'));
      if (sessionCollection) {
        await mongoose.connection.db.collection(sessionCollection.name).deleteMany({});
        console.log(`   ✅ Cleared session data`);
      }
      
      // Clear any other temporary collections
      const tempCollections = collections.filter(col => 
        col.name.includes('temp') || 
        col.name.includes('cache') ||
        col.name.includes('log')
      );
      
      for (const tempCol of tempCollections) {
        await mongoose.connection.db.collection(tempCol.name).deleteMany({});
        console.log(`   ✅ Cleared ${tempCol.name}`);
      }
      
    } catch (cleanupError) {
      console.log(`   ⚠️  Some system collections couldn't be cleaned: ${cleanupError.message}`);
    }
    
  } catch (error) {
    results.errors.push(error.message);
    console.error(`❌ Error during cleanup: ${error.message}`);
    throw error;
  }
  
  return results;
}

async function verifyCleanup() {
  console.log('\n🔍 Verifying cleanup...');
  
  const afterStats = await getDatabaseStats();
  const totalRemaining = afterStats.users + afterStats.teams + afterStats.challenges;
  
  console.log('\n📊 Final Database State:');
  console.log('========================');
  console.log(`👥 Users: ${afterStats.users}`);
  console.log(`🏆 Teams: ${afterStats.teams}`);
  console.log(`🎯 Challenges: ${afterStats.challenges}`);
  console.log(`📈 Total Records: ${totalRemaining}`);
  
  if (totalRemaining === 0) {
    console.log('\n🎉 SUCCESS! Database completely cleaned!');
    console.log('   All user data, teams, and challenges have been removed.');
    console.log('   You can now test your application with fresh data.');
    return true;
  } else {
    console.log('\n⚠️  WARNING: Some data may still remain in the database.');
    return false;
  }
}

async function confirmAction() {
  if (skipConfirmation || isDryRun) {
    return true;
  }
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    const message = `
⚠️  DANGER: This will permanently delete ALL data in your database!

This includes:
• All user accounts (usernames, emails, passwords, LeetCode IDs)
• All teams and team memberships
• All challenges and submissions
• All scores and statistics
• All application data

This action CANNOT be undone!

Are you absolutely sure you want to continue? (type "DELETE ALL DATA" to confirm): `;
    
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer === 'DELETE ALL DATA');
    });
  });
}

async function showHelp() {
  console.log('Master Database Cleanup Script');
  console.log('==============================\n');
  console.log('This script permanently deletes ALL data from your MongoDB database.\n');
  console.log('Usage: node scripts/masterCleanup.js [options]\n');
  console.log('Options:');
  console.log('  --dry-run    Show what would be deleted without actually deleting');
  console.log('  --confirm    Skip confirmation prompt (for automated use)');
  console.log('  --help       Show this help message\n');
  console.log('Examples:');
  console.log('  node scripts/masterCleanup.js --dry-run    # See what would be deleted');
  console.log('  node scripts/masterCleanup.js              # Interactive cleanup');
  console.log('  node scripts/masterCleanup.js --confirm    # Cleanup without prompts\n');
  console.log('⚠️  WARNING: This will delete ALL your application data!');
}

async function main() {
  try {
    // Show help if requested
    if (args.includes('--help') || args.includes('-h')) {
      await showHelp();
      process.exit(0);
    }
    
    console.log('🧹 Code Battle - Master Database Cleanup');
    console.log('=========================================');
    
    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No data will be deleted\n');
    } else {
      console.log('⚠️  This will permanently delete ALL database content!\n');
    }
    
    await connectToDatabase();
    
    // Show current state
    const hasData = await displayCurrentState();
    
    if (!hasData) {
      console.log('\nNothing to clean up. Exiting.');
      return;
    }
    
    if (isDryRun) {
      console.log('\n🗂️  DRY RUN: Would delete all the data shown above.');
      console.log('Run without --dry-run to actually perform the cleanup.');
      return;
    }
    
    // Confirm action
    const confirmed = await confirmAction();
    if (!confirmed) {
      console.log('\n❌ Operation cancelled. No data was deleted.');
      process.exit(0);
    }
    
    // Perform cleanup
    const results = await performCleanup();
    
    // Verify results
    const success = await verifyCleanup();
    
    if (success) {
      console.log('\n✨ Database cleanup completed successfully!');
      console.log('   You can now test your application with clean data.');
    }
    
  } catch (error) {
    console.error('\n💥 Cleanup failed:', error.message);
    console.error('Some data may not have been deleted properly.');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Operation cancelled by user');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main();
