class NotificationService {
  constructor() {
    this.permission = 'default';
    this.scheduledNotifications = new Map();
  }

  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }
    return false;
  }

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'prayer-time',
      requireInteraction: true,
      ...options
    });

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  }

  schedulePrayerNotification(prayerName, prayerTime, advanceMinutes = 0) {
    const now = new Date();
    const targetTime = new Date(now.toDateString() + ' ' + prayerTime);
    
    // Subtract advance minutes
    targetTime.setMinutes(targetTime.getMinutes() - advanceMinutes);
    
    const timeUntil = targetTime.getTime() - now.getTime();
    
    // Only schedule if time is in the future
    if (timeUntil > 0) {
      const timeoutId = setTimeout(() => {
        const message = advanceMinutes > 0 
          ? `${prayerName} prayer is in ${advanceMinutes} minutes`
          : `It's time for ${prayerName} prayer`;

        this.showNotification(`${prayerName} Prayer Time`, {
          body: message,
          icon: this.getPrayerIcon(prayerName)
        });
      }, timeUntil);

      // Store the timeout ID to cancel later if needed
      const key = `${prayerName}-${advanceMinutes}`;
      this.scheduledNotifications.set(key, timeoutId);
    }
  }

  getPrayerIcon(prayerName) {
    const icons = {
      'Fajr': '🌅',
      'Dhuhr': '☀️',
      'Asr': '🌤️',
      'Maghrib': '🌅',
      'Isha': '🌙'
    };
    return icons[prayerName] || '🕌';
  }

  clearAllScheduledNotifications() {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  scheduleAllPrayerNotifications(prayerTimes, settings = {}) {
    // Clear existing notifications first
    this.clearAllScheduledNotifications();

    const majorPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    majorPrayers.forEach(prayerName => {
      if (prayerTimes[prayerName]) {
        // Schedule exact time notification
        if (settings.exactTime !== false) {
          this.schedulePrayerNotification(prayerName, prayerTimes[prayerName], 0);
        }
        
        // Schedule advance notification if enabled
        if (settings.advanceMinutes > 0) {
          this.schedulePrayerNotification(prayerName, prayerTimes[prayerName], settings.advanceMinutes);
        }
      }
    });
  }

  isSupported() {
    return 'Notification' in window;
  }

  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }
}

export default new NotificationService();