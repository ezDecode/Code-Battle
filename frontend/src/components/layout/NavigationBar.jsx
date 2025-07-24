import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { Bell, LogOut, User, Menu, X, ChevronDown, Zap } from "lucide-react";

export function NavigationBar() {
  const { state, actions } = useApp();
  const { user, notifications } = state;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const toast = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    actions.logout();
    setIsAvatarDropdownOpen(false);
  };

  const handleQuickSync = async () => {
    setIsAvatarDropdownOpen(false);
    
    try {
      const result = await toast.promise(
        actions.syncLeetCode ? actions.syncLeetCode() : Promise.reject(new Error('Sync not available')),
        {
          loading: 'Syncing with LeetCode...',
          success: 'Successfully synced with LeetCode!',
          error: 'Failed to sync with LeetCode. Please try again.'
        }
      );
    } catch (error) {
      console.error('Quick sync failed:', error);
    }
  };

  const toggleNotifications = () => {
    actions.toggleModal('notifications', true);
  };

  return (
    <motion.nav 
      className="sticky top-0 z-40 w-full bg-[#D9D9D9]/80 backdrop-blur-lg border-b border-gray-400"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="flex flex-col">
            <span className="text-xl font-bold text-black">CodeBattle</span>
            <span className="text-xs text-black -mt-1 hidden sm:block">Gamified Coding</span>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
          </motion.button>

          {/* User Profile with Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsAvatarDropdownOpen(true)}
              onMouseLeave={() => setIsAvatarDropdownOpen(false)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-black/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-black">{user?.name}</div>
                  <div className="text-xs text-black">@{user?.leetcodeUsername}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white font-bold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-black" />
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
                  className="absolute right-0 top-full mt-2 w-64 bg-[#D9D9D9] rounded-xl shadow-lg border border-gray-400 py-2 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-[#FF0000] flex items-center justify-center text-white font-bold">
                        {(user?.displayName || user?.name)?.split(' ').map(n => n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">{user?.displayName || user?.name}</div>
                        <div className="text-xs text-black">@{user?.leetcodeUsername || 'No LeetCode'}</div>
                        <div className="text-xs text-[#FF0000] font-medium">
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
                      className="flex items-center space-x-3 w-full px-4 py-2 text-black hover:bg-black/10 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleNotifications();
                        setIsAvatarDropdownOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-black hover:bg-black/10 transition-colors"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-[#FF0000] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={handleQuickSync}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-[#FF0000] hover:bg-[#FF0000]/10 transition-colors"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Quick Sync LeetCode</span>
                    </button>

                    <div className="border-t border-gray-400 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-[#FF0000] hover:bg-[#FF0000]/10 transition-colors"
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
          className="md:hidden p-2 text-black hover:text-[#FF0000] hover:bg-black/10 rounded-xl transition-colors"
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
            className="md:hidden bg-[#D9D9D9] border-t border-gray-400"
          >
            <div className="px-4 py-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-400">
                <div className="h-10 w-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white font-bold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <div className="text-sm font-medium text-black">{user?.name}</div>
                  <div className="text-xs text-black">@{user?.leetcodeUsername}</div>
                  <div className="text-xs text-[#FF0000] font-medium">
                    {user?.totalScore || 0} points
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => {
                  toggleNotifications();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-black hover:text-[#FF0000] hover:bg-black/10 rounded-xl transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-[#FF0000] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => {
                  handleQuickSync();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full p-2 text-[#FF0000] hover:text-[#FF0000] hover:bg-[#FF0000]/10 rounded-xl transition-colors"
              >
                <Zap className="h-5 w-5" />
                <span>Quick Sync LeetCode</span>
              </button>

              {/* Logout - Separated */}
              <div className="border-t border-gray-400 pt-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-2 text-[#FF0000] hover:text-[#FF0000] hover:bg-[#FF0000]/10 rounded-xl transition-colors"
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