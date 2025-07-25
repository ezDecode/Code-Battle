#!/usr/bin/env node

/**
 * Pre-deployment validation script for Render deployment
 * Run this script before deploying to check configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Code Battle Deployment Validation\n');

// Check if render.yaml exists
const renderYamlPath = path.join(__dirname, 'render.yaml');
if (!fs.existsSync(renderYamlPath)) {
  console.error('❌ render.yaml not found in project root');
  process.exit(1);
}
console.log('✅ render.yaml file found');

// Check if backend package.json exists
const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
if (!fs.existsSync(backendPackagePath)) {
  console.error('❌ backend/package.json not found');
  process.exit(1);
}
console.log('✅ backend/package.json found');

// Check backend package.json scripts
try {
  const packageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
  
  const requiredScripts = ['start', 'check:daily-problem', 'monitor:daily-problem'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length > 0) {
    console.error(`❌ Missing required scripts in package.json: ${missingScripts.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Required npm scripts found');
  
  // Check dependencies
  const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv', 'passport'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.error(`❌ Missing required dependencies: ${missingDeps.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Required dependencies found');
  
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Check if server.js exists
const serverPath = path.join(__dirname, 'backend', 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ backend/server.js not found');
  process.exit(1);
}
console.log('✅ server.js found');

// Check critical script files
const scriptFiles = [
  'backend/scripts/checkDailyProblem.js',
  'backend/scripts/monitorDailyProblem.js'
];

for (const scriptFile of scriptFiles) {
  if (!fs.existsSync(path.join(__dirname, scriptFile))) {
    console.error(`❌ ${scriptFile} not found`);
    process.exit(1);
  }
}
console.log('✅ Required script files found');

// Check if .env.example exists (for reference)
const envExamplePath = path.join(__dirname, 'backend', '.env.example');
if (!fs.existsSync(envExamplePath)) {
  console.warn('⚠️  .env.example not found - consider creating one for reference');
} else {
  console.log('✅ .env.example found');
}

// Validate render.yaml syntax (basic)
try {
  const renderYamlContent = fs.readFileSync(renderYamlPath, 'utf8');
  
  // Check for required sections
  if (!renderYamlContent.includes('services:')) {
    console.error('❌ render.yaml missing services section');
    process.exit(1);
  }
  
  if (!renderYamlContent.includes('envVarGroups:')) {
    console.error('❌ render.yaml missing envVarGroups section');
    process.exit(1);
  }
  
  console.log('✅ render.yaml structure looks valid');
  
} catch (error) {
  console.error('❌ Error reading render.yaml:', error.message);
  process.exit(1);
}

console.log('\n🎉 Pre-deployment validation completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Set up MongoDB Atlas cluster');
console.log('2. Configure Google OAuth application');
console.log('3. Configure GitHub OAuth application');
console.log('4. Connect repository to Render');
console.log('5. Deploy using the render.yaml blueprint');
console.log('\n📖 See DEPLOYMENT.md for detailed instructions');
