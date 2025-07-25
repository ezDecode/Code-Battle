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
  const avatarDropdownRef = useRef(null);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target)) {
        setTeamDropdownOpen(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target)) {
        setIsAvatarDropdownOpen(false);
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
    <nav 
      className="sticky top-0 z-40 w-full border-b border-gray-200/50 backdrop-blur-sm"
      style={{ 
        backgroundColor: 'rgba(248, 248, 248, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Main Navigation Container - Matches LandingPage exactly */}
      <div 
        className="mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20"
        style={{ maxWidth: '1600px' }}
      >
        <div className="flex items-center justify-between" style={{ minHeight: '80px' }}>
          
          {/* Logo Section - Perfect alignment with landing page */}
          <div className="flex-shrink-0">
            <div 
              className="text-black font-bold"
              style={{
                fontSize: 'clamp(24px, 6vw, 36px)',
                fontWeight: '700',
                fontFamily: 'Outreque, sans-serif',
                lineHeight: '1'
              }}
            >
              CodeBattle
            </div>
          </div>

          {/* Desktop Navigation - Improved spacing and layout */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            
            {/* Team Actions */}
            <div className="flex items-center space-x-3">
              {/* Team Dropdown */}
              <div className="relative" ref={teamDropdownRef}>
                <button
                  onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500 text-black rounded-full hover:bg-red-600 focus:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 font-bold shadow-sm"
                  style={{
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    fontFamily: 'Outreque, sans-serif',
                    fontWeight: '700',
                    minWidth: '120px',
                    height: '44px'
                  }}
                >
                  <Users className="h-4 w-4" />
                  <span>Team</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${teamDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {teamDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 backdrop-blur-sm">
                      <button
                        onClick={handleCreateTeam}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                        style={{ 
                          fontFamily: 'Outreque, sans-serif',
                          fontSize: '15px'
                        }}
                      >
                        <Users className="h-4 w-4" />
                        <span>Create Team</span>
                      </button>
                      <button
                        onClick={handleJoinTeam}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                        style={{ 
                          fontFamily: 'Outreque, sans-serif',
                          fontSize: '15px'
                        }}
                      >
                        <User className="h-4 w-4" />
                        <span>Join Team</span>
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sync Button */}
              <button
                onClick={handleSyncNow}
                disabled={isSyncing || loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500 text-black rounded-full hover:bg-red-600 focus:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm"
                style={{
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  fontFamily: 'Outreque, sans-serif',
                  fontWeight: '700',
                  minWidth: '120px',
                  height: '44px'
                }}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Sync Now</span>
                  </>
                )}
              </button>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4 ml-6 border-l border-gray-300 pl-6">
              {/* Notifications */}
              <button
                onClick={toggleNotifications}
                className="relative p-3 text-black hover:text-red-500 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative" ref={avatarDropdownRef}>
                <button
                  onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  <Avatar user={user} size="md" />
                  <div className="hidden lg:block text-left">
                    <div 
                      className="text-sm font-bold text-black leading-tight"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      {user?.displayName || user?.name || 'User'}
                    </div>
                    <div 
                      className="text-xs text-red-500 font-medium"
                      style={{ fontFamily: 'Outreque, sans-serif' }}
                    >
                      {user?.totalScore || 0} pts
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${isAvatarDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Avatar Dropdown Menu */}
                <AnimatePresence>
                  {isAvatarDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-50 backdrop-blur-sm">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Avatar user={user} size="lg" />
                          <div>
                            <div 
                              className="text-lg font-bold text-black"
                              style={{ fontFamily: 'Outreque, sans-serif' }}
                            >
                              {user?.displayName || user?.name || 'User'}
                            </div>
                            <div 
                              className="text-sm text-red-500 font-medium"
                              style={{ fontFamily: 'Outreque, sans-serif' }}
                            >
                              {user?.totalScore || 0} points earned
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
                          className="flex items-center space-x-3 w-full px-4 py-3 text-black hover:bg-gray-50 transition-colors"
                          style={{ fontFamily: 'Outreque, sans-serif' }}
                        >
                          <User className="h-5 w-5 text-gray-600" />
                          <span className="text-base">Profile Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            toggleNotifications();
                            setIsAvatarDropdownOpen(false);
                          }}
                          className="flex items-center justify-between w-full px-4 py-3 text-black hover:bg-gray-50 transition-colors"
                          style={{ fontFamily: 'Outreque, sans-serif' }}
                        >
                          <div className="flex items-center space-x-3">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <span className="text-base">Notifications</span>
                          </div>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={handleQuickSync}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
                          style={{ fontFamily: 'Outreque, sans-serif' }}
                        >
                          <Zap className="h-5 w-5" />
                          <span className="text-base">Quick Sync LeetCode</span>
                        </button>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 transition-colors font-medium"
                            style={{ fontFamily: 'Outreque, sans-serif' }}
                          >
                            <LogOut className="h-5 w-5" />
                            <span className="text-base">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 text-black hover:text-red-500 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                <Avatar user={user} size="lg" />
                <div>
                  <div 
                    className="text-lg font-bold text-black"
                    style={{ fontFamily: 'Outreque, sans-serif' }}
                  >
                    {user?.displayName || user?.name || 'User'}
                  </div>
                  <div 
                    className="text-sm text-red-500 font-medium"
                    style={{ fontFamily: 'Outreque, sans-serif' }}
                  >
                    {user?.totalScore || 0} points
                  </div>
                </div>
              </div>

              {/* Team Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleCreateTeam();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 text-black hover:text-red-500 hover:bg-gray-50 rounded-xl transition-colors"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  <Users className="h-5 w-5" />
                  <span className="text-base font-medium">Create Team</span>
                </button>

                <button
                  onClick={() => {
                    handleJoinTeam();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 text-black hover:text-red-500 hover:bg-gray-50 rounded-xl transition-colors"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  <User className="h-5 w-5" />
                  <span className="text-base font-medium">Join Team</span>
                </button>

                <button
                  onClick={() => {
                    toggleNotifications();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full p-3 text-black hover:text-red-500 hover:bg-gray-50 rounded-xl transition-colors"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5" />
                    <span className="text-base font-medium">Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleSyncNow();
                    setIsMenuOpen(false);
                  }}
                  disabled={isSyncing || loading}
                  className="flex items-center space-x-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 font-medium"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  {isSyncing ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                  <span className="text-base">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>

              {/* Profile & Logout */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <button
                  onClick={() => {
                    actions.toggleModal('profileSettings', true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 text-black hover:text-red-500 hover:bg-gray-50 rounded-xl transition-colors"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  <User className="h-5 w-5" />
                  <span className="text-base font-medium">Profile Settings</span>
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                  style={{ fontFamily: 'Outreque, sans-serif' }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-base">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
