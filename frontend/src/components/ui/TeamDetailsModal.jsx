import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { 
  X, 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Crown,
  Medal,
  Star,
  Code,
  CheckCircle,
  Clock,
  Award,
  UserPlus,
  Settings
} from "lucide-react";


//Using export statement here!
export function TeamDetailsModal() {
  const { state, actions } = useApp();
  const { modals, user, teamMembers } = state;
  const [activeTab, setActiveTab] = useState("overview"); // overview, members, stats

  if (!modals.teamDetails) return null;

  const closeModal = () => {
    actions.toggleModal('teamDetails', false);
  };

  // Mock team data - this would come from the backend
  const teamData = {
    id: "1",
    name: "Code Warriors",
    description: "A team of passionate developers working together to solve challenging problems",
    totalScore: 2450,
    rank: 3,
    membersCount: 5,
    createdAt: "2024-01-15",
    weeklyProgress: 85,
    monthlyGoal: 3000,
    averageRating: 1680,
    problemsSolved: 147,
    totalSubmissions: 234,
    successRate: 62.8
  };

  const members = teamMembers || [
    {
      id: "1",
      name: "Alex Johnson",
      leetcodeUsername: "alexj_codes",
      role: "Leader",
      score: 650,
      problemsSolved: 45,
      streak: 12,
      avatar: null,
      isOnline: true,
      lastActive: "2 hours ago"
    },
    {
      id: "2", 
      name: "Sarah Chen",
      leetcodeUsername: "sarah_dev",
      role: "Member",
      score: 580,
      problemsSolved: 38,
      streak: 8,
      avatar: null,
      isOnline: false,
      lastActive: "1 day ago"
    },
    {
      id: "3",
      name: "Mike Rodriguez", 
      leetcodeUsername: "mike_codes",
      role: "Member",
      score: 520,
      problemsSolved: 34,
      streak: 5,
      avatar: null,
      isOnline: true,
      lastActive: "30 minutes ago"
    },
    {
      id: "4",
      name: "Emma Wilson",
      leetcodeUsername: "emma_dev",
      role: "Member", 
      score: 480,
      problemsSolved: 30,
      streak: 3,
      avatar: null,
      isOnline: false,
      lastActive: "3 hours ago"
    }
  ];

  const getRoleIcon = (role) => {
    switch (role) {
      case "Leader":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      default:
        return <Users className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{teamData.name}</h2>
                  <p className="text-blue-100 mt-1">{teamData.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>Rank #{teamData.rank}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{teamData.membersCount} members</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{teamData.totalScore} points</span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: Target },
                { id: "members", label: "Members", icon: Users },
                { id: "stats", label: "Statistics", icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Score</p>
                        <p className="text-2xl font-bold text-blue-900">{teamData.totalScore}</p>
                      </div>
                      <Trophy className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Problems Solved</p>
                        <p className="text-2xl font-bold text-green-900">{teamData.problemsSolved}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                        <p className="text-2xl font-bold text-purple-900">{teamData.successRate}%</p>
                      </div>
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Weekly Progress */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Weekly Progress</h3>
                    <span className="text-sm text-gray-600">{teamData.weeklyProgress}% of goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${teamData.weeklyProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {teamData.totalScore} / {teamData.monthlyGoal} points this month
                  </p>
                </div>

                {/* Team Activity */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Alex solved "Two Sum" problem</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Team reached 2400+ points milestone</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <UserPlus className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Emma joined the team</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Team Members ({members.length})</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <UserPlus className="h-4 w-4" />
                    <span>Invite Member</span>
                  </button>
                </div>
                
                <div className="grid gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {getInitials(member.name)}
                          </div>
                          {member.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{member.name}</h4>
                            {getRoleIcon(member.role)}
                            <span className="text-sm text-gray-500">{member.role}</span>
                          </div>
                          <p className="text-sm text-gray-600">@{member.leetcodeUsername}</p>
                          <p className="text-xs text-gray-500">Last active: {member.lastActive}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{member.score}</p>
                            <p className="text-gray-500">Points</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{member.problemsSolved}</p>
                            <p className="text-gray-500">Solved</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{member.streak}</p>
                            <p className="text-gray-500">Streak</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">#{teamData.rank}</p>
                    <p className="text-sm text-gray-600">Global Rank</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Code className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{teamData.problemsSolved}</p>
                    <p className="text-sm text-gray-600">Problems</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{teamData.successRate}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{teamData.averageRating}</p>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                  </div>
                </div>

                {/* Monthly Goal Progress */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Monthly Goal Progress</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current: {teamData.totalScore} points</span>
                      <span>Goal: {teamData.monthlyGoal} points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${(teamData.totalScore / teamData.monthlyGoal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {teamData.monthlyGoal - teamData.totalScore} points remaining to reach monthly goal
                  </p>
                </div>

                {/* Team Formation */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Team Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-medium">{new Date(teamData.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Submissions</p>
                      <p className="font-medium">{teamData.totalSubmissions}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Team created on {new Date(teamData.createdAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
