import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { 
  X, 
  Search, 
  Filter, 
  Trophy, 
  Crown, 
  Medal, 
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target
} from "lucide-react";

export function LeaderboardModal() {
  const { state, actions } = useApp();
  const { modals, leaderboard, teams } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("global"); // global, teams
  const [sortBy, setSortBy] = useState("points"); // points, problems, streak

  if (!modals.leaderboard) return null;

  const closeModal = () => {
    actions.toggleModal('leaderboard', false);
  };

  // Filter and sort data
  const filteredData = filterType === 'global' ? leaderboard : teams;
  const searchFiltered = filteredData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...searchFiltered].sort((a, b) => {
    switch (sortBy) {
      case 'points':
        return (b.totalPoints || b.points) - (a.totalPoints || a.points);
      case 'problems':
        return b.problemsSolved - a.problemsSolved;
      case 'streak':
        return b.weeklyStreak - a.weeklyStreak;
      default:
        return 0;
    }
  });

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getPodiumPosition = (rank) => {
    if (rank === 1) return { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-50" };
    if (rank === 2) return { icon: Medal, color: "text-gray-500", bg: "bg-gray-50" };
    if (rank === 3) return { icon: Medal, color: "text-amber-600", bg: "bg-amber-50" };
    return { icon: Star, color: "text-blue-500", bg: "bg-blue-50" };
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Leaderboard</h2>
                <p className="text-blue-100">Compete with the best coders</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Type */}
              <div className="flex bg-white border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFilterType('global')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filterType === 'global'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Global
                </button>
                <button
                  onClick={() => setFilterType('teams')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filterType === 'teams'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Target className="h-4 w-4 inline mr-2" />
                  Teams
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="points">Sort by Points</option>
                <option value="problems">Sort by Problems</option>
                <option value="streak">Sort by Streak</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {/* Top 3 Podium */}
            {sortedData.length >= 3 && (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Top Performers</h3>
                <div className="flex justify-center items-end space-x-4 mb-6">
                  {/* 2nd Place */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-lg mb-2 mx-auto">
                      {sortedData[1]?.name?.split(' ').map(n => n[0]).join('') || '2'}
                    </div>
                    <div className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mb-1">
                      2nd
                    </div>
                    <p className="font-semibold text-sm">{sortedData[1]?.name}</p>
                    <p className="text-xs text-gray-600">{sortedData[1]?.totalPoints || sortedData[1]?.points} pts</p>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl mb-2 mx-auto relative">
                      {sortedData[0]?.name?.split(' ').map(n => n[0]).join('') || '1'}
                      <Crown className="absolute -top-2 -right-1 h-6 w-6 text-yellow-300" />
                    </div>
                    <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold mb-1">
                      1st
                    </div>
                    <p className="font-bold">{sortedData[0]?.name}</p>
                    <p className="text-sm text-gray-600">{sortedData[0]?.totalPoints || sortedData[0]?.points} pts</p>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-lg mb-2 mx-auto">
                      {sortedData[2]?.name?.split(' ').map(n => n[0]).join('') || '3'}
                    </div>
                    <div className="bg-amber-500 text-amber-900 px-3 py-1 rounded-full text-sm font-medium mb-1">
                      3rd
                    </div>
                    <p className="font-semibold text-sm">{sortedData[2]?.name}</p>
                    <p className="text-xs text-gray-600">{sortedData[2]?.totalPoints || sortedData[2]?.points} pts</p>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Full Rankings */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Full Rankings</h3>
              <div className="space-y-2">
                {sortedData.map((item, index) => {
                  const rank = index + 1;
                  const { icon: RankIcon, color, bg } = getPodiumPosition(rank);
                  
                  return (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                          <RankIcon className={`h-5 w-5 ${color}`} />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {item.name?.split(' ').map(n => n[0]).join('') || rank}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{item.name}</span>
                              {filterType === 'global' && item.country && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {item.country}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{item.totalPoints || item.points} points</span>
                              <span>•</span>
                              <span>{item.problemsSolved} problems</span>
                              {item.weeklyStreak && (
                                <>
                                  <span>•</span>
                                  <span>{item.weeklyStreak} day streak</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">#{rank}</div>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(item.trend || 0)}
                            <span className="text-xs text-gray-500">
                              {item.trend > 0 ? `+${item.trend}` : item.trend}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {sortedData.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No results found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
