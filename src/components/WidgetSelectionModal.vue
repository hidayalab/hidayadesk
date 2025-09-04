<template>
  <!-- Widget Selection Modal -->
  <div class="modal-overlay" v-show="isVisible" @click="$emit('close')">
    <div class="selection-modal widget-modal" @click.stop>
      <div class="modal-header">
        <h3>Select Widgets</h3>
        <button class="modal-close" @click="$emit('close')" aria-label="Close modal" title="Close modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="selection-list">
          <div 
            v-for="widget in availableWidgets" 
            :key="widget.id"
            class="selection-item"
            :class="{ 
              'selected': visibleWidgets.includes(widget.id),
              'permanent': widget.id === 'quran'
            }"
            @click="widget.id !== 'quran' ? toggleWidget(widget.id) : null"
          >
            <div class="item-content">
              <div class="item-info">
                <span class="item-title">{{ widget.name }}</span>
                <span class="item-description">{{ getWidgetDescription(widget.id) }}</span>
              </div>
              <span v-if="widget.id === 'quran'" class="permanent-badge">Always Visible</span>
            </div>
            <div class="selection-checkbox">
              <input 
                type="checkbox" 
                :checked="visibleWidgets.includes(widget.id)"
                :disabled="widget.id === 'quran'"
                readonly
              >
              <span class="checkmark"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-button secondary" @click="$emit('close')">Cancel</button>
        <button class="modal-button primary" @click="$emit('close')">Apply</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WidgetSelectionModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    availableWidgets: {
      type: Array,
      required: true
    },
    visibleWidgets: {
      type: Array,
      required: true
    }
  },
  emits: ['close', 'toggle-widget'],
  methods: {
    toggleWidget(widgetId) {
      if (widgetId === 'quran') return;
      this.$emit('toggle-widget', widgetId);
    },
    getWidgetDescription(widgetId) {
      const descriptions = {
        'quran': 'Display verses from the Holy Quran',
        'notes': 'Personal notes and thoughts',
        'prayer': 'Prayer times and reminders',
        'hadith': 'Islamic traditions and sayings'
      };
      return descriptions[widgetId] || '';
    }
  }
};
</script>