<template>
  <div class="prayer-time-widget">
    <div class="notification-controls">
      <button 
        v-if="!notificationsEnabled" 
        @click="enableNotifications" 
        class="notification-btn enable-btn"
      >
        🔔 Enable Prayer Notifications
      </button>
      <div v-else class="notification-status">
        <span class="status-text">🔔 Notifications On</span>
        <button @click="toggleNotificationSettings" class="settings-btn">⚙️</button>
        <button @click="disableNotifications" class="disable-btn">🔕 Disable</button>
      </div>
    </div>

    <div v-if="showNotificationSettings" class="notification-settings">
      <div class="setting-row">
        <label>
          <input 
            type="checkbox" 
            v-model="notificationConfig.exactTime"
            @change="updateNotifications"
          />
          Notify at exact prayer time
        </label>
      </div>
      <div class="setting-row">
        <label>
          <input 
            type="checkbox" 
            v-model="notificationConfig.advanceNotification"
            @change="updateNotifications"
          />
          Notify in advance:
        </label>
        <select 
          v-model="notificationConfig.advanceMinutes"
          @change="updateNotifications"
          :disabled="!notificationConfig.advanceNotification"
        >
          <option value="5">5 minutes</option>
          <option value="10">10 minutes</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="error-message" data-testid="prayer-error">
      <p>{{ error }}</p>
      <button 
        @click="retryFetch" 
        class="retry-btn"
        data-testid="prayer-retry-btn"
      >
        Retry
      </button>
    </div>
    <div v-else>
      <div class="next-prayer-container" data-testid="next-prayer">
        <p class="next-prayer-label">Next Prayer In</p>
        <p class="next-prayer-name" data-testid="next-prayer-name">{{ nextPrayerName }}</p>
        <p class="next-prayer-time" data-testid="next-prayer-time">{{ timeToNextPrayer }}</p>
      </div>
      <ul class="prayer-list">
        <li 
          v-for="prayer in filteredPrayerTimes" 
          :key="prayer.name" 
          class="prayer-item"
          :data-testid="`prayer-time-item`"
        >
          <i :class="prayer.icon" class="prayer-icon"></i>
          <span class="prayer-name">{{ prayer.name }}</span>
          <span 
            class="prayer-time" 
            :data-testid="`prayer-${prayer.name.toLowerCase()}`"
          >{{ prayer.time }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import notificationService from '../services/notificationService.js';

export default {
  props: {
    location: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      prayerTimes: {},
      error: null,
      timeToNextPrayer: '--:--:--',
      nextPrayerName: '',
      notificationsEnabled: false,
      showNotificationSettings: false,
      notificationConfig: {
        exactTime: true,
        advanceNotification: false,
        advanceMinutes: 10
      },
      prayerIcons: {
        Fajr: 'fas fa-cloud-sun',
        Dhuhr: 'fas fa-sun',
        Asr: 'fas fa-cloud-sun',
        Maghrib: 'fas fa-cloud-moon',
        Isha: 'fas fa-moon',
      },
    };
  },
  watch: {
    location: {
      immediate: true,
      handler(newLocation) {
        if (newLocation) {
          this.fetchPrayerTimes(newLocation.latitude, newLocation.longitude);
        }
      },
    },
  },
  computed: {
    filteredPrayerTimes() {
      const majorPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      return Object.entries(this.prayerTimes)
        .filter(([name]) => majorPrayers.includes(name))
        .map(([name, time]) => ({
          name,
          time,
          icon: this.prayerIcons[name],
        }));
    },
  },
  methods: {
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            // Emit event to parent to update location
            this.$emit('location-updated', location);
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    },
    async fetchPrayerTimes(latitude, longitude) {
      try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=8`);
        const data = await response.json();
        if (data.code === 200) {
          this.prayerTimes = data.data.timings;
          this.startTimer();
          this.updateNotifications();
        } else {
          this.error = "Could not retrieve prayer times.";
        }
      } catch (error) {
        this.error = "Error fetching prayer times.";
      }
    },
    startTimer() {
      setInterval(() => {
        const now = new Date();
        let nextPrayerTime = null;
        let nextPrayerName = null;

        for (const prayer of this.filteredPrayerTimes) {
          const prayerTime = new Date(now.toDateString() + ' ' + prayer.time);
          if (prayerTime > now) {
            nextPrayerTime = prayerTime;
            nextPrayerName = prayer.name;
            break;
          }
        }

        if (nextPrayerTime) {
          const diff = nextPrayerTime - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          this.timeToNextPrayer = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          this.nextPrayerName = nextPrayerName;
        } else {
          this.timeToNextPrayer = 'Done for today';
          this.nextPrayerName = '';
        }
      }, 1000);
    },
    async enableNotifications() {
      const granted = await notificationService.requestPermission();
      if (granted) {
        this.notificationsEnabled = true;
        this.saveNotificationSettings();
        this.updateNotifications();
        
        // Show a test notification
        notificationService.showNotification('Prayer Notifications Enabled', {
          body: 'You will now receive notifications for prayer times.',
          requireInteraction: false
        });
      } else {
        alert('Please allow notifications to receive prayer time reminders.');
      }
    },
    toggleNotificationSettings() {
      this.showNotificationSettings = !this.showNotificationSettings;
    },
    disableNotifications() {
      this.notificationsEnabled = false;
      this.showNotificationSettings = false;
      notificationService.clearAllScheduledNotifications();
      this.saveNotificationSettings();
      // Show confirmation notification
      notificationService.showNotification('Prayer Notifications Disabled', {
        body: 'You will no longer receive prayer time notifications.',
        requireInteraction: false
      });
    },
    updateNotifications() {
      if (this.notificationsEnabled && Object.keys(this.prayerTimes).length > 0) {
        const settings = {
          exactTime: this.notificationConfig.exactTime,
          advanceMinutes: this.notificationConfig.advanceNotification ? this.notificationConfig.advanceMinutes : 0
        };
        
        notificationService.scheduleAllPrayerNotifications(this.prayerTimes, settings);
        this.saveNotificationSettings();
      }
    },
    saveNotificationSettings() {
      localStorage.setItem('prayerNotificationConfig', JSON.stringify({
        enabled: this.notificationsEnabled,
        config: this.notificationConfig
      }));
    },
    loadNotificationSettings() {
      const saved = localStorage.getItem('prayerNotificationConfig');
      if (saved) {
        const settings = JSON.parse(saved);
        const permissionStatus = notificationService.getPermissionStatus();
        this.notificationsEnabled = settings.enabled && permissionStatus === 'granted';
        this.notificationConfig = { ...this.notificationConfig, ...settings.config };
      }
    },
    retryFetch() {
      this.error = null;
      if (this.location) {
        this.fetchPrayerTimes(this.location.latitude, this.location.longitude);
      }
    }
  },
  mounted(){
    this.getLocation();
    this.loadNotificationSettings();
  }
};
</script>

<style scoped>
@import './styles/prayertimewidget.css';
</style>
