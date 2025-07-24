const mongoose = require('mongoose');
const User = require('../models/User');
const leetcodeService = require('../services/leetcodeQueryService');
require('dotenv').config();

async function syncExistingUserLeetCodeData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebattle', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find users with LeetCode usernames but missing LeetCode data
    const users = await User.find({
      leetcodeUsername: { $exists: true, $ne: null },
      $or: [
        { leetcodeData: { $exists: false } },
        { 'leetcodeData.totalSolved': { $exists: false } },
        { 'leetcodeData.totalSolved': 0 },
        { submitStats: { $exists: false } },
        { 'submitStats.easy': 0, 'submitStats.medium': 0, 'submitStats.hard': 0 }
      ]
    });

    console.log(`Found ${users.length} users that need LeetCode data sync`);

    if (users.length === 0) {
      console.log('No users need LeetCode data sync');
      return;
    }

    for (const user of users) {
      try {
        console.log(`\nSyncing LeetCode data for user: ${user.displayName} (${user.leetcodeUsername})`);
        
        // Fetch comprehensive LeetCode data
        const leetcodeData = await leetcodeService.getComprehensiveUserData(user.leetcodeUsername);
        
        // Prepare updates
        const updates = {
          skillLevel: leetcodeData.skillLevel,
          submitStats: {
            easy: leetcodeData.solvedStats.easySolved,
            medium: leetcodeData.solvedStats.mediumSolved,
            hard: leetcodeData.solvedStats.hardSolved
          },
          leetcodeData: {
            ranking: leetcodeData.profile.ranking,
            userAvatar: leetcodeData.profile.avatar,
            realName: leetcodeData.profile.name,
            submitStats: {
              easy: leetcodeData.solvedStats.easySolved,
              medium: leetcodeData.solvedStats.mediumSolved,
              hard: leetcodeData.solvedStats.hardSolved
            },
            totalSolved: leetcodeData.solvedStats.totalSolved,
            contestInfo: leetcodeData.contestInfo,
            streak: leetcodeData.calendar.streak || 0,
            lastSyncAt: new Date()
          },
          streak: leetcodeData.calendar.streak || 0,
          lastActive: new Date()
        };

        // Update user in database
        await User.findByIdAndUpdate(user._id, updates);
        
        console.log(`✅ Successfully synced data for ${user.displayName}:`);
        console.log(`   - Total Solved: ${leetcodeData.solvedStats.totalSolved}`);
        console.log(`   - Easy: ${leetcodeData.solvedStats.easySolved}`);
        console.log(`   - Medium: ${leetcodeData.solvedStats.mediumSolved}`);
        console.log(`   - Hard: ${leetcodeData.solvedStats.hardSolved}`);
        console.log(`   - Skill Level: ${leetcodeData.skillLevel}`);
        console.log(`   - Ranking: ${leetcodeData.profile.ranking}`);
        console.log(`   - Streak: ${leetcodeData.calendar.streak || 0}`);

        // Add a small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (userError) {
        console.error(`❌ Error syncing data for ${user.displayName} (${user.leetcodeUsername}):`, userError.message);
        
        // If username is invalid, we might want to clear it or flag it
        if (userError.message.includes('not found')) {
          console.log(`   Username "${user.leetcodeUsername}" appears to be invalid`);
        }
      }
    }

    console.log('\n✅ LeetCode data sync completed');

  } catch (error) {
    console.error('❌ Error during LeetCode data sync:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the script
syncExistingUserLeetCodeData();
