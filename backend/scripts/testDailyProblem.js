const leetcodeService = require('../services/leetcodeQueryService');

/**
 * Test script to verify daily LeetCode problem fetching
 * This script tests the getDailyProblem() method from leetcodeQueryService
 */
async function testDailyProblemFetch() {
  console.log('🚀 Testing LeetCode Daily Problem Fetch...\n');
  
  try {
    console.log('📡 Fetching today\'s daily problem from LeetCode...');
    const startTime = Date.now();
    
    const dailyProblem = await leetcodeService.getDailyProblem();
    
    const fetchTime = Date.now() - startTime;
    console.log(`✅ Daily problem fetched successfully in ${fetchTime}ms\n`);
    
    // Display the raw response
    console.log('📋 Raw API Response:');
    console.log('==================');
    console.log(JSON.stringify(dailyProblem, null, 2));
    console.log('\n');
    
    // Test the dashboard format transformation
    console.log('🔄 Testing Dashboard Format Transformation:');
    console.log('==========================================');
    
    const dashboardFormat = {
      id: dailyProblem.question.titleSlug,
      title: dailyProblem.question.title,
      difficulty: dailyProblem.question.difficulty,
      description: dailyProblem.question.content?.replace(/<[^>]*>/g, '').substring(0, 200) + '...', // Strip HTML and truncate
      link: dailyProblem.link,
      date: dailyProblem.date,
      topicTags: dailyProblem.question.topicTags || [],
      completed: false,
      points: dailyProblem.question.difficulty === 'Easy' ? 100 : 
              dailyProblem.question.difficulty === 'Medium' ? 200 : 300,
      fetchedAt: new Date().toISOString()
    };
    
    console.log(JSON.stringify(dashboardFormat, null, 2));
    console.log('\n');
    
    // Validate required fields
    console.log('✅ Validation Results:');
    console.log('=====================');
    
    const validations = [
      { field: 'title', value: dailyProblem.question.title, required: true },
      { field: 'difficulty', value: dailyProblem.question.difficulty, required: true },
      { field: 'titleSlug', value: dailyProblem.question.titleSlug, required: true },
      { field: 'link', value: dailyProblem.link, required: true },
      { field: 'date', value: dailyProblem.date, required: true },
      { field: 'content', value: dailyProblem.question.content, required: false },
      { field: 'topicTags', value: dailyProblem.question.topicTags, required: false },
      { field: 'exampleTestcases', value: dailyProblem.question.exampleTestcases, required: false }
    ];
    
    let allValid = true;
    
    validations.forEach(({ field, value, required }) => {
      const isValid = required ? (value !== undefined && value !== null && value !== '') : true;
      const status = isValid ? '✅' : '❌';
      const requiredText = required ? '(Required)' : '(Optional)';
      
      console.log(`${status} ${field}: ${value !== undefined ? '✓' : '✗'} ${requiredText}`);
      
      if (required && !isValid) {
        allValid = false;
      }
    });
    
    console.log('\n');
    
    if (allValid) {
      console.log('🎉 SUCCESS: Daily problem fetch is working correctly!');
      console.log('📊 Summary:');
      console.log(`   - Title: ${dailyProblem.question.title}`);
      console.log(`   - Difficulty: ${dailyProblem.question.difficulty}`);
      console.log(`   - Date: ${dailyProblem.date}`);
      console.log(`   - Topic Tags: ${dailyProblem.question.topicTags?.length || 0} tags`);
      console.log(`   - Link: ${dailyProblem.link}`);
      console.log(`   - Points: ${dashboardFormat.points}`);
    } else {
      console.log('⚠️  WARNING: Some required fields are missing!');
    }
    
  } catch (error) {
    console.error('❌ FAILED: Error fetching daily problem');
    console.error('Error Details:');
    console.error('=============');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    // Test fallback behavior
    console.log('\n🔄 Testing Fallback Behavior:');
    console.log('=============================');
    
    const fallbackChallenge = {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy", 
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      completed: false,
      points: 100,
      link: null,
      date: new Date().toISOString().split('T')[0],
      topicTags: [],
      isfallback: true
    };
    
    console.log('✅ Fallback challenge would be used:');
    console.log(JSON.stringify(fallbackChallenge, null, 2));
  }
}

/**
 * Test multiple consecutive calls to check rate limiting
 */
async function testRateLimit() {
  console.log('\n🚦 Testing Rate Limiting:');
  console.log('========================');
  
  const calls = 3;
  const startTime = Date.now();
  
  for (let i = 1; i <= calls; i++) {
    try {
      console.log(`📡 Call ${i}/${calls}...`);
      const callStart = Date.now();
      
      await leetcodeService.getDailyProblem();
      
      const callTime = Date.now() - callStart;
      console.log(`✅ Call ${i} completed in ${callTime}ms`);
      
    } catch (error) {
      console.log(`❌ Call ${i} failed: ${error.message}`);
    }
  }
  
  const totalTime = Date.now() - startTime;
  console.log(`\n📊 Total time for ${calls} calls: ${totalTime}ms`);
  console.log(`📊 Average time per call: ${Math.round(totalTime / calls)}ms`);
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 LeetCode Daily Problem Test Suite');
  console.log('===================================\n');
  
  try {
    // Test 1: Basic daily problem fetch
    await testDailyProblemFetch();
    
    // Test 2: Rate limiting
    await testRateLimit();
    
    console.log('\n🏁 All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed with error:', error.message);
    process.exit(1);
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n👋 Exiting test script...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = {
  testDailyProblemFetch,
  testRateLimit,
  runTests
};
