const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function clearAllUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebattle', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Count users before deletion
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);

    if (userCount === 0) {
      console.log('No users to delete');
      return;
    }

    // Ask for confirmation (in a real scenario, you'd want this)
    console.log('⚠️  WARNING: This will delete ALL users from the database!');
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} users from the database`);
    
    // Verify deletion
    const remainingUsers = await User.countDocuments();
    console.log(`Remaining users: ${remainingUsers}`);

  } catch (error) {
    console.error('❌ Error clearing users:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the script
clearAllUsers();
