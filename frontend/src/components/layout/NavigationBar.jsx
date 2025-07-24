import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Bell, LogOut, User, Menu, X, ChevronDown, Zap, RefreshCw, Users } from "lucide-react";

export function NavigationBar() {
  const { state, actions } = useApp();
  const { user, notifications, loading } = state;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const toast = useToast();
  const teamDropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    actions.logout();
    setIsAvatarDropdownOpen(false);
  };

  const handleCreateTeam = () => {
    actions.toggleModal('teamCreation', true);
    setTeamDropdownOpen(false);
  };

  const handleJoinTeam = () => {
    actions.toggleModal('teamDetails', true);
    setTeamDropdownOpen(false);
  };

  // Close team dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target)) {
        setTeamDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    
    try {
      await toast.promise(
        actions.syncLeetCode ? actions.syncLeetCode() : Promise.reject(new Error('Sync not available')),
        {
          loading: 'Syncing with LeetCode...',
          success: 'Successfully synced with LeetCode!',
          error: 'Failed to sync with LeetCode. Please try again.'
        }
      );
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQuickSync = async () => {
    setIsAvatarDropdownOpen(false);
    await handleSyncNow();
  };

  const toggleNotifications = () => {
    actions.toggleModal('notifications', true);
  };

  return (
    <nav className="sticky top-0 z-40 w-full">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-black">CodeBattle</span>
            <span className="text-xs text-black -mt-1 hidden sm:block">Gamified Coding</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Team Dropdown */}
          <div className="relative" ref={teamDropdownRef}>
            <button
              onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
              className="px-4 py-2 bg-[#FF0000] text-white rounded-lg hover:bg-[#FF0000]/90 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Team
              <ChevronDown className={`h-4 w-4 transition-transform ${teamDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {teamDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleCreateTeam}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Create Team
                </button>
                <button
                  onClick={handleJoinTeam}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Join Team
                </button>
              </div>
            )}
          </div>

          {/* Sync Now Button */}
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || loading}
            className="px-4 py-2 bg-[#FF0000] text-white rounded-lg hover:bg-[#FF0000]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>

          {/* Notifications */}
          <button
            onClick={toggleNotifications}
            className="relative p-2 text-black hover:text-[#FF0000] hover:bg-black/10 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF0000] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile with Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setIsAvatarDropdownOpen(true)}
              onMouseLeave={() => setIsAvatarDropdownOpen(false)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-black/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar user={user} size="md" />
                <ChevronDown className="h-4 w-4 text-black" />
              </div>
            </button>

            {/* Avatar Dropdown */}
            <AnimatePresence>
              {isAvatarDropdownOpen && (
                <div
                  onMouseEnter={() => setIsAvatarDropdownOpen(true)}
                  onMouseLeave={() => setIsAvatarDropdownOpen(false)}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Avatar user={user} size="lg" />
                      <div>
                        <div className="text-lg font-semibold text-black">{user?.displayName || user?.name}</div>
                        <div className="text-sm text-[#FF0000] font-medium">
                          {user?.totalScore || 0} points
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        actions.toggleModal('profileSettings', true);
                        setIsAvatarDropdownOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-base">Profile Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleNotifications();
                        setIsAvatarDropdownOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="text-base">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-[#FF0000] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={handleQuickSync}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-[#FF0000] hover:bg-red-50 transition-colors"
                    >
                      <Zap className="h-5 w-5" />
                      <span className="text-base">Sync LeetCode</span>
                    </button>

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-[#FF0000] hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-base">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-black hover:text-[#FF0000] hover:bg-black/10 rounded-xl transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <Avatar user={user} size="md" />
                <div>
                  <div className="text-base font-semibold text-black">{user?.name}</div>
                  <div className="text-sm text-[#FF0000] font-medium">
                    {user?.totalScore || 0} points
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => {
                  handleCreateTeam();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-black hover:text-[#FF0000] hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Users className="h-5 w-5" />
                <span className="text-base">Create Team</span>
              </button>

              <button
                onClick={() => {
                  handleJoinTeam();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-black hover:text-[#FF0000] hover:bg-gray-50 rounded-xl transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-base">Join Team</span>
              </button>

              <button
                onClick={() => {
                  toggleNotifications();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-black hover:text-[#FF0000] hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="text-base">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-[#FF0000] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  handleSyncNow();
                  setIsMenuOpen(false);
                }}
                disabled={isSyncing || loading}
                className="flex items-center space-x-3 w-full p-2 text-[#FF0000] hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSyncing ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="h-5 w-5" />
                )}
                <span className="text-base">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              {/* Logout - Separated */}
              <div className="border-t border-gray-200 pt-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-2 text-[#FF0000] hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-base">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
