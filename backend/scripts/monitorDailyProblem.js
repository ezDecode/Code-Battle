const leetcodeService = require('../services/leetcodeQueryService');
const fs = require('fs');
const path = require('path');

/**
 * Monitor daily problem changes throughout the day
 * This script can be run periodically to track when LeetCode updates the daily problem
 */

const LOG_FILE = path.join(__dirname, 'daily-problem-monitor.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

async function monitorDailyProblem() {
  try {
    log('🔍 Monitoring daily problem...');
    
    const dailyProblem = await leetcodeService.getDailyProblem();
    
    const problemInfo = {
      date: dailyProblem.date,
      title: dailyProblem.question.title,
      titleSlug: dailyProblem.question.titleSlug,
      difficulty: dailyProblem.question.difficulty,
      link: dailyProblem.link,
      topicCount: dailyProblem.question.topicTags?.length || 0,
      fetchTime: new Date().toISOString()
    };
    
    log(`📝 Current daily problem: "${problemInfo.title}" (${problemInfo.difficulty})`);
    log(`📅 Date: ${problemInfo.date}`);
    log(`🔗 Slug: ${problemInfo.titleSlug}`);
    log(`🏷️  Topics: ${problemInfo.topicCount} tags`);
    
    // Save to history file
    const historyFile = path.join(__dirname, 'daily-problem-history.json');
    let history = [];
    
    if (fs.existsSync(historyFile)) {
      try {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (e) {
        log('⚠️  Could not read history file, starting fresh');
      }
    }
    
    // Check if this is a new problem
    const lastProblem = history[history.length - 1];
    if (!lastProblem || lastProblem.titleSlug !== problemInfo.titleSlug) {
      log('🆕 NEW PROBLEM DETECTED!');
      history.push(problemInfo);
      
      // Keep only last 30 days
      if (history.length > 30) {
        history = history.slice(-30);
      }
      
      fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
      log('💾 Saved to history');
    } else {
      log('✅ Same problem as last check');
    }
    
    return problemInfo;
    
  } catch (error) {
    log(`❌ Error monitoring daily problem: ${error.message}`);
    throw error;
  }
}

/**
 * Run continuous monitoring (for scheduled tasks)
 */
async function startMonitoring(intervalMinutes = 60) {
  log(`🚀 Starting continuous monitoring (every ${intervalMinutes} minutes)`);
  
  // Initial check
  await monitorDailyProblem();
  
  // Set up interval
  setInterval(async () => {
    try {
      await monitorDailyProblem();
    } catch (error) {
      log(`❌ Monitoring error: ${error.message}`);
    }
  }, intervalMinutes * 60 * 1000);
  
  log('⏰ Monitoring started. Press Ctrl+C to stop.');
}

/**
 * Show recent history
 */
function showHistory() {
  const historyFile = path.join(__dirname, 'daily-problem-history.json');
  
  if (!fs.existsSync(historyFile)) {
    console.log('📭 No history file found. Run monitor first.');
    return;
  }
  
  try {
    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    
    console.log('📚 Recent Daily Problems History:');
    console.log('==================================');
    
    history.slice(-10).forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.date} - ${problem.title} (${problem.difficulty})`);
      console.log(`   Slug: ${problem.titleSlug}`);
      console.log(`   Fetched: ${new Date(problem.fetchTime).toLocaleString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.log('❌ Error reading history:', error.message);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'check':
      monitorDailyProblem()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'history':
      showHistory();
      process.exit(0);
      break;
      
    case 'watch':
      const interval = parseInt(args[1]) || 60;
      startMonitoring(interval)
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('📖 Daily Problem Monitor');
      console.log('========================');
      console.log('');
      console.log('Usage:');
      console.log('  node monitorDailyProblem.js check           - Single check');
      console.log('  node monitorDailyProblem.js history         - Show recent history');
      console.log('  node monitorDailyProblem.js watch [minutes] - Continuous monitoring');
      console.log('');
      console.log('Examples:');
      console.log('  node monitorDailyProblem.js check');
      console.log('  node monitorDailyProblem.js watch 30        - Check every 30 minutes');
      process.exit(0);
  }
}

module.exports = {
  monitorDailyProblem,
  startMonitoring,
  showHistory
};
