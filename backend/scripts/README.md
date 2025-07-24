# Daily Problem Testing Scripts

This directory contains scripts to test and validate the LeetCode daily problem fetching functionality.

## Scripts Overview

### 1. `checkDailyProblem.js` - Quick Health Check
A simple script that performs a quick health check of the daily problem fetching functionality.

**Usage:**
```bash
npm run check:daily-problem
```

**What it does:**
- Fetches today's daily problem
- Shows basic information (title, difficulty, date, link)
- Returns success/failure status

**Sample Output:**
```
🚀 Quick Daily Problem Health Check...
✅ SUCCESS!
📅 Date: 2025-07-24
📝 Title: Minimum Score After Removals on a Tree
💪 Difficulty: Hard
🔗 Link: /problems/minimum-score-after-removals-on-a-tree/
```

### 2. `testDailyProblem.js` - Comprehensive Test Suite
A detailed test script that thoroughly validates the daily problem functionality.

**Usage:**
```bash
npm run test:daily-problem
```

**What it tests:**
- Daily problem API fetch
- Data transformation for dashboard format
- Field validation (required vs optional)
- Rate limiting behavior
- Error handling and fallback scenarios

**Features:**
- ✅ Raw API response display
- ✅ Dashboard format transformation testing
- ✅ Field validation with detailed results
- ✅ Rate limiting verification (3 consecutive calls)
- ✅ Performance metrics (fetch time, average response time)
- ✅ Error handling with fallback testing

## When to Use These Scripts

### Use `checkDailyProblem.js` when:
- Quick verification that daily problem fetch is working
- Daily health checks or monitoring
- CI/CD pipeline health checks
- Debugging basic connectivity issues

### Use `testDailyProblem.js` when:
- Comprehensive testing after code changes
- Validating new API integrations
- Performance testing and rate limit verification
- Debugging complex issues with data transformation
- Ensuring all required fields are present

## Integration with Dashboard

These scripts test the same functionality used in the dashboard route (`/api/dashboard`):

1. **Daily Problem Fetch**: Tests `leetcodeService.getDailyProblem()`
2. **Data Transformation**: Validates the same format used in dashboard response
3. **Error Handling**: Tests fallback behavior when API fails

## Troubleshooting

### Common Issues:

**Rate Limiting Errors:**
- The scripts respect the 1-second rate limit built into the service
- If you see delays, this is normal and expected behavior

**API Connection Issues:**
- Check internet connectivity
- Verify LeetCode API is accessible
- Check if any firewall blocks outgoing requests

**Missing Fields:**
- The comprehensive test will show exactly which fields are missing
- Some fields (like `content`) are optional and may be empty

## Adding New Tests

To add new test scenarios, modify `testDailyProblem.js`:

```javascript
// Add new test function
async function testNewScenario() {
  console.log('🧪 Testing new scenario...');
  // Your test logic here
}

// Add to main test runner
async function runTests() {
  await testDailyProblemFetch();
  await testRateLimit();
  await testNewScenario(); // Add your new test
}
```

## Output Interpretation

### ✅ Success Indicators:
- All required fields present
- API responds within reasonable time
- Data transformation successful
- Rate limiting working properly

### ❌ Failure Indicators:
- Missing required fields (title, difficulty, titleSlug, link, date)
- API timeouts or connection errors
- Malformed response data
- Rate limiting not working

### ⚠️ Warnings:
- Optional fields missing (normal, not critical)
- Slower than usual response times
- Fallback behavior triggered
