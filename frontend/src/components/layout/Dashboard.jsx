import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { NavigationBar } from "./NavigationBar";
import { LeetCodeSync } from "@/components/ui/LeetCodeSync";
import { TeamDetailsModal } from "@/components/ui/TeamDetailsModal";
import { LeaderboardModal } from "@/components/ui/LeaderboardModal";
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
  Zap,
  ChevronRight,
  Crown,
  Medal,
  Flame
} from "lucide-react";

const BentoCard = ({ className, children, gradient, onClick, hover = true }) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl ${gradient} p-6 ${
      onClick ? 'cursor-pointer' : ''
    } ${className}`}
    whileHover={hover && onClick ? { y: -2 } : {}}
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

  const handleViewLeaderboard = () => {
    actions.toggleModal('leaderboard', true);
  };

  const handleSyncLeetCode = () => {
    actions.toggleModal('leetcodeSync', true);
  };

  // Demo toast functions
  const showSuccessToast = () => {
    toast.success('Challenge completed successfully! You earned 150 points.', {
      title: 'Well Done!',
      action: {
        label: 'View Details',
        onClick: () => console.log('View details clicked')
      }
    });
  };

  const showErrorToast = () => {
    toast.error('Failed to submit solution. Please check your code and try again.', {
      title: 'Submission Failed'
    });
  };

  const showWarningToast = () => {
    toast.warning('Your session will expire in 5 minutes. Please save your work.', {
      title: 'Session Warning'
    });
  };

  const showInfoToast = () => {
    toast.info('New daily challenge is now available!', {
      title: 'Daily Challenge',
      action: {
        label: 'Start Challenge',
        onClick: () => console.log('Start challenge clicked')
      }
    });
  };

  const showLoadingToast = () => {
    toast.loading('Analyzing your code performance...');
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

  // Create challenges array from dailyChallenge or use empty array
  const challenges = dailyChallenge ? [dailyChallenge] : [];
  const todayChallenges = challenges.slice(0, 3);

  // Ensure leaderboard is an array
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];

  return (
    <DashboardErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <NavigationBar />
        
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name?.split(' ')[0] || user?.displayName || 'Coder'}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Ready to crush some algorithms today?
            </p>
          </motion.div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* User Stats - Large Card */}
          <BentoCard
            className="md:col-span-2 lg:col-span-2"
            gradient="bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            hover={false}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Your Progress</h3>
              </div>
              <Flame className="h-8 w-8 text-orange-300" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Problems Solved</p>
                <p className="text-3xl font-bold">{displayUserStats.totalSolved}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Weekly Streak</p>
                <p className="text-3xl font-bold">{displayUserStats.weeklyStreak} days</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Global Rank</p>
                <p className="text-2xl font-bold">#{displayUserStats.rank || 'Unranked'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Rating</p>
                <p className="text-2xl font-bold">{displayUserStats.rating}</p>
              </div>
            </div>
          </BentoCard>

          {/* Team Card */}
          <BentoCard
            className="lg:col-span-1"
            gradient={teamData ? "bg-gradient-to-br from-green-500 to-teal-600 text-white" : "bg-gradient-to-br from-gray-400 to-gray-600 text-white"}
            onClick={handleJoinTeam}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold">Team</h3>
            </div>
            
            {teamData ? (
              <div className="space-y-3">
                <div>
                  <p className="text-green-100 text-sm">{teamData.name}</p>
                  <p className="text-xl font-bold">Rank #{teamStats.teamRank || 'Unranked'}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-100">Members</span>
                  <span className="font-semibold">{teamStats.totalMembers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-100">Weekly Progress</span>
                  <span className="font-semibold">{teamStats.weeklyProgress}%</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-200">No team yet</p>
                <div className="flex items-center text-sm text-gray-200">
                  <span>Join or create team</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            )}
          </BentoCard>

          {/* Leaderboard Card */}
          <BentoCard
            className="lg:col-span-1"
            gradient="bg-gradient-to-br from-orange-500 to-red-600 text-white"
            onClick={handleViewLeaderboard}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold">Leaderboard</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-300" />
                <div>
                  <p className="text-orange-100 text-sm">Top Performer</p>
                  <p className="font-bold text-sm">{safeLeaderboard[0]?.name || 'Loading...'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-orange-100 text-sm">Your Position</span>
                <span className="font-bold">#{displayUserStats.rank || 'Unranked'}</span>
              </div>
              
              <div className="flex items-center text-sm text-orange-200">
                <span>View full rankings</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </BentoCard>

          {/* Today's Challenges */}
          <BentoCard
            className="md:col-span-2 lg:col-span-2"
            gradient="bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
            hover={false}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Today's Challenges</h3>
            </div>
            
            <div className="grid gap-3">
              {todayChallenges.length > 0 ? (
                todayChallenges.map((challenge, index) => (
                  <div
                    key={challenge.id || index}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${
                        challenge.difficulty === 'Easy' ? 'bg-green-400' :
                        challenge.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="font-semibold">{challenge.title || 'Challenge'}</p>
                        <p className="text-blue-200 text-sm">{challenge.difficulty || 'Medium'} • {challenge.points || 100} pts</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-blue-200" />
                  </div>
                ))
              ) : (
                <div className="p-3 bg-white/10 rounded-xl text-center">
                  <p className="text-blue-200">No challenges available today</p>
                  <p className="text-blue-300 text-sm mt-1">Check back later!</p>
                </div>
              )}
            </div>
          </BentoCard>

          {/* Recent Activity */}
          <BentoCard
            className="lg:col-span-1"
            gradient="bg-gradient-to-br from-purple-500 to-pink-600 text-white"
            hover={false}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-bold">Recent Activity</h3>
            </div>
            
            <div className="space-y-3">
              {displayUserStats.recentSolves.length > 0 ? (
                displayUserStats.recentSolves.map((solve, index) => (
                  <div key={index} className="space-y-1">
                    <p className="font-semibold text-sm">{solve.name}</p>
                    <div className="flex justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        solve.difficulty === 'Easy' ? 'bg-green-500/30' :
                        solve.difficulty === 'Medium' ? 'bg-yellow-500/30' : 'bg-red-500/30'
                      }`}>
                        {solve.difficulty}
                      </span>
                      <span className="text-purple-200">{solve.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-purple-200 py-4">
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs mt-1">Solve some problems to see your progress!</p>
                </div>
              )}
            </div>
          </BentoCard>

          {/* LeetCode Sync */}
          <BentoCard
            className="lg:col-span-1"
            gradient="bg-gradient-to-br from-teal-500 to-cyan-600 text-white"
            onClick={handleSyncLeetCode}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold">LeetCode Sync</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-teal-100 text-sm">Connected</span>
              </div>
              
              <div>
                <p className="text-teal-100 text-sm">Last sync</p>
                <p className="font-semibold">2 hours ago</p>
              </div>
              
              <div className="flex items-center text-sm text-teal-200">
                <span>Sync now</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </BentoCard>

        </div>

        {/* Toast Demo Section - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Toast Demo (Dev Only)</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={showSuccessToast}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                Success Toast
              </button>
              <button
                onClick={showErrorToast}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Error Toast
              </button>
              <button
                onClick={showWarningToast}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
              >
                Warning Toast
              </button>
              <button
                onClick={showInfoToast}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Info Toast
              </button>
              <button
                onClick={showLoadingToast}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Loading Toast
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {modals.teamDetails && <TeamDetailsModal />}
        {modals.leaderboard && <LeaderboardModal />}
        {modals.leetcodeSync && <LeetCodeSync />}
        </div>
      </div>
    </DashboardErrorBoundary>
  );
}
