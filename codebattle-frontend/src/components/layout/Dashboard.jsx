import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { NavigationBar } from "./NavigationBar";
import { NotificationSystem } from "@/components/ui/NotificationSystem";
import { LeetCodeSync } from "@/components/ui/LeetCodeSync";
import { TeamDetailsModal } from "@/components/ui/TeamDetailsModal";
import { LeaderboardModal } from "@/components/ui/LeaderboardModal";
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
    whileHover={hover ? { scale: 1.02, y: -4 } : {}}
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
  const { user, team, challenges, leaderboard, modals } = state;

  const handleJoinTeam = () => {
    actions.toggleModal('teamDetails', true);
  };

  const handleViewLeaderboard = () => {
    actions.toggleModal('leaderboard', true);
  };

  const handleSyncLeetCode = () => {
    actions.toggleModal('leetcodeSync', true);
  };

  // Enhanced mock data for better visual appeal
  const userStats = {
    totalSolved: user?.problemsSolved || 234,
    weeklyStreak: user?.weeklyStreak || 12,
    rank: user?.rank || 156,
    rating: user?.rating || 1847,
    recentSolves: [
      { name: "Two Sum", difficulty: "Easy", time: "2 hours ago" },
      { name: "Binary Tree Inorder", difficulty: "Medium", time: "5 hours ago" },
      { name: "Valid Parentheses", difficulty: "Easy", time: "1 day ago" },
    ]
  };

  const teamStats = team ? {
    totalMembers: team.members?.length || 8,
    weeklyProgress: team.weeklyProgress || 89,
    teamRank: team.rank || 23,
    totalPoints: team.totalPoints || 12450
  } : null;

  const todayChallenges = challenges.slice(0, 3);

  return (
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
            Welcome back, {user?.name?.split(' ')[0] || 'Coder'}! 👋
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
                <p className="text-3xl font-bold">{userStats.totalSolved}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Weekly Streak</p>
                <p className="text-3xl font-bold">{userStats.weeklyStreak} days</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Global Rank</p>
                <p className="text-2xl font-bold">#{userStats.rank}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Rating</p>
                <p className="text-2xl font-bold">{userStats.rating}</p>
              </div>
            </div>
          </BentoCard>

          {/* Team Card */}
          <BentoCard
            className="lg:col-span-1"
            gradient={team ? "bg-gradient-to-br from-green-500 to-teal-600 text-white" : "bg-gradient-to-br from-gray-400 to-gray-600 text-white"}
            onClick={handleJoinTeam}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold">Team</h3>
            </div>
            
            {team ? (
              <div className="space-y-3">
                <div>
                  <p className="text-green-100 text-sm">{team.name}</p>
                  <p className="text-xl font-bold">Rank #{teamStats.teamRank}</p>
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
                  <p className="font-bold text-sm">{leaderboard[0]?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-orange-100 text-sm">Your Position</span>
                <span className="font-bold">#{userStats.rank}</span>
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
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Today's Challenges</h3>
            </div>
            
            <div className="grid gap-3">
              {todayChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  className="flex items-center justify-between p-3 bg-white/10 rounded-xl"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${
                      challenge.difficulty === 'Easy' ? 'bg-green-400' :
                      challenge.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <p className="font-semibold">{challenge.title}</p>
                      <p className="text-blue-200 text-sm">{challenge.difficulty} • {challenge.points} pts</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-blue-200" />
                </motion.div>
              ))}
            </div>
          </BentoCard>

          {/* Recent Activity */}
          <BentoCard
            className="lg:col-span-1"
            gradient="bg-gradient-to-br from-purple-500 to-pink-600 text-white"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-bold">Recent Activity</h3>
            </div>
            
            <div className="space-y-3">
              {userStats.recentSolves.map((solve, index) => (
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
              ))}
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
      </div>

      {/* Modals */}
      {modals.teamDetails && <TeamDetailsModal />}
      {modals.leaderboard && <LeaderboardModal />}
      {modals.leetcodeSync && <LeetCodeSync />}
      
      <NotificationSystem />
    </div>
  );
}
