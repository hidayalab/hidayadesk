<template>
  <div class="note-taking-widget section">
    <h2 class="section-title">Notes</h2>
    <textarea v-model="noteContent" @keyup="saveNote" placeholder="Enter your notes here..."></textarea>
  </div>
</template>

<script>
import './styles/notetakingwidget.css';

export default {
  data() {
    return {
      noteContent: ''
    };
  },
  mounted() {
    // Load note from local storage if available
    this.noteContent = localStorage.getItem('userNote') || '';
  },
  methods: {
    saveNote() {
      localStorage.setItem('userNote', this.noteContent);
    }
  }
};
</script>
