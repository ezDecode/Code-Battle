// API service for CodeBattle
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api' 
  : 'http://localhost:3000/api';

// Mock data for development
const mockData = {
  user: {
    id: 1,
    name: "Alex Chen",
    email: "alex@example.com",
    leetcodeUsername: "alexchen_dev",
    currentStreak: 12,
    totalScore: 2450,
    dailyGoal: 1,
    teamName: "Code Ninjas",
    teamRank: 3,
    avatar: null,
    level: 15,
    xp: 2450,
    nextLevelXp: 2500,
    isEmailVerified: true,
    joinedAt: "2024-01-15T08:00:00Z"
  },
  
  dailyChallenge: {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    timeLeft: "8h 32m",
    completed: false,
    url: "https://leetcode.com/problems/two-sum/",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    points: 100,
    submissions: 0,
    hints: [
      "Use a hash map to store values and their indices",
      "For each element, check if target - element exists in the hash map"
    ],
    tags: ["Array", "Hash Table"],
    companies: ["Amazon", "Google", "Microsoft"]
  },
  
  teamMembers: [
    { 
      id: 1, 
      name: "Alex Chen", 
      score: 2450, 
      status: "active", 
      isCurrentUser: true, 
      avatar: null, 
      streak: 12,
      lastActive: "2024-07-23T10:30:00Z",
      problemsSolved: 47,
      rank: 1
    },
    { 
      id: 2, 
      name: "Sarah Kim", 
      score: 2380, 
      status: "active", 
      isCurrentUser: false, 
      avatar: null, 
      streak: 8,
      lastActive: "2024-07-23T09:15:00Z",
      problemsSolved: 42,
      rank: 2
    },
    { 
      id: 3, 
      name: "Mike Johnson", 
      score: 2120, 
      status: "inactive", 
      isCurrentUser: false, 
      avatar: null, 
      streak: 3,
      lastActive: "2024-07-20T16:45:00Z",
      problemsSolved: 38,
      rank: 3
    },
    { 
      id: 4, 
      name: "Lisa Wang", 
      score: 1980, 
      status: "active", 
      isCurrentUser: false, 
      avatar: null, 
      streak: 15,
      lastActive: "2024-07-23T08:20:00Z",
      problemsSolved: 35,
      rank: 4
    }
  ],
  
  leaderboard: [
    { 
      id: 1, 
      name: "CodeMaster", 
      score: 3200, 
      rank: 1, 
      avatar: null, 
      trend: "up",
      weeklyProgress: 8,
      teamName: "Alpha Coders",
      country: "USA"
    },
    { 
      id: 2, 
      name: "AlgoQueen", 
      score: 3150, 
      rank: 2, 
      avatar: null, 
      trend: "up",
      weeklyProgress: 6,
      teamName: "Algo Warriors",
      country: "Canada"
    },
    { 
      id: 3, 
      name: "DevNinja", 
      score: 3100, 
      rank: 3, 
      avatar: null, 
      trend: "down",
      weeklyProgress: 3,
      teamName: "Code Ninjas",
      country: "Japan"
    },
    { 
      id: 4, 
      name: "ByteWarrior", 
      score: 3050, 
      rank: 4, 
      avatar: null, 
      trend: "up",
      weeklyProgress: 7,
      teamName: "Byte Squad",
      country: "Germany"
    },
    { 
      id: 5, 
      name: "LogicLord", 
      score: 3000, 
      rank: 5, 
      avatar: null, 
      trend: "same",
      weeklyProgress: 4,
      teamName: "Logic Masters",
      country: "India"
    }
  ],
  
  userStats: {
    problemsSolved: 47,
    successRate: 89,
    currentStreak: 12,
    weeklyProgress: 71,
    totalSubmissions: 53,
    easyProblems: 25,
    mediumProblems: 18,
    hardProblems: 4,
    totalTimeSaved: "2h 30m",
    averageTime: "15m",
    favoriteTopics: ["Arrays", "Dynamic Programming", "Trees"],
    recentSubmissions: [
      { problem: "Two Sum", difficulty: "Easy", status: "Accepted", time: "12m" },
      { problem: "Valid Parentheses", difficulty: "Easy", status: "Accepted", time: "8m" },
      { problem: "Merge Two Sorted Lists", difficulty: "Easy", status: "Wrong Answer", time: "20m" }
    ]
  },

  notifications: [
    {
      id: 1,
      type: "success",
      title: "Challenge Completed!",
      message: "You solved 'Two Sum' and earned 100 points",
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: "info",
      title: "Team Update",
      message: "Sarah Kim just joined your team",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    }
  ]
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
    this.isDevMode = process.env.NODE_ENV === 'development';
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Remove auth token
  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Generic request method with retry logic
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          if (response.status === 401) {
            this.removeToken();
            throw new Error('Authentication required');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        if (i === maxRetries - 1) break;
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    console.error('API request failed after retries:', lastError);
    throw lastError;
  }

  // Development mode mock responses
  async mockRequest(mockData, delay = 800) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate occasional network errors in dev mode
        if (Math.random() < 0.05) {
          reject(new Error('Network error (simulated)'));
          return;
        }
        resolve(mockData);
      }, delay);
    });
  }

  // Auth API
  auth = {
    login: async (credentials) => {
      if (this.isDevMode) {
        const user = await this.mockRequest(mockData.user, 1200);
        this.setToken('mock-token-' + Date.now());
        return user;
      }
      
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      this.setToken(response.token);
      return response.user;
    },

    register: async (userData) => {
      if (this.isDevMode) {
        const user = await this.mockRequest({ ...mockData.user, ...userData }, 1500);
        this.setToken('mock-token-' + Date.now());
        return user;
      }
      
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      this.setToken(response.token);
      return response.user;
    },

    logout: async () => {
      if (this.isDevMode) {
        this.removeToken();
        return;
      }
      
      await this.request('/auth/logout', { method: 'POST' });
      this.removeToken();
    },

    getCurrentUser: async () => {
      if (!this.token) return null;
      
      if (this.isDevMode) {
        return await this.mockRequest(mockData.user, 500);
      }
      
      return await this.request('/auth/me');
    }
  };

  // Dashboard API
  dashboard = {
    getData: async () => {
      if (this.isDevMode) {
        return await this.mockRequest({
          dailyChallenge: mockData.dailyChallenge,
          teamMembers: mockData.teamMembers,
          leaderboard: mockData.leaderboard,
          userStats: mockData.userStats
        }, 1000);
      }
      
      return await this.request('/dashboard');
    }
  };

  // LeetCode API
  leetcode = {
    sync: async () => {
      if (this.isDevMode) {
        return await this.mockRequest({
          user: { ...mockData.user, currentStreak: mockData.user.currentStreak + 1 },
          stats: { ...mockData.userStats, problemsSolved: mockData.userStats.problemsSolved + 2 }
        }, 2000);
      }
      
      return await this.request('/leetcode/sync', { method: 'POST' });
    },

    getProfile: async (username) => {
      if (this.isDevMode) {
        return await this.mockRequest({
          username,
          problemsSolved: Math.floor(Math.random() * 500) + 100,
          ranking: Math.floor(Math.random() * 10000) + 1000
        });
      }
      
      return await this.request(`/leetcode/profile/${username}`);
    }
  };

  // Teams API
  teams = {
    getMembers: async () => {
      if (this.isDevMode) {
        return await this.mockRequest(mockData.teamMembers);
      }
      
      return await this.request('/teams/members');
    },

    join: async (teamCode) => {
      if (this.isDevMode) {
        return await this.mockRequest({ success: true, teamName: "New Team" }, 1500);
      }
      
      return await this.request('/teams/join', {
        method: 'POST',
        body: JSON.stringify({ teamCode }),
      });
    },

    create: async (teamData) => {
      if (this.isDevMode) {
        return await this.mockRequest({ success: true, team: teamData }, 1200);
      }
      
      return await this.request('/teams/create', {
        method: 'POST',
        body: JSON.stringify(teamData),
      });
    }
  };

  // Challenges API
  challenges = {
    getDaily: async () => {
      if (this.isDevMode) {
        return await this.mockRequest(mockData.dailyChallenge);
      }
      
      return await this.request('/challenges/daily');
    },

    submit: async (challengeId, solution) => {
      if (this.isDevMode) {
        return await this.mockRequest({ success: true, score: 100 }, 1000);
      }
      
      return await this.request(`/challenges/${challengeId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ solution }),
      });
    }
  };

  // Leaderboard API
  leaderboard = {
    get: async (limit = 50) => {
      if (this.isDevMode) {
        return await this.mockRequest(mockData.leaderboard.slice(0, limit));
      }
      
      return await this.request(`/leaderboard?limit=${limit}`);
    },

    getUserRank: async () => {
      if (this.isDevMode) {
        return await this.mockRequest({ rank: 24, score: 2450 });
      }
      
      return await this.request('/leaderboard/user-rank');
    }
  };

  // Notifications API
  notifications = {
    get: async () => {
      if (this.isDevMode) {
        return await this.mockRequest([]);
      }
      
      return await this.request('/notifications');
    },

    markAsRead: async (notificationId) => {
      if (this.isDevMode) {
        return await this.mockRequest({ success: true });
      }
      
      return await this.request(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    }
  };
}

export const api = new ApiService();
