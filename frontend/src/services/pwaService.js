// PWA Service Management
// Handles service worker registration, updates, and offline capabilities

class PWAService {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    this.installPromptEvent = null;
    
    this.initializeEventListeners();
  }

  // Initialize PWA service
  async initialize() {
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
        this.setupUpdateChecking();
        this.setupInstallPrompt();
        this.setupNotifications();
        console.log('✅ PWA Service: Initialized successfully');
      } catch (error) {
        console.error('❌ PWA Service: Initialization failed:', error);
      }
    } else {
      console.warn('⚠️ PWA Service: Service Workers not supported');
    }
  }

  // Register service worker
  async registerServiceWorker() {
    try {
      // Temporarily disable service worker to fix OAuth configuration fetch issues
      console.log('🔧 PWA Service: Service Worker registration temporarily disabled');
      return;
      
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('🔧 PWA Service: Service Worker registered:', this.swRegistration.scope);

      // Handle different states
      if (this.swRegistration.installing) {
        console.log('📦 PWA Service: Service Worker installing...');
        this.trackInstalling(this.swRegistration.installing);
      } else if (this.swRegistration.waiting) {
        console.log('⏳ PWA Service: Service Worker waiting...');
        this.showUpdateAvailable();
      } else if (this.swRegistration.active) {
        console.log('✅ PWA Service: Service Worker active');
      }

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        console.log('🔄 PWA Service: Update found');
        this.trackInstalling(this.swRegistration.installing);
      });

    } catch (error) {
      console.error('❌ PWA Service: Service Worker registration failed:', error);
      throw error;
    }
  }

  // Track installing service worker
  trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          console.log('🎉 PWA Service: New content available');
          this.showUpdateAvailable();
        } else {
          // Content cached for offline use
          console.log('📱 PWA Service: Content cached for offline use');
          this.showOfflineReady();
        }
      }
    });
  }

  // Setup update checking
  setupUpdateChecking() {
    // Check for updates every 5 minutes when tab is active
    setInterval(() => {
      if (document.visibilityState === 'visible' && this.swRegistration) {
        this.swRegistration.update();
      }
    }, 5 * 60 * 1000);

    // Check for updates when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.swRegistration) {
        this.swRegistration.update();
      }
    });
  }

  // Setup install prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('📱 PWA Service: Install prompt available');
      event.preventDefault();
      this.installPromptEvent = event;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA Service: App installed');
      this.installPromptEvent = null;
      this.hideInstallPrompt();
      this.trackEvent('app_installed');
    });
  }

  // Setup push notifications
  async setupNotifications() {
    if ('Notification' in window && 'PushManager' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('🔔 PWA Service: Notifications enabled');
        await this.subscribeToPushNotifications();
      } else {
        console.log('🔕 PWA Service: Notifications disabled');
      }
    }
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications() {
    try {
      if (!this.swRegistration) return;

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      console.log('📱 PWA Service: Push subscription created');
    } catch (error) {
      console.error('❌ PWA Service: Push subscription failed:', error);
    }
  }

  // Initialize event listeners
  initializeEventListeners() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 PWA Service: Back online');
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 PWA Service: Gone offline');
      this.handleOffline();
    });

    // Handle service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    }
  }

  // Handle online event
  handleOnline() {
    // Trigger background sync
    if (this.swRegistration && this.swRegistration.sync) {
      this.swRegistration.sync.register('leetcode-sync');
      this.swRegistration.sync.register('challenge-submission');
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('app:online'));
    
    // Update UI
    this.updateConnectionStatus(true);
  }

  // Handle offline event
  handleOffline() {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('app:offline'));
    
    // Update UI
    this.updateConnectionStatus(false);
    
    // Show offline notification
    this.showOfflineNotification();
  }

  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('📦 PWA Service: Cache updated');
        break;
      case 'OFFLINE_READY':
        this.showOfflineReady();
        break;
      case 'UPDATE_AVAILABLE':
        this.showUpdateAvailable();
        break;
      default:
        console.log('📨 PWA Service: Unknown message:', data);
    }
  }

  // Show update available notification
  showUpdateAvailable() {
    this.updateAvailable = true;
    
    // Create update notification
    const notification = this.createNotification({
      id: 'app-update',
      type: 'info',
      title: 'Update Available',
      message: 'A new version of CodeBattle is available!',
      actions: [
        {
          label: 'Update Now',
          action: () => this.applyUpdate()
        },
        {
          label: 'Later',
          action: () => this.dismissNotification('app-update')
        }
      ],
      persistent: true
    });

    this.showNotification(notification);
  }

  // Apply update
  async applyUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      // Tell the waiting service worker to skip waiting
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  }

  // Show offline ready notification
  showOfflineReady() {
    const notification = this.createNotification({
      id: 'offline-ready',
      type: 'success',
      title: 'Ready for Offline',
      message: 'CodeBattle is now available offline!',
      duration: 5000
    });

    this.showNotification(notification);
  }

  // Show install prompt
  showInstallPrompt() {
    const notification = this.createNotification({
      id: 'install-prompt',
      type: 'info',
      title: 'Install CodeBattle',
      message: 'Install CodeBattle for a better experience!',
      actions: [
        {
          label: 'Install',
          action: () => this.promptInstall()
        },
        {
          label: 'Maybe Later',
          action: () => this.dismissNotification('install-prompt')
        }
      ],
      persistent: true
    });

    this.showNotification(notification);
  }

  // Prompt app installation
  async promptInstall() {
    if (this.installPromptEvent) {
      const result = await this.installPromptEvent.prompt();
      console.log('📱 PWA Service: Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        this.trackEvent('install_accepted');
      } else {
        this.trackEvent('install_dismissed');
      }
      
      this.installPromptEvent = null;
      this.hideInstallPrompt();
    }
  }

  // Hide install prompt
  hideInstallPrompt() {
    this.dismissNotification('install-prompt');
  }

  // Show offline notification
  showOfflineNotification() {
    const notification = this.createNotification({
      id: 'offline-status',
      type: 'warning',
      title: 'You\'re Offline',
      message: 'Some features may be limited without internet.',
      duration: 3000
    });

    this.showNotification(notification);
  }

  // Update connection status in UI
  updateConnectionStatus(isOnline) {
    // Dispatch event for components to listen to
    window.dispatchEvent(new CustomEvent('connection:change', {
      detail: { isOnline }
    }));
  }

  // Generic notification methods
  createNotification({ id, type, title, message, actions = [], duration = null, persistent = false }) {
    return {
      id,
      type,
      title,
      message,
      actions,
      duration,
      persistent,
      timestamp: Date.now()
    };
  }

  showNotification(notification) {
    // Dispatch notification event for NotificationSystem to handle
    window.dispatchEvent(new CustomEvent('app:notification', {
      detail: notification
    }));
  }

  dismissNotification(id) {
    window.dispatchEvent(new CustomEvent('app:dismiss-notification', {
      detail: { id }
    }));
  }

  // Cache management
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ PWA Service: Cache cleared');
    }
  }

  async getCacheSize() {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100
      };
    }
    return null;
  }

  // Utility methods
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  trackEvent(eventName, data = {}) {
    // Analytics tracking
    console.log('📊 PWA Service: Event tracked:', eventName, data);
    
    // Send to analytics service if available
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }
  }

  // Public getters
  get isUpdateAvailable() {
    return this.updateAvailable;
  }

  get canInstall() {
    return !!this.installPromptEvent;
  }

  get isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  get connectionStatus() {
    return this.isOnline;
  }
}

// Create singleton instance
const pwaService = new PWAService();

export default pwaService;
