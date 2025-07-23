const axios = require('axios');

class LeetCodeService {
  constructor() {
    this.baseURL = 'https://alfa-leetcode-api.onrender.com';
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

  // Make API request with error handling
  async makeRequest(endpoint) {
    try {
      await this.waitForRateLimit();
      
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'CodeBattle-App/1.0'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`LeetCode API Error for ${endpoint}:`, error.message);
      
      if (error.response) {
        // API returned an error response
        throw new Error(`LeetCode API Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        throw new Error('LeetCode API request timed out');
      } else {
        // Network or other error
        throw new Error('Failed to connect to LeetCode API');
      }
    }
  }

  // Get user profile information
  async getUserProfile(username) {
    const data = await this.makeRequest(`/${username}`);
    
    return {
      username: data.username,
      name: data.name,
      avatar: data.avatar,
      ranking: data.ranking,
      reputation: data.reputation,
      country: data.country,
      company: data.company,
      school: data.school,
      skillTags: data.skillTags || [],
      about: data.about,
      github: data.gitHub,
      linkedin: data.linkedIN,
      twitter: data.twitter,
      website: data.website
    };
  }

  // Get user's solved problems statistics
  async getUserSolvedStats(username) {
    const data = await this.makeRequest(`/${username}/solved`);
    
    return {
      totalSolved: data.solvedProblem,
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      totalSubmissions: data.totalSubmissionNum,
      acceptedSubmissions: data.acSubmissionNum
    };
  }

  // Get user's recent submissions
  async getUserSubmissions(username, limit = 20) {
    const data = await this.makeRequest(`/${username}/submission?limit=${limit}`);
    
    return {
      count: data.count,
      submissions: data.submission.map(sub => ({
        title: sub.title,
        titleSlug: sub.titleSlug,
        timestamp: parseInt(sub.timestamp),
        date: new Date(parseInt(sub.timestamp) * 1000),
        status: sub.statusDisplay,
        language: sub.lang,
        isAccepted: sub.statusDisplay === 'Accepted'
      }))
    };
  }

  // Get user's accepted submissions only
  async getUserAcceptedSubmissions(username, limit = 20) {
    const data = await this.makeRequest(`/${username}/acSubmission?limit=${limit}`);
    
    return {
      count: data.count,
      submissions: data.submission.map(sub => ({
        title: sub.title,
        titleSlug: sub.titleSlug,
        timestamp: parseInt(sub.timestamp),
        date: new Date(parseInt(sub.timestamp) * 1000),
        status: sub.statusDisplay,
        language: sub.lang
      }))
    };
  }

  // Get user's contest information
  async getUserContestInfo(username) {
    try {
      const data = await this.makeRequest(`/${username}/contest`);
      
      return {
        contestAttend: data.contestAttend,
        contestRating: data.contestRating,
        contestGlobalRanking: data.contestGlobalRanking,
        totalParticipants: data.totalParticipants,
        contestTopPercentage: data.contestTopPercentage,
        contestBadges: data.contestBadges || null
      };
    } catch (error) {
      // Some users might not have contest data
      console.log(`No contest data for user ${username}`);
      return null;
    }
  }

  // Get user's submission calendar
  async getUserCalendar(username) {
    const data = await this.makeRequest(`/${username}/calendar`);
    
    return {
      totalActiveDays: data.totalActiveDays,
      dccBadges: data.dccBadges,
      streak: data.streak,
      submissionCalendar: data.submissionCalendar
    };
  }

  // Get user's badges
  async getUserBadges(username) {
    try {
      const data = await this.makeRequest(`/${username}/badges`);
      return data.badges || [];
    } catch (error) {
      console.log(`No badges data for user ${username}`);
      return [];
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

  // Get comprehensive user data for CodeBattle
  async getComprehensiveUserData(username) {
    try {
      console.log(`Fetching comprehensive data for LeetCode user: ${username}`);
      
      // Fetch all user data in parallel (with rate limiting)
      const [profile, solvedStats, submissions, calendar] = await Promise.all([
        this.getUserProfile(username),
        this.getUserSolvedStats(username),
        this.getUserSubmissions(username, 10),
        this.getUserCalendar(username)
      ]);

      // Try to get contest info (optional)
      let contestInfo = null;
      try {
        contestInfo = await this.getUserContestInfo(username);
      } catch (error) {
        console.log(`Contest info not available for ${username}`);
      }

      // Detect skill level
      const skillLevel = this.detectSkillLevel(solvedStats);

      return {
        profile,
        solvedStats,
        submissions,
        calendar,
        contestInfo,
        skillLevel,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Failed to fetch comprehensive data for ${username}:`, error.message);
      throw error;
    }
  }

  // Verify if a LeetCode username exists
  async verifyUsername(username) {
    try {
      await this.getUserProfile(username);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get daily problem
  async getDailyProblem() {
    const data = await this.makeRequest('/daily');
    
    return {
      date: data.date,
      link: data.link,
      question: {
        title: data.question.title,
        titleSlug: data.question.titleSlug,
        difficulty: data.question.difficulty,
        content: data.question.content,
        exampleTestcases: data.question.exampleTestcases,
        topicTags: data.question.topicTags
      }
    };
  }

  // Get problems list with filters
  async getProblems(options = {}) {
    const { limit = 20, tags = [], difficulty = null, skip = 0 } = options;
    
    let endpoint = `/problems?limit=${limit}&skip=${skip}`;
    
    if (tags.length > 0) {
      endpoint += `&tags=${tags.join('+')}`;
    }
    
    if (difficulty) {
      endpoint += `&difficulty=${difficulty.toUpperCase()}`;
    }
    
    const data = await this.makeRequest(endpoint);
    
    return {
      totalQuestions: data.totalQuestions,
      count: data.count,
      problems: data.problemsetQuestionList.map(problem => ({
        title: problem.title,
        titleSlug: problem.titleSlug,
        difficulty: problem.difficulty,
        acRate: problem.acRate,
        freqBar: problem.freqBar,
        frontendQuestionId: problem.frontendQuestionId,
        isFavor: problem.isFavor,
        paidOnly: problem.paidOnly,
        status: problem.status,
        topicTags: problem.topicTags,
        hasSolution: problem.hasSolution,
        hasVideoSolution: problem.hasVideoSolution
      }))
    };
  }
}

module.exports = new LeetCodeService();
