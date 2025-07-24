import React from 'react';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = process.env.NODE_ENV === 'production' 
      ? 'wss://your-production-ws.com' 
      : 'ws://localhost:5000';
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.connectionPromise = null;
  }

  // Connect to WebSocket server
  connect(token) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('🔌 Attempting WebSocket connection...');
        this.ws = new WebSocket(`${this.url}?token=${token}`);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket connection closed:', event.code, event.reason);
          this.isConnected = false;
          this.connectionPromise = null;
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(token);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnected = false;
          this.connectionPromise = null;
          reject(error);
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Attempt to reconnect
  attemptReconnect(token) {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
    
    setTimeout(() => {
      this.connect(token).catch(error => {
        console.error('❌ Reconnection failed:', error);
      });
    }, delay);
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload } = data;
    
    console.log('📨 WebSocket message received:', type, payload);
    
    // Notify all listeners for this message type
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`❌ Error in WebSocket listener for ${type}:`, error);
      }
    });
  }

  // Subscribe to messages of a specific type
  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type).push(callback);
    
    console.log(`📡 Subscribed to WebSocket events: ${type}`);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
          console.log(`📡 Unsubscribed from WebSocket events: ${type}`);
        }
      }
    };
  }

  // Send message to server
  send(type, payload) {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return false;
    }

    try {
      const message = JSON.stringify({ type, payload });
      this.ws.send(message);
      console.log('📤 WebSocket message sent:', type, payload);
      return true;
    } catch (error) {
      console.error('❌ Failed to send WebSocket message:', error);
      return false;
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      console.log('🔌 Disconnecting WebSocket...');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.isConnected = false;
      this.connectionPromise = null;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Specific methods for CodeBattle features
  
  // Subscribe to leaderboard updates
  subscribeToLeaderboard(callback) {
    return this.subscribe('leaderboard_update', callback);
  }

  // Subscribe to user score updates
  subscribeToUserScore(callback) {
    return this.subscribe('user_score_update', callback);
  }

  // Subscribe to team updates
  subscribeToTeamUpdates(callback) {
    return this.subscribe('team_update', callback);
  }

  // Subscribe to challenge updates
  subscribeToChallengeUpdates(callback) {
    return this.subscribe('challenge_update', callback);
  }

  // Subscribe to rank changes
  subscribeToRankChanges(callback) {
    return this.subscribe('rank_change', callback);
  }

  // Join a room (for team-specific updates)
  joinRoom(roomId) {
    this.send('join_room', { roomId });
  }

  // Leave a room
  leaveRoom(roomId) {
    this.send('leave_room', { roomId });
  }

  // Request current leaderboard
  requestLeaderboard() {
    this.send('get_leaderboard', {});
  }

  // Ping server to keep connection alive
  ping() {
    this.send('ping', { timestamp: Date.now() });
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// React hook for using WebSocket in components
export const useWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = React.useState({
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  });

  React.useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(webSocketService.getConnectionStatus());
    };

    // Update status initially and then periodically
    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    connect: webSocketService.connect.bind(webSocketService),
    disconnect: webSocketService.disconnect.bind(webSocketService),
    subscribe: webSocketService.subscribe.bind(webSocketService),
    send: webSocketService.send.bind(webSocketService),
    subscribeToLeaderboard: webSocketService.subscribeToLeaderboard.bind(webSocketService),
    subscribeToUserScore: webSocketService.subscribeToUserScore.bind(webSocketService),
    subscribeToTeamUpdates: webSocketService.subscribeToTeamUpdates.bind(webSocketService),
    subscribeToChallengeUpdates: webSocketService.subscribeToChallengeUpdates.bind(webSocketService),
    subscribeToRankChanges: webSocketService.subscribeToRankChanges.bind(webSocketService),
    joinRoom: webSocketService.joinRoom.bind(webSocketService),
    leaveRoom: webSocketService.leaveRoom.bind(webSocketService),
    requestLeaderboard: webSocketService.requestLeaderboard.bind(webSocketService)
  };
};

export default webSocketService;
