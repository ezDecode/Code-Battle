import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '@/services/websocket';
import { useApp } from '@/contexts/AppContext';

const RankChangeIndicator = ({ change }) => {
  if (change === 0) {
    return <Minus className="h-4 w-4 text-gray-400" />;
  }
  
  const isImprovement = change > 0; // Positive change means rank went down (better)
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center ${isImprovement ? 'text-green-500' : 'text-red-500'}`}
    >
      {isImprovement ? (
        <TrendingUp className="h-4 w-4" />
      ) : (
        <TrendingDown className="h-4 w-4" />
      )}
      <span className="ml-1 text-xs font-medium">
        {Math.abs(change)}
      </span>
    </motion.div>
  );
};

const LeaderboardEntry = ({ user, rank, showRankChange = true, isCurrentUser = false }) => {
  const [previousRank, setPreviousRank] = useState(rank);
  const [rankChange, setRankChange] = useState(0);

  useEffect(() => {
    if (rank !== previousRank) {
      setRankChange(previousRank - rank); // Positive means improvement
      setPreviousRank(rank);
    }
  }, [rank, previousRank]);

  const getRankIcon = (position) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankColors = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (position === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    return 'bg-white border border-gray-200';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg shadow-sm transition-all duration-300 ${getRankColors(rank)} ${
        isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">#{rank}</span>
            {getRankIcon(rank)}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              rank <= 3 ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className={`font-medium ${rank <= 3 ? 'text-white' : 'text-gray-900'}`}>
                {user.name || user.displayName}
              </p>
              <p className={`text-xs ${rank <= 3 ? 'text-white/70' : 'text-gray-500'}`}>
                @{user.leetcodeUsername || 'unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {showRankChange && (
            <RankChangeIndicator 
              change={rankChange} 
            />
          )}
          
          <div className="text-right">
            <p className={`text-lg font-bold ${rank <= 3 ? 'text-white' : 'text-gray-900'}`}>
              {user.totalScore || 0}
            </p>
            <p className={`text-xs ${rank <= 3 ? 'text-white/70' : 'text-gray-500'}`}>
              points
            </p>
          </div>
        </div>
      </div>
      
      {isCurrentUser && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-2 border-t border-blue-200"
        >
          <p className="text-xs text-blue-600 font-medium">Your position</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export const RealTimeLeaderboard = ({ limit = 10, showCurrentUser = true }) => {
  const { state } = useApp();
  const { user, leaderboard } = state;
  const [realTimeLeaderboard, setRealTimeLeaderboard] = useState(leaderboard || []);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { 
    isConnected, 
    subscribeToLeaderboard, 
    subscribeToRankChanges,
    requestLeaderboard,
    connect 
  } = useWebSocket();

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && localStorage.getItem('authToken')) {
      connect(localStorage.getItem('authToken')).catch(error => {
        console.error('Failed to connect to WebSocket:', error);
      });
    }
  }, [user, connect]);

  // Subscribe to real-time leaderboard updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeLeaderboard = subscribeToLeaderboard((updatedLeaderboard) => {
      console.log('🏆 Received leaderboard update:', updatedLeaderboard);
      setRealTimeLeaderboard(updatedLeaderboard.slice(0, limit));
      setLastUpdate(new Date());
    });

    const unsubscribeRankChanges = subscribeToRankChanges((rankUpdate) => {
      console.log('📈 Received rank change:', rankUpdate);
      // Handle individual rank changes
      setRealTimeLeaderboard(prev => 
        prev.map(entry => 
          entry.id === rankUpdate.userId 
            ? { ...entry, ...rankUpdate.data }
            : entry
        ).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      );
      setLastUpdate(new Date());
    });

    // Request initial leaderboard data
    requestLeaderboard();

    return () => {
      unsubscribeLeaderboard();
      unsubscribeRankChanges();
    };
  }, [isConnected, subscribeToLeaderboard, subscribeToRankChanges, requestLeaderboard, limit]);

  // Use static leaderboard data if WebSocket is not connected
  useEffect(() => {
    if (!isConnected && leaderboard) {
      setRealTimeLeaderboard(leaderboard.slice(0, limit));
    }
  }, [leaderboard, limit, isConnected]);

  // Find current user's position
  const currentUserRank = realTimeLeaderboard.findIndex(entry => 
    entry.id === user?.id || entry._id === user?._id
  ) + 1;

  const displayLeaderboard = realTimeLeaderboard.slice(0, limit);
  
  // Add current user if not in top rankings and showCurrentUser is true
  const shouldShowCurrentUser = showCurrentUser && currentUserRank > limit && user;
  let currentUserEntry = null;
  
  if (shouldShowCurrentUser) {
    currentUserEntry = realTimeLeaderboard.find(entry => 
      entry.id === user.id || entry._id === user._id
    ) || {
      id: user.id || user._id,
      name: user.name || user.displayName,
      leetcodeUsername: user.leetcodeUsername,
      totalScore: user.totalScore || 0
    };
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Leaderboard</h3>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Offline</span>
            </>
          )}
          <span className="text-xs text-gray-400">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayLeaderboard.map((entry, index) => (
            <LeaderboardEntry
              key={entry.id || entry._id}
              user={entry}
              rank={index + 1}
              showRankChange={isConnected}
              isCurrentUser={entry.id === user?.id || entry._id === user?._id}
            />
          ))}
        </AnimatePresence>

        {/* Current User Entry (if not in top rankings) */}
        {currentUserEntry && (
          <>
            <div className="flex items-center justify-center py-2">
              <div className="text-xs text-gray-400">...</div>
            </div>
            <LeaderboardEntry
              user={currentUserEntry}
              rank={currentUserRank}
              showRankChange={isConnected}
              isCurrentUser={true}
            />
          </>
        )}

        {/* Empty State */}
        {displayLeaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No leaderboard data available</p>
            <p className="text-xs">Complete some challenges to see rankings!</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {isConnected && (
        <div className="text-xs text-center text-gray-400 pt-2 border-t">
          Rankings update in real-time • {displayLeaderboard.length} participants
        </div>
      )}
    </div>
  );
};

export default RealTimeLeaderboard;
