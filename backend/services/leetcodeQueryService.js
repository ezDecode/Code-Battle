const { LeetCode } = require('leetcode-query');

class LeetCodeQueryService {
  constructor() {
    this.client = new LeetCode();
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Verify if a LeetCode username exists
  async verifyUsername(username) {
    try {
      console.log(`Verifying LeetCode username: ${username}`);
      await this.waitForRateLimit();
      
      const userData = await this.client.user(username);
      
      // Check if user exists by looking for matchedUser
      if (userData && userData.matchedUser && userData.matchedUser.username) {
        console.log(`Username ${username} verified successfully`);
        return true;
      }
      
      console.log(`Username ${username} not found`);
      return false;
    } catch (error) {
      console.log(`Username ${username} verification failed:`, error.message);
      return false;
    }
  }

  // Get comprehensive user data
  async getComprehensiveUserData(username) {
    try {
      console.log(`Fetching comprehensive data for LeetCode user: ${username}`);
      await this.waitForRateLimit();
      
      const userData = await this.client.user(username);
      
      if (!userData || !userData.matchedUser) {
        throw new Error(`User ${username} not found`);
      }

      const user = userData.matchedUser;
      
      // Extract solved statistics
      const acSubmissions = user.submitStats.acSubmissionNum;
      const totalSubmissions = user.submitStats.totalSubmissionNum;
      
      const easySolved = acSubmissions.find(s => s.difficulty === 'Easy')?.count || 0;
      const mediumSolved = acSubmissions.find(s => s.difficulty === 'Medium')?.count || 0;
      const hardSolved = acSubmissions.find(s => s.difficulty === 'Hard')?.count || 0;
      const totalSolved = acSubmissions.find(s => s.difficulty === 'All')?.count || 0;
      
      const totalSubmissionCount = totalSubmissions.find(s => s.difficulty === 'All')?.submissions || 0;
      const acceptedSubmissionCount = acSubmissions.find(s => s.difficulty === 'All')?.submissions || 0;

      // Parse submission calendar for streak calculation
      let streak = 0;
      try {
        const calendarData = JSON.parse(user.submissionCalendar || '{}');
        
        // Calculate current streak (simplified - count consecutive days from today backwards)
        const today = new Date();
        const todayTimestamp = Math.floor(today.getTime() / 1000);
        const oneDayInSeconds = 24 * 60 * 60;
        
        let currentDay = todayTimestamp;
        while (calendarData[currentDay] || calendarData[currentDay - oneDayInSeconds]) {
          if (calendarData[currentDay]) {
            streak++;
          }
          currentDay -= oneDayInSeconds;
        }
      } catch (calendarError) {
        console.log('Error parsing submission calendar:', calendarError.message);
      }

      // Detect skill level
      const skillLevel = this.detectSkillLevel({ totalSolved, hardSolved, mediumSolved });

      // Format the response to match our existing structure
      return {
        profile: {
          username: user.username,
          name: user.profile.realName || user.username,
          avatar: user.profile.userAvatar,
          ranking: user.profile.ranking,
          reputation: user.profile.reputation,
          country: user.profile.countryName,
          company: user.profile.company,
          school: user.profile.school,
          skillTags: user.profile.skillTags || [],
          about: user.profile.aboutMe,
          github: user.githubUrl,
          linkedin: null, // Not available in this API
          twitter: null,  // Not available in this API
          website: user.profile.websites || []
        },
        solvedStats: {
          totalSolved,
          easySolved,
          mediumSolved,
          hardSolved,
          totalSubmissions: totalSubmissionCount,
          acceptedSubmissions: acceptedSubmissionCount
        },
        submissions: {
          count: userData.recentSubmissionList?.length || 0,
          submissions: (userData.recentSubmissionList || []).map(sub => ({
            title: sub.title,
            titleSlug: sub.titleSlug,
            timestamp: parseInt(sub.timestamp),
            date: new Date(parseInt(sub.timestamp) * 1000),
            status: sub.statusDisplay,
            language: sub.lang,
            isAccepted: sub.statusDisplay === 'Accepted'
          }))
        },
        calendar: {
          submissionCalendar: user.submissionCalendar,
          streak: streak
        },
        contestInfo: null, // Not directly available in this API response
        badges: {
          badges: user.badges || [],
          upcomingBadges: user.upcomingBadges || [],
          activeBadge: user.activeBadge
        },
        skillLevel,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Failed to fetch comprehensive data for ${username}:`, error.message);
      throw error;
    }
  }

  // Detect skill level based on solved problems
  detectSkillLevel(solvedStats) {
    const totalSolved = solvedStats.totalSolved;
    const hardSolved = solvedStats.hardSolved;
    const mediumSolved = solvedStats.mediumSolved;
    
    if (totalSolved >= 500 || hardSolved >= 50) {
      return 'advanced';
    } else if (totalSolved >= 100 || mediumSolved >= 30) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  // Get daily problem
  async getDailyProblem() {
    try {
      await this.waitForRateLimit();
      
      const dailyData = await this.client.daily();
      
      return {
        date: dailyData.date,
        link: dailyData.link,
        question: {
          title: dailyData.question.title,
          titleSlug: dailyData.question.titleSlug,
          difficulty: dailyData.question.difficulty,
          content: dailyData.question.content,
          exampleTestcases: dailyData.question.exampleTestcases,
          topicTags: dailyData.question.topicTags || []
        }
      };
    } catch (error) {
      console.error('Failed to fetch daily problem:', error.message);
      throw error;
    }
  }

  // Get problems list with filters
  async getProblems(options = {}) {
    try {
      const { limit = 50, skip = 0, tags = [], difficulty = null } = options;
      
      await this.waitForRateLimit();
      
      // Note: leetcode-query might have different API for problems list
      // This is a placeholder - you may need to check the actual API documentation
      const problems = await this.client.problems({
        limit,
        skip,
        tags,
        difficulty
      });
      
      return problems;
    } catch (error) {
      console.error('Failed to fetch problems:', error.message);
      throw error;
    }
  }
}

module.exports = new LeetCodeQueryService();
