// Connection Status Indicator
// Shows online/offline status and PWA-related notifications

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Download, RefreshCw, Smartphone } from 'lucide-react';
import pwaService from '@/services/pwaService';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Initialize PWA service
    pwaService.initialize();

    // Listen for connection changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for PWA events
    const handleUpdateAvailable = () => setShowUpdatePrompt(true);
    const handleInstallAvailable = () => setShowInstallPrompt(pwaService.canInstall);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('app:update-available', handleUpdateAvailable);
    window.addEventListener('app:install-available', handleInstallAvailable);

    // Check initial install availability
    setShowInstallPrompt(pwaService.canInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('app:update-available', handleUpdateAvailable);
      window.removeEventListener('app:install-available', handleInstallAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await pwaService.applyUpdate();
    setIsUpdating(false);
    setShowUpdatePrompt(false);
  };

  const handleInstall = async () => {
    await pwaService.promptInstall();
    setShowInstallPrompt(false);
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <motion.div
        className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
          isOnline 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Offline</span>
          </>
        )}
      </motion.div>

      {/* Update Available Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <div className="bg-white rounded-lg shadow-lg border p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    Update Available
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    A new version of CodeBattle is ready to install.
                  </p>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Now'
                      )}
                    </button>
                    <button
                      onClick={() => setShowUpdatePrompt(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install App Prompt */}
      <AnimatePresence>
        {showInstallPrompt && !pwaService.isInstalled && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Smartphone className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">
                    Install CodeBattle
                  </h3>
                  <p className="text-sm text-purple-100 mt-1">
                    Get the full app experience with offline access!
                  </p>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={handleInstall}
                      className="inline-flex items-center px-3 py-1.5 border border-white/30 text-xs font-medium rounded text-white bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Install
                    </button>
                    <button
                      onClick={() => setShowInstallPrompt(false)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-purple-100 hover:text-white focus:outline-none"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
