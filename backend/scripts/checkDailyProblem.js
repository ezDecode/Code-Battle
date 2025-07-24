const leetcodeService = require('../services/leetcodeQueryService');

/**
 * Quick health check for daily problem fetching
 * This is a simplified version for quick testing
 */
async function quickCheck() {
  try {
    console.log('🚀 Quick Daily Problem Health Check...');
    
    const dailyProblem = await leetcodeService.getDailyProblem();
    
    console.log('✅ SUCCESS!');
    console.log(`📅 Date: ${dailyProblem.date}`);
    console.log(`📝 Title: ${dailyProblem.question.title}`);
    console.log(`💪 Difficulty: ${dailyProblem.question.difficulty}`);
    console.log(`🔗 Link: ${dailyProblem.link}`);
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }
}

// Run if executed directly
if (require.main === module) {
  quickCheck().then(() => process.exit(0));
}

module.exports = { quickCheck };
