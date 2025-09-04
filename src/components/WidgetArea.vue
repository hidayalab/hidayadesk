<template>
  <div class="widget-area" role="region" :aria-label="`${activeWidget} widget`">
    <keep-alive>
      <quran-widget v-if="activeWidget === 'quran'"></quran-widget>
      <note-taking-widget v-else-if="activeWidget === 'notes'" :theme="theme"></note-taking-widget>
      <prayer-time-widget v-else-if="activeWidget === 'prayer'"></prayer-time-widget>
      <hadith-widget v-else-if="activeWidget === 'hadith'" :theme="theme"></hadith-widget>
    </keep-alive>
  </div>
</template>

<script>
import QuranWidget from './QuranWidget.vue';
import NoteTakingWidget from './NoteTakingWidget.vue';
import PrayerTimeWidget from './PrayerTimeWidget.vue';
import HadithWidget from './HadithWidget.vue';

export default {
  name: 'WidgetArea',
  components: {
    QuranWidget,
    NoteTakingWidget,
    PrayerTimeWidget,
    HadithWidget
  },
  props: {
    activeWidget: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'CyberGlow'
    }
  }
};
</script>