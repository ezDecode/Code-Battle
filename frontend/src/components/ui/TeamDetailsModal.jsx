import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/services/api";
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
  Settings,
  UserX,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react";


//Using export statement here!
export function TeamDetailsModal() {
  const { state, actions } = useApp();
  const { modals, user, teamMembers } = state;
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview"); // overview, members, stats
  const [inviteUsername, setInviteUsername] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    isPublic: true
  });

  if (!modals.teamDetails) return null;

  const closeModal = () => {
    actions.toggleModal('teamDetails', false);
    setInviteUsername("");
    setVerificationResult(null);
    setShowDeleteConfirm(false);
    setShowEditModal(false);
  };

  // Get real team data from context
  const { team } = state;
  const teamData = team || null;
  const members = teamMembers || [];

  // Check if current user is captain
  const isCapt = teamData && user && teamData.captain && 
    (teamData.captain._id === user.id || teamData.captain === user.id);

  // Initialize edit form when team data is available
  useEffect(() => {
    if (teamData && showEditModal) {
      setEditFormData({
        name: teamData.name || "",
        description: teamData.description || "",
        isPublic: teamData.isPublic !== false
      });
    }
  }, [teamData, showEditModal]);

  const handleInviteMember = async () => {
    if (!inviteUsername.trim() || !teamData) return;
    
    setIsInviting(true);
    try {
      const response = await api.teams.inviteMember(teamData._id, inviteUsername.trim());
      
      toast.success(`Successfully invited ${inviteUsername}!`, {
        title: 'Member Invited! 🎉'
      });
      
      // Refresh team data
      actions.fetchDashboardData();
      setInviteUsername("");
      setVerificationResult(null);
      
    } catch (error) {
      toast.error(error.message || 'Failed to invite member', {
        title: 'Invitation Failed'
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleVerifyUsername = async () => {
    if (!inviteUsername.trim()) return;
    
    setIsVerifying(true);
    try {
      const result = await api.leetcode.verify(inviteUsername.trim());
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ 
        valid: false, 
        message: 'LeetCode username not found' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!teamData || !window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await api.teams.removeMember(teamData._id, memberId);
      
      toast.success('Member removed successfully', {
        title: 'Member Removed'
      });
      
      // Refresh team data
      actions.fetchDashboardData();
      
    } catch (error) {
      toast.error(error.message || 'Failed to remove member', {
        title: 'Remove Failed'
      });
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!teamData) return;
    
    try {
      await api.teams.update(teamData._id, editFormData);
      
      toast.success('Team updated successfully!', {
        title: 'Team Updated! ✨'
      });
      
      // Refresh team data
      actions.fetchDashboardData();
      setShowEditModal(false);
      
    } catch (error) {
      toast.error(error.message || 'Failed to update team', {
        title: 'Update Failed'
      });
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamData) return;
    
    try {
      await api.teams.delete(teamData._id);
      
      toast.success('Team deleted successfully', {
        title: 'Team Deleted'
      });
      
      // Clear team data and close modal
      actions.setTeam(null);
      actions.fetchDashboardData();
      closeModal();
      
    } catch (error) {
      toast.error(error.message || 'Failed to delete team', {
        title: 'Delete Failed'
      });
    }
  };

  // Show message if no team data
  if (!teamData) {
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
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Found</h3>
              <p className="text-gray-600 mb-4">You're not currently part of a team. Join or create a team to start collaborating!</p>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
                  <h2 className="text-2xl font-bold">{teamData?.name || 'Team'}</h2>
                  <p className="text-blue-100 mt-1">{teamData?.description || 'Team description'}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>Rank #{teamData?.rank || 'Unranked'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{teamData?.members?.length || teamData?.membersCount || 0} members</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{teamData?.totalScore || 0} points</span>
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
                        <p className="text-2xl font-bold text-blue-900">{teamData?.totalScore || 0}</p>
                      </div>
                      <Trophy className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Problems Solved</p>
                        <p className="text-2xl font-bold text-green-900">{teamData?.problemsSolved || 0}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                        <p className="text-2xl font-bold text-purple-900">{teamData?.successRate || 0}%</p>
                      </div>
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Weekly Progress */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Weekly Progress</h3>
                    <span className="text-sm text-gray-600">{teamData?.weeklyProgress || 0}% of goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${teamData?.weeklyProgress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {teamData?.totalScore || 0} / {teamData?.monthlyGoal || 0} points this month
                  </p>
                </div>

                {/* Team Activity */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    {teamData?.recentActivity?.length > 0 ? (
                      teamData.recentActivity.map((activity, index) => {
                        const activityKey = `activity-${index}-${activity.id || activity.time || Date.now()}-${Math.random()}`;
                        return (
                          <div key={activityKey} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No recent activity</p>
                        <p className="text-xs mt-1">Team activity will appear here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Management (Captain Only) */}
                {isCapt && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Team Management</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Team</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Team</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Team Members ({members.length})</h3>
                  {isCapt && (
                    <button 
                      onClick={() => setActiveTab('invite')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>
                
                <div className="grid gap-4">
                  {members.length > 0 ? (
                    members.map((member, index) => {
                      const memberId = member.id || member._id || `member-${index}`;
                      return (
                        <div key={memberId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {getInitials(member.name || member.displayName || 'U')}
                            </div>
                            {member.isOnline && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{member.name || member.displayName || 'Team Member'}</h4>
                              {getRoleIcon(member.role || 'Member')}
                              <span className="text-sm text-gray-500">{member.role || 'Member'}</span>
                            </div>
                            <p className="text-sm text-gray-600">@{member.leetcodeUsername || 'username'}</p>
                            <p className="text-xs text-gray-500">Last active: {member.lastActive || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="text-center">
                                <p className="font-bold text-gray-900">{member.score || member.totalScore || 0}</p>
                                <p className="text-gray-500">Points</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold text-gray-900">{member.problemsSolved || 0}</p>
                                <p className="text-gray-500">Solved</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold text-gray-900">{member.streak || 0}</p>
                                <p className="text-gray-500">Streak</p>
                              </div>
                            </div>
                          </div>
                          {isCapt && member._id !== user?.id && (
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove member"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No team members found</p>
                      <p className="text-sm mt-1">Invite members to start collaborating</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "invite" && isCapt && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Invite New Member</h3>
                  <button
                    onClick={() => setActiveTab('members')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LeetCode Username
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={inviteUsername}
                        onChange={(e) => {
                          setInviteUsername(e.target.value);
                          setVerificationResult(null);
                        }}
                        placeholder="Enter LeetCode username"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleVerifyUsername}
                        disabled={!inviteUsername.trim() || isVerifying}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isVerifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span>Verify</span>
                      </button>
                    </div>
                  </div>

                  {verificationResult && (
                    <div className={`p-4 rounded-lg ${
                      verificationResult.valid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {verificationResult.valid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          verificationResult.valid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {verificationResult.valid ? 'Valid LeetCode User' : 'User Not Found'}
                        </span>
                      </div>
                      {verificationResult.valid && verificationResult.profile && (
                        <div className="mt-2 text-sm text-green-700">
                          <p>Name: {verificationResult.profile.name || 'N/A'}</p>
                          <p>Ranking: {verificationResult.profile.ranking || 'N/A'}</p>
                        </div>
                      )}
                      {!verificationResult.valid && (
                        <p className="mt-1 text-sm text-red-700">
                          {verificationResult.message || 'This LeetCode username does not exist'}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleInviteMember}
                    disabled={!verificationResult?.valid || isInviting}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isInviting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <UserPlus className="h-5 w-5" />
                    )}
                    <span>{isInviting ? 'Inviting...' : 'Send Invitation'}</span>
                  </button>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">How it works:</p>
                        <ul className="mt-1 space-y-1 list-disc list-inside">
                          <li>Enter the LeetCode username of the person you want to invite</li>
                          <li>We'll verify the username exists on LeetCode</li>
                          <li>If they have an account on our platform, they'll be added instantly</li>
                          <li>If not, they'll need to sign up first with that LeetCode username</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">#{teamData?.rank || 'Unranked'}</p>
                    <p className="text-sm text-gray-600">Global Rank</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Code className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{teamData?.problemsSolved || 0}</p>
                    <p className="text-sm text-gray-600">Problems</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{teamData?.successRate || 0}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{teamData?.averageRating || 0}</p>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                  </div>
                </div>

                {/* Monthly Goal Progress */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Monthly Goal Progress</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current: {teamData?.totalScore || 0} points</span>
                      <span>Goal: {teamData?.monthlyGoal || 0} points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${teamData?.monthlyGoal > 0 ? (teamData?.totalScore || 0) / teamData.monthlyGoal * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.max(0, (teamData?.monthlyGoal || 0) - (teamData?.totalScore || 0))} points remaining to reach monthly goal
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
                      <p className="font-medium">{teamData?.createdAt ? new Date(teamData.createdAt).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Submissions</p>
                      <p className="font-medium">{teamData?.totalSubmissions || 0}</p>
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
                Team created on {teamData?.createdAt ? new Date(teamData.createdAt).toLocaleDateString() : 'Unknown date'}
              </p>
              <div className="flex space-x-3">
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

      {/* Edit Team Modal */}
      {showEditModal && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Team</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Privacy
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={editFormData.isPublic}
                      onChange={() => setEditFormData(prev => ({...prev, isPublic: true}))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Public - Anyone can see and join</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!editFormData.isPublic}
                      onChange={() => setEditFormData(prev => ({...prev, isPublic: false}))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Private - Invite only</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Team
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Team</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> Deleting this team will:
              </p>
              <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                <li>Remove all members from the team</li>
                <li>Delete all team data and statistics</li>
                <li>Cancel any ongoing challenges</li>
              </ul>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>"{teamData?.name}"</strong>?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Team
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
