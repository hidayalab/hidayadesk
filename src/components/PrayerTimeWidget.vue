<template>
  <div class="prayer-time-widget">
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <div class="next-prayer-container">
        <p class="next-prayer-label">Next Prayer In</p>
        <p class="next-prayer-time">{{ timeToNextPrayer }}</p>
      </div>
      <ul class="prayer-list">
        <li v-for="prayer in filteredPrayerTimes" :key="prayer.name" class="prayer-item">
          <i :class="prayer.icon" class="prayer-icon"></i>
          <span class="prayer-name">{{ prayer.name }}</span>
          <span class="prayer-time">{{ prayer.time }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
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
    async fetchPrayerTimes(latitude, longitude) {
      try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=8`);
        const data = await response.json();
        if (data.code === 200) {
          this.prayerTimes = data.data.timings;
          this.startTimer();
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
        } else {
          this.timeToNextPrayer = 'Done for today';
        }
      }, 1000);
    },
  },
};
</script>

<style scoped>
@import './styles/prayertimewidget.css';
</style>
