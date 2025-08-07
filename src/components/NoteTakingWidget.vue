<template>
  <div class="note-taking-widget section">
    <h2 class="section-title">Notes</h2>
    <textarea v-model="noteContent" placeholder="Enter your notes here..."></textarea>
    <button @click="saveNote">Save Note</button>
  </div>
</template>

<script>
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
      alert('Note saved!');
    }
  }
};
</script>

<style scoped>
.note-taking-widget {
  background-color: #2a2a2a; /* Example background */
  padding: 1.5rem;
  border-radius: 8px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-taking-widget h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 0;
  color: #fff;
}

.note-taking-widget textarea {
  width: 100%;
  height: 150px; /* Adjust height as needed */
  padding: 0.5rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #fff;
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
  resize: vertical; /* Allow vertical resizing */
}

.note-taking-widget button {
  padding: 0.5rem 1rem;
  background-color: #007bff; /* Example button color */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.note-taking-widget button:hover {
  background-color: #0056b3;
}
</style>
