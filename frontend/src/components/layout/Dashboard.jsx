import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { NavigationBar } from "./NavigationBar";
import { TeamDetailsModal } from "@/components/ui/TeamDetailsModal";
import { TeamCreationModal } from "@/components/ui/TeamCreationModal";
import { LeaderboardModal } from "@/components/ui/LeaderboardModal";
import { ProfileSettingsModal } from "@/components/ui/ProfileSettingsModal";
import { DashboardLoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { DashboardErrorBoundary, withErrorBoundary } from "@/components/ui/ComponentErrorBoundary";
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  Code, 
  Calendar,
  Star,
  Award,
  ChevronRight,
  Crown,
  Medal,
  Flame,
  Plus
} from "lucide-react";

const BentoCard = ({ className, children, gradient, onClick, hover = true }) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl ${gradient} p-6 ${
      onClick ? 'cursor-pointer' : ''
    } ${className} transition-all duration-300 shadow-lg hover:shadow-xl`}
    whileHover={hover && onClick ? { y: -4, scale: 1.02 } : hover ? { y: -2 } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative z-10">{children}</div>
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
  </motion.div>
);

export default function Dashboard() {
  const { state, actions } = useApp();
  const { user, team, dailyChallenge, leaderboard, modals, userStats, loading } = state;
  const toast = useToast();

  const handleJoinTeam = () => {
    actions.toggleModal('teamDetails', true);
  };

  const handleCreateTeam = () => {
    actions.toggleModal('teamCreation', true);
  };

  const handleViewLeaderboard = () => {
    actions.toggleModal('leaderboard', true);
  };

  // Show loading skeleton if user is not authenticated or data is loading
  if (loading || !user) {
    return (
      <>
        <NavigationBar />
        <DashboardLoadingSkeleton />
      </>
    );
  }

  // Remove the problematic useEffect that causes infinite loops
  // Data fetching is now handled in AppContext

  // Use real user data with fallbacks for display
  const displayUserStats = {
    totalSolved: user?.leetcodeData?.submitStats?.easy + user?.leetcodeData?.submitStats?.medium + user?.leetcodeData?.submitStats?.hard || userStats.problemsSolved || 0,
    weeklyStreak: user?.streak || userStats.currentStreak || 0,
    rank: user?.leetcodeData?.ranking || userStats.rank || 0,
    rating: user?.totalScore || userStats.rating || 0,
    problemsSolved: user?.leetcodeData?.submitStats?.easy + user?.leetcodeData?.submitStats?.medium + user?.leetcodeData?.submitStats?.hard || userStats.problemsSolved || 0,
    successRate: userStats.successRate || 0,
    currentStreak: user?.streak || userStats.currentStreak || 0,
    weeklyProgress: userStats.weeklyProgress || 0,
    // Use real LeetCode data for recent solves if available, otherwise show empty
    recentSolves: userStats.recentSolves || []
  };

  // Use real team data if available
  const teamData = team || null;

  const teamStats = teamData ? {
    totalMembers: teamData.members?.length || 0,
    weeklyProgress: teamData.weeklyProgress || 0,
    teamRank: teamData.rank || 0,
    totalPoints: teamData.totalPoints || 0
  } : null;

  // Ensure leaderboard is an array
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];

  return (
    <DashboardErrorBoundary>
      <div className="min-h-screen bg-[#D9D9D9]">
        <NavigationBar />
        
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 sm:py-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
              Welcome back, {user?.name?.split(' ')[0] || user?.displayName || 'Coder'}! 👋
            </h1>
            <p className="text-black text-base sm:text-lg">
              Ready to crush some algorithms today?
            </p>
          </motion.div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 xl:grid-cols-12 gap-4 sm:gap-6">
          
          {/* User Stats - Large Dominant Card */}
          <BentoCard
            className="sm:col-span-2 lg:col-span-5 xl:col-span-6 lg:row-span-2"
            gradient="bg-[#FF0000] text-white"
            hover={false}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Your Progress</h3>
              </div>
              <Flame className="h-8 w-8 text-orange-300" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <p className="text-red-100 text-xs sm:text-sm font-medium">Problems Solved</p>
                <p className="text-2xl sm:text-4xl font-bold">{displayUserStats.totalSolved}</p>
              </div>
              <div className="space-y-2">
                <p className="text-red-100 text-xs sm:text-sm font-medium">Weekly Streak</p>
                <p className="text-2xl sm:text-4xl font-bold">{displayUserStats.weeklyStreak} <span className="text-sm sm:text-lg">days</span></p>
              </div>
              <div className="space-y-2">
                <p className="text-red-100 text-xs sm:text-sm font-medium">Global Rank</p>
                <p className="text-xl sm:text-3xl font-bold">#{displayUserStats.rank || 'Unranked'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-red-100 text-xs sm:text-sm font-medium">Rating</p>
                <p className="text-xl sm:text-3xl font-bold">{displayUserStats.rating}</p>
              </div>
            </div>
          </BentoCard>

          {/* Today's Daily Challenge */}
          <BentoCard
            className="sm:col-span-2 lg:col-span-3 xl:col-span-4 lg:row-span-2"
            gradient="bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
            hover={false}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Today's LeetCode Challenge</h3>
              </div>
              {dailyChallenge?.date && (
                <div className="text-xs bg-white/20 px-2 py-1 rounded-lg">
                  {new Date(dailyChallenge.date).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {dailyChallenge ? (
                <div className="space-y-4">
                  {/* Main Challenge Card */}
                  <div
                    className="p-4 bg-white/10 rounded-xl hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                    onClick={() => dailyChallenge.link && window.open(dailyChallenge.link, '_blank')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          dailyChallenge.difficulty === 'Easy' ? 'bg-green-400' :
                          dailyChallenge.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="font-semibold text-lg group-hover:text-blue-200 transition-colors">
                            {dailyChallenge.title}
                          </p>
                          <p className="text-blue-200 text-sm">
                            {dailyChallenge.difficulty} • {dailyChallenge.points} pts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-200" />
                        <ChevronRight className="h-5 w-5 text-blue-200 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    
                    {/* Challenge Description */}
                    {dailyChallenge.description && (
                      <p className="text-blue-100 text-sm mb-3 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis'
                      }}>
                        {dailyChallenge.description}
                      </p>
                    )}
                    
                    {/* Topic Tags */}
                    {dailyChallenge.topicTags && dailyChallenge.topicTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dailyChallenge.topicTags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-white/20 text-blue-100 px-2 py-1 rounded-full"
                          >
                            {tag.name || tag}
                          </span>
                        ))}
                        {dailyChallenge.topicTags.length > 3 && (
                          <span className="text-xs bg-white/20 text-blue-100 px-2 py-1 rounded-full">
                            +{dailyChallenge.topicTags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-blue-200">
                        Click to solve on LeetCode
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-blue-200">
                        <Star className="h-3 w-3" />
                        <span>Daily Challenge</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/10 rounded-xl text-center">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 rounded-full bg-green-400" />
                        <div>
                          <p className="font-semibold">Loading daily challenge...</p>
                          <p className="text-blue-200 text-sm">Please wait</p>
                        </div>
                      </div>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-200 border-t-transparent rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </BentoCard>

          {/* Leaderboard Card */}
          <BentoCard
            className="sm:col-span-1 lg:col-span-3 xl:col-span-3"
            gradient="bg-gradient-to-br from-orange-500 to-red-600 text-white"
            onClick={handleViewLeaderboard}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold">Leaderboard</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-yellow-300" />
                <div>
                  <p className="text-orange-100 text-sm">Top Performer</p>
                  <p className="font-bold">{safeLeaderboard[0]?.name || 'Lark Mahem'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-orange-100 text-sm">Your Position</span>
                <span className="font-bold text-lg">#{displayUserStats.rank || '2581316'}</span>
              </div>
              
              <div className="flex items-center text-sm text-orange-200 hover:text-white transition-colors">
                <span>View full rankings</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </BentoCard>

          {/* Team Card */}
          <BentoCard
            className="sm:col-span-2 lg:col-span-3 xl:col-span-3"
            gradient={teamData ? "bg-gradient-to-br from-green-500 to-teal-600 text-white" : "bg-gradient-to-br from-gray-400 to-gray-600 text-white"}
            onClick={teamData ? handleJoinTeam : undefined}
            hover={!!teamData}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold">Team</h3>
            </div>
            
            {teamData ? (
              <div className="space-y-4">
                <div>
                  <p className="text-green-100 text-sm">{teamData.name}</p>
                  <p className="text-xl font-bold">Rank #{teamStats.teamRank || 'Unranked'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-100">Members</span>
                    <span className="font-semibold">{teamStats.totalMembers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-100">Weekly Progress</span>
                    <span className="font-semibold">{teamStats.weeklyProgress}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-200">No team yet</p>
                <div className="space-y-2">
                  <button
                    onClick={handleCreateTeam}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg p-2 sm:p-3 text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Team</span>
                  </button>
                  <button
                    onClick={handleJoinTeam}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-2 sm:p-3 text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Users className="h-4 w-4" />
                    <span>Join Team</span>
                  </button>
                </div>
              </div>
            )}
          </BentoCard>

        </div>

        {/* Modals */}
        {modals.teamDetails && <TeamDetailsModal />}
        {modals.teamCreation && <TeamCreationModal />}
        {modals.leaderboard && <LeaderboardModal />}
        {modals.profileSettings && <ProfileSettingsModal />}
        </div>
      </div>
    </DashboardErrorBoundary>
  );
}
