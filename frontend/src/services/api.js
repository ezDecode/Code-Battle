// API service for CodeBattle
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://code-battle-nlyy.onrender.com/api' 
  : 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
    this.oauthConfigured = null; // Will be checked when needed
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
    // Also clean up OAuth processing flags
    sessionStorage.removeItem('processedOAuthToken');
    sessionStorage.removeItem('oauthCallback');
  }

    // Generic request method with retry logic
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add auth token if available
    if (this.token) {
      defaultOptions.headers.Authorization = `Bearer ${this.token}`;
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    console.log(`📡 API Request: ${finalOptions.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, finalOptions);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorCode = 'UNKNOWN_ERROR';
      
      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorCode = errorData.code || errorCode;
          
          // Handle specific auth errors
          if (response.status === 401) {
            if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'USER_NOT_FOUND') {
              console.log('🔄 Auth token invalid, clearing...');
              this.removeToken();
              // Only redirect if we're not already on the landing page
              if (window.location.pathname !== '/') {
                window.location.href = '/';
              }
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
      }
      
      console.error(`❌ API Error: ${errorMessage} (${errorCode})`);
      throw new Error(errorMessage);
    }

    if (isJson) {
      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } else {
      const text = await response.text();
      console.log(`✅ API Response (text): ${endpoint}`, text);
      return text;
    }
  }

  // Helper method to check OAuth configuration
  async checkOAuthConfig() {
    if (this.oauthConfigured !== null) {
      return this.oauthConfigured;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/oauth-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.oauthConfigured = data.oauth;
      return this.oauthConfigured;
    } catch (error) {
      console.warn('Could not check OAuth configuration:', error);
      // Return a default configuration indicating OAuth is not available
      this.oauthConfigured = { 
        google: { configured: false }, 
        github: { configured: false } 
      };
      return this.oauthConfigured;
    }
  }

  // Auth API
  auth = {
    login: async (credentials) => {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      this.setToken(response.token);
      return response.user;
    },

    register: async (userData) => {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      this.setToken(response.token);
      return response.user;
    },

    logout: async () => {
      await this.request('/auth/logout', { method: 'POST' });
      this.removeToken();
    },

    getCurrentUser: async () => {
      if (!this.token) return null;
      return await this.request('/auth/me');
    },

    // OAuth methods
    initiateGoogleAuth: async () => {
      try {
        const oauthConfig = await this.checkOAuthConfig();
        
        if (oauthConfig?.google?.configured) {
          // Redirect to backend OAuth endpoint
          window.location.href = `${API_BASE_URL}/auth/google`;
          return;
        }
        
        // OAuth not configured or check failed
        throw new Error('Google OAuth is not available. Please contact support.');
      } catch (error) {
        console.error('Google OAuth error:', error);
        // Don't re-throw the error for network issues
        if (error.message.includes('Failed to fetch') || error.message.includes('network error')) {
          throw new Error('Unable to connect to authentication service. Please try again later.');
        }
        throw error;
      }
    },

    initiateGitHubAuth: async () => {
      try {
        const oauthConfig = await this.checkOAuthConfig();
        
        if (oauthConfig?.github?.configured) {
          // Redirect to backend OAuth endpoint
          window.location.href = `${API_BASE_URL}/auth/github`;
          return;
        }
        
        // OAuth not configured or check failed
        throw new Error('GitHub OAuth is not available. Please contact support.');
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        // Don't re-throw the error for network issues
        if (error.message.includes('Failed to fetch') || error.message.includes('network error')) {
          throw new Error('Unable to connect to authentication service. Please try again later.');
        }
        throw error;
      }
    },

    // Check OAuth status (for handling redirects)
    checkOAuthStatus: () => {
      const urlParams = new URLSearchParams(window.location.search);
      let token = urlParams.get('token');
      let oauth = urlParams.get('oauth');
      const error = urlParams.get('error');

      // Check if we've already processed this OAuth callback
      const processedToken = sessionStorage.getItem('processedOAuthToken');

      // Fallback to sessionStorage if URL params are not available (race condition fix)
      if (!token || !oauth) {
        const storedOAuth = sessionStorage.getItem('oauthCallback');
        if (storedOAuth) {
          try {
            const oauthData = JSON.parse(storedOAuth);
            token = oauthData.token;
            oauth = oauthData.oauth;
            console.log('🔄 Using stored OAuth data from sessionStorage');
          } catch (e) {
            console.error('❌ Failed to parse stored OAuth data:', e);
            sessionStorage.removeItem('oauthCallback');
          }
        }
      }

      console.log('🔍 OAuth URL params:', { 
        token: token ? token.substring(0, 10) + '...' : 'null', 
        oauth, 
        error,
        fullSearch: window.location.search,
        alreadyProcessed: processedToken ? processedToken.substring(0, 10) + '...' : 'none'
      });

      if (error) {
        // Clean up any stored data on error
        sessionStorage.removeItem('processedOAuthToken');
        sessionStorage.removeItem('oauthCallback');
        throw new Error(`OAuth authentication failed: ${error}`);
      }

      if (token && oauth === 'true') {
        // Check if we've already processed this exact token
        if (processedToken === token) {
          console.log('⚠️ OAuth token already processed, skipping...');
          return { success: false, reason: 'already_processed' };
        }
        
        console.log('✅ Setting token and storing in API service');
        // Set token immediately in API service and localStorage
        this.setToken(token);
        
        // Verify token was set correctly
        if (this.token !== token) {
          console.error('❌ Token not set correctly in API service');
          throw new Error('Failed to set authentication token');
        }
        
        // Mark this token as processed before any navigation
        sessionStorage.setItem('processedOAuthToken', token);
        
        // Determine if this is onboarding based on the current path
        const isOnboardingPath = window.location.pathname === '/onboarding';
        
        // Clean up URL immediately to prevent re-processing
        const cleanPath = isOnboardingPath ? '/onboarding' : '/dashboard';
        window.history.replaceState({}, document.title, cleanPath);
        
        // Clean up session storage after a short delay
        setTimeout(() => {
          sessionStorage.removeItem('oauthCallback');
        }, 100);
        
        return { success: true, needsOnboarding: isOnboardingPath };
      }

      return { success: false, reason: 'no_oauth_params' };
    },

    // Complete OAuth onboarding
    completeOnboarding: async (leetcodeUsername, token) => {
      const response = await this.request('/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({ leetcodeUsername, token }),
      });
      
      return response.user;
    }
  };

  // User Profile API
  user = {
    updateProfile: async (profileData) => {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'avatar') {
          formData.append(key, profileData[key]);
        }
      });
      
      // Handle avatar upload
      if (profileData.avatar && profileData.avatar instanceof File) {
        formData.append('avatar', profileData.avatar);
      }
      
      const response = await this.request('/user/profile', {
        method: 'PUT',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
        }
      });
      
      return response.user;
    },

    deleteAccount: async () => {
      await this.request('/user/account', {
        method: 'DELETE'
      });
      this.removeToken();
    },

    changePassword: async (currentPassword, newPassword) => {
      const response = await this.request('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      return response;
    }
  };

  // Dashboard API
  dashboard = {
    getData: async () => {
      return await this.request('/dashboard');
    }
  };

  // Daily Challenge API
  dailyChallenge = {
    get: async () => {
      return await this.request('/daily-challenge');
    },

    checkStatus: async (titleSlug) => {
      return await this.request(`/daily-challenge/status/${titleSlug}`);
    }
  };

  // LeetCode API
  leetcode = {
    sync: async () => {
      return await this.request('/leetcode/sync', { method: 'POST' });
    },

    getProfile: async (username) => {
      return await this.request(`/leetcode/profile/${username}`);
    },

    verify: async (username) => {
      return await this.request(`/leetcode/verify/${username}`);
    }
  };

  // Teams API
  teams = {
    // Get all public teams
    getAll: async () => {
      return await this.request('/teams');
    },

    // Get specific team details
    getById: async (teamId) => {
      return await this.request(`/teams/${teamId}`);
    },

    // Get current user's team members
    getMembers: async () => {
      return await this.request('/teams/members');
    },

    // Create a new team
    create: async (teamData) => {
      return await this.request('/teams', {
        method: 'POST',
        body: JSON.stringify(teamData),
      });
    },

    // Update team details (captain only)
    update: async (teamId, teamData) => {
      return await this.request(`/teams/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(teamData),
      });
    },

    // Delete team (captain only)
    delete: async (teamId) => {
      return await this.request(`/teams/${teamId}`, {
        method: 'DELETE',
      });
    },

    // Join a team
    join: async (teamId) => {
      return await this.request(`/teams/join/${teamId}`, {
        method: 'POST',
      });
    },

    // Leave current team
    leave: async () => {
      return await this.request('/teams/leave', {
        method: 'POST',
      });
    },

    // Invite member by LeetCode username
    inviteMember: async (teamId, leetcodeUsername) => {
      return await this.request(`/teams/${teamId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ leetcodeUsername }),
      });
    },

    // Remove member from team (captain only)
    removeMember: async (teamId, memberId) => {
      return await this.request(`/teams/${teamId}/remove-member`, {
        method: 'POST',
        body: JSON.stringify({ memberId }),
      });
    },

    // Check if team name is available
    checkNameAvailability: async (name) => {
      return await this.request(`/teams/check-name/${encodeURIComponent(name)}`);
    }
  };

  // Challenges API
  challenges = {
    getDaily: async () => {
      return await this.request('/challenges/daily');
    },

    submit: async (challengeId, solution) => {
      return await this.request(`/challenges/${challengeId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ solution }),
      });
    }
  };

  // Leaderboard API
  leaderboard = {
    get: async (limit = 50) => {
      return await this.request(`/leaderboard?limit=${limit}`);
    },

    getUserRank: async () => {
      return await this.request('/leaderboard/user-rank');
    }
  };

  // Notifications API
  notifications = {
    get: async () => {
      return await this.request('/notifications');
    },

    markAsRead: async (notificationId) => {
      return await this.request(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    }
  };
}

export const api = new ApiService();
