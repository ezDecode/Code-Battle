require('dotenv').config();

/**
 * Environment Variables Validation Script
 * This script checks if all required environment variables are properly configured
 */

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET'
];

const optionalEnvVars = [
  'LEETCODE_API_BASE_URL',
  'LEETCODE_RATE_LIMIT_DELAY',
  'CORS_ORIGIN',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'BCRYPT_SALT_ROUNDS'
];

const sensitiveVars = [
  'JWT_SECRET',
  'SESSION_SECRET',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_SECRET',
  'MONGODB_URI'
];

function validateEnvironment() {
  console.log('🔍 Environment Variables Validation');
  console.log('===================================\n');
  
  let allValid = true;
  let warnings = [];
  
  // Check required variables
  console.log('📋 Required Variables:');
  console.log('---------------------');
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = value !== undefined && value !== '';
    const status = isSet ? '✅' : '❌';
    
    // Mask sensitive values
    let displayValue = value;
    if (sensitiveVars.includes(varName) && value) {
      displayValue = value.length > 10 ? `${value.substring(0, 8)}...` : '[HIDDEN]';
    }
    
    console.log(`${status} ${varName}: ${isSet ? displayValue : 'NOT SET'}`);
    
    if (!isSet) {
      allValid = false;
    }
  });
  
  console.log('\n📝 Optional Variables:');
  console.log('---------------------');
  
  optionalEnvVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = value !== undefined && value !== '';
    const status = isSet ? '✅' : '⚪';
    
    console.log(`${status} ${varName}: ${isSet ? value : 'Using default'}`);
    
    if (!isSet) {
      warnings.push(`${varName} not set, using default value`);
    }
  });
  
  // Environment-specific checks
  console.log('\n🌍 Environment-Specific Checks:');
  console.log('-------------------------------');
  
  const nodeEnv = process.env.NODE_ENV;
  console.log(`📍 Environment: ${nodeEnv}`);
  
  if (nodeEnv === 'production') {
    console.log('🔒 Production environment detected');
    
    // Check production-specific requirements
    const prodChecks = [
      {
        name: 'Strong JWT Secret',
        check: process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
        message: 'JWT_SECRET should be at least 32 characters in production'
      },
      {
        name: 'HTTPS URLs',
        check: process.env.FRONTEND_URL?.startsWith('https://'),
        message: 'FRONTEND_URL should use HTTPS in production'
      },
      {
        name: 'MongoDB Atlas',
        check: process.env.MONGODB_URI?.includes('mongodb+srv://'),
        message: 'Should use MongoDB Atlas (mongodb+srv://) in production'
      }
    ];
    
    prodChecks.forEach(({ name, check, message }) => {
      const status = check ? '✅' : '⚠️';
      console.log(`${status} ${name}: ${check ? 'OK' : 'Warning'}`);
      if (!check) {
        warnings.push(message);
      }
    });
  } else {
    console.log('🔧 Development environment detected');
  }
  
  // LeetCode-specific checks
  console.log('\n📊 LeetCode Configuration:');
  console.log('-------------------------');
  
  const leetcodeDelay = parseInt(process.env.LEETCODE_RATE_LIMIT_DELAY) || 1000;
  console.log(`⏱️  Rate Limit Delay: ${leetcodeDelay}ms`);
  
  if (leetcodeDelay < 500) {
    warnings.push('LEETCODE_RATE_LIMIT_DELAY is very low, may cause rate limiting');
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('===========');
  
  if (allValid) {
    console.log('✅ All required environment variables are set!');
  } else {
    console.log('❌ Some required environment variables are missing!');
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warnings:`);
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  console.log('');
  
  return { valid: allValid, warnings };
}

function showEnvExample() {
  console.log('📖 Example .env Configuration:');
  console.log('==============================');
  console.log(`
# Basic Configuration
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codebattle
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-here
SESSION_SECRET=your-session-secret-key-here

# Frontend
FRONTEND_URL=http://localhost:5173

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth (GitHub)  
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# LeetCode API (Optional)
LEETCODE_RATE_LIMIT_DELAY=1000

# Security (Optional)
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_SALT_ROUNDS=12
  `);
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'example':
      showEnvExample();
      break;
      
    case 'validate':
    default:
      const result = validateEnvironment();
      process.exit(result.valid ? 0 : 1);
  }
}

module.exports = {
  validateEnvironment,
  showEnvExample
};
