import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { Code, Bell, Settings, LogOut, User, Menu, X, Home, ChevronDown, Zap } from "lucide-react";

export function NavigationBar() {
  const { state, actions } = useApp();
  const { user, notifications } = state;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    actions.logout();
    setIsAvatarDropdownOpen(false);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleSettings = () => {
    // TODO: Implement settings functionality
    console.log('Settings clicked');
    setIsAvatarDropdownOpen(false);
  };

  const handleQuickSync = async () => {
    setIsAvatarDropdownOpen(false);
    
    const syncPromise = new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        if (Math.random() > 0.2) { // 80% success rate
          const mockData = {
            problemsSynced: Math.floor(Math.random() * 5) + 1,
            pointsEarned: Math.floor(Math.random() * 200) + 50,
            newStreak: (user?.currentStreak || 0) + 1
          };
          resolve(mockData);
        } else {
          reject(new Error('Sync failed'));
        }
      }, 2000);
    });

    try {
      const result = await toast.promise(syncPromise, {
        loading: 'Syncing with LeetCode...',
        success: `Successfully synced! Earned ${Math.floor(Math.random() * 200) + 50} points.`,
        error: 'Failed to sync with LeetCode. Please try again.'
      });
      
      // Update user data if needed
      if (actions.syncLeetCode) {
        actions.syncLeetCode();
      }
    } catch (error) {
      console.error('Quick sync failed:', error);
    }
  };

  const toggleNotifications = () => {
    actions.toggleModal('notifications', true);
  };

  return (
    <motion.nav 
      className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div 
          className="flex items-center space-x-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          onClick={handleGoHome}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
            <Code className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">CodeBattle</span>
            <span className="text-xs text-gray-600 -mt-1 hidden sm:block">Gamified Coding</span>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Home Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoHome}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title="Go to Dashboard"
          >
            <Home className="h-5 w-5" />
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleNotifications}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSettings}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </motion.button>

          {/* User Profile with Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsAvatarDropdownOpen(true)}
              onMouseLeave={() => setIsAvatarDropdownOpen(false)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-600">@{user?.leetcodeUsername}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </motion.button>

            {/* Avatar Dropdown */}
            <AnimatePresence>
              {isAvatarDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={() => setIsAvatarDropdownOpen(true)}
                  onMouseLeave={() => setIsAvatarDropdownOpen(false)}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                        <div className="text-xs text-gray-600">@{user?.leetcodeUsername}</div>
                        <div className="text-xs text-blue-600 font-medium">
                          {user?.totalScore || 0} points
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        handleGoHome();
                        setIsAvatarDropdownOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={handleSettings}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleNotifications();
                        setIsAvatarDropdownOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={handleQuickSync}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Quick Sync LeetCode</span>
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-600">@{user?.leetcodeUsername}</div>
                  <div className="text-xs text-blue-600 font-medium">
                    {user?.totalScore || 0} points
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => {
                  handleGoHome();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  toggleNotifications();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => {
                  handleSettings();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>

              <button 
                onClick={() => {
                  handleQuickSync();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors"
              >
                <Zap className="h-5 w-5" />
                <span>Quick Sync LeetCode</span>
              </button>

              {/* Logout - Separated */}
              <div className="border-t border-gray-200 pt-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}