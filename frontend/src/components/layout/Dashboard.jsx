import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { NavigationBar } from "./NavigationBar";
import { TeamCreationModal } from "@/components/ui/TeamCreationModal";
import { LeaderboardModal } from "@/components/ui/LeaderboardModal";
import { ProfileSettingsModal } from "@/components/ui/ProfileSettingsModal";
import { DashboardLoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { DashboardErrorBoundary } from "@/components/ui/ComponentErrorBoundary";
import { 
  Trophy, 
  Users, 
  Target, 
  Code, 
  Calendar,
  Star,
  Award,
  ChevronRight,
  Crown,
  Flame,
  RefreshCw,
  TrendingUp,
  Clock,
  Zap,
  BookOpen,
  CheckCircle,
  PlayCircle,
  BarChart3
} from "lucide-react";

export default function Dashboard() {
  const { state, actions } = useApp();
  const { user, dailyChallenge, leaderboard, modals, userStats, loading } = state;
  const toast = useToast();
  const [refreshingChallenge, setRefreshingChallenge] = useState(false);
  const [lastUserId, setLastUserId] = useState(null);

  // Validate user session and clear cache if user changed
  useEffect(() => {
    if (user?.id && lastUserId && user.id !== lastUserId) {
      console.log('🔄 User change detected in Dashboard, clearing cached data');
      // Clear any component-level cache
      setRefreshingChallenge(false);
      // Force refresh of dashboard data
      actions.fetchDashboardData();
    }
    if (user?.id) {
      setLastUserId(user.id);
    }
  }, [user?.id, lastUserId, actions]);

  const handleViewLeaderboard = () => actions.toggleModal('leaderboard', true);

  const handleRefreshDailyChallenge = async () => {
    setRefreshingChallenge(true);
    try {
      await actions.fetchDashboardData();
      toast.show('Daily challenge refreshed!', 'success');
    } catch {
      toast.show('Failed to refresh daily challenge', 'error');
    } finally {
      setRefreshingChallenge(false);
    }
  };

  if (loading || !user) {
    return (
      <>
        <NavigationBar />
        <DashboardLoadingSkeleton />
      </>
    );
  }

  // User statistics with fallbacks
  const stats = {
    totalSolved: user?.leetcodeData?.submitStats?.easy + user?.leetcodeData?.submitStats?.medium + user?.leetcodeData?.submitStats?.hard || 0,
    streak: user?.streak || 0,
    rank: user?.leetcodeData?.ranking || 0,
    rating: user?.totalScore || 0,
    successRate: userStats?.successRate || 0,
    weeklyProgress: userStats?.weeklyProgress || 0
  };

  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];

  return (
    <DashboardErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        
        <main role="main" aria-label="Dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Welcome back, {user?.name?.split(' ')[0] || 'Coder'}! 👋
                  </h1>
                  <p className="text-gray-600">Ready to solve some problems today?</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalSolved}</div>
                    <div className="text-sm text-gray-500">Solved</div>
                  </div>
                  <div className="w-px h-12 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
                    <div className="text-sm text-gray-500">Streak</div>
                  </div>
                  <div className="w-px h-12 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {stats.rank ? `#${stats.rank}` : 'Unranked'}
                    </div>
                    <div className="text-sm text-gray-500">Rank</div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              {stats.weeklyProgress > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
                    <span className="text-sm font-semibold text-blue-600">{stats.weeklyProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{width: `${stats.weeklyProgress}%`}}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Daily Challenge Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Daily Challenge</h2>
                        <p className="text-red-100 text-sm">Today's featured problem</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRefreshDailyChallenge}
                      disabled={refreshingChallenge}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshingChallenge ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {dailyChallenge ? (
                    <div
                      className="cursor-pointer group"
                      onClick={() => dailyChallenge.link && window.open(dailyChallenge.link, '_blank')}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              dailyChallenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              dailyChallenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {dailyChallenge.difficulty}
                            </span>
                            {dailyChallenge.points && (
                              <span className="text-sm text-gray-500">{dailyChallenge.points} points</span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-500 transition-colors mb-2">
                            {dailyChallenge.title}
                          </h3>
                          
                          {dailyChallenge.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {dailyChallenge.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform ml-4" />
                      </div>
                      
                      {dailyChallenge.topicTags && dailyChallenge.topicTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {dailyChallenge.topicTags.slice(0, 4).map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700"
                            >
                              {tag.name || tag}
                            </span>
                          ))}
                          {dailyChallenge.topicTags.length > 4 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700">
                              +{dailyChallenge.topicTags.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-red-500 rounded-full mx-auto mb-4" />
                      <p className="text-gray-600">Loading challenge...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Performance</h3>
                </div>
                
                <div className="space-y-4">
                  {stats.successRate > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="text-sm font-semibold text-green-600">{stats.successRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{width: `${stats.successRate}%`}}
                        ></div>
                      </div>
                    </>
                  )}
                  
                  {stats.rating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Rating</span>
                      <span className="text-sm font-semibold text-purple-600">{stats.rating}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-600">Current Streak: {stats.streak} days</span>
                  </div>
                  
                  {stats.successRate === 0 && stats.rating === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No performance data available yet</p>
                      <p className="text-xs text-gray-400 mt-1">Start solving problems to see your stats!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                {userStats?.recentActivity && userStats.recentActivity.length > 0 ? (
                  userStats.recentActivity.map((activity, index) => (
                    <div key={index} className={`flex items-start gap-4 p-3 rounded-lg ${
                      activity.type === 'solved' ? 'bg-green-50' :
                      activity.type === 'attempted' ? 'bg-blue-50' : 'bg-purple-50'
                    }`}>
                      {activity.type === 'solved' && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
                      {activity.type === 'attempted' && <PlayCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                      {activity.type === 'other' && <Users className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Your coding activity will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer group"
              onClick={handleViewLeaderboard}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Leaderboard</h3>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className="space-y-3">
                {safeLeaderboard.length > 0 ? (
                  safeLeaderboard.slice(0, 3).map((player, index) => (
                    <div key={index} className={`flex items-center gap-4 p-3 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' :
                      index === 1 ? 'bg-gray-50' : 'bg-amber-50'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                        index === 1 ? 'bg-gray-300' : 'bg-amber-200'
                      }`}>
                        {index === 0 ? (
                          <Crown className="h-4 w-4 text-white" />
                        ) : (
                          <span className={`text-sm font-bold ${
                            index === 1 ? 'text-gray-600' : 'text-amber-700'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`${index === 0 ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                          {player.name}
                        </p>
                        <p className="text-sm text-gray-600">{player.score} points</p>
                      </div>
                      <span className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No leaderboard data</p>
                    <p className="text-sm text-gray-400 mt-1">Rankings will appear here</p>
                  </div>
                )}
              </div>
              
              {stats.rank > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Your Position</span>
                    <span className="font-bold text-lg text-blue-600">#{stats.rank}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Section */}
          {/* {teamData ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Team: {teamData.name}</h3>
                    <p className="text-sm text-gray-600">
                      {teamData.members?.length || 0} members
                      {teamData.rank && ` • Rank #${teamData.rank}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Create a Team</h3>
                    <p className="text-sm text-gray-600">Start collaborating with other coders!</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateTeam}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Team
                  </button>
                </div>
              </div>
            </div>
          )} */}

          {/* Modals */}
          {modals.teamCreation && <TeamCreationModal />}
          {modals.leaderboard && <LeaderboardModal />}
          {modals.profileSettings && <ProfileSettingsModal />}
        </main>
      </div>
    </DashboardErrorBoundary>
  );
}
