<template>
  <footer class="app-footer">
    <p>
      Made with ❤️ by the <a href="https://www.amanafund.org/" target="_blank">Amana Fund</a> tech team.
    </p>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
};
</script>

<style scoped>
.app-footer {
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  padding: 1rem 0;
  font-size: 0.9rem;
  color: #888;
  background-color: #1a1a1a; /* Match a dark theme */
  border-top: 1px solid #333;
  z-index: 1000;
}

.app-footer a {
  color: #4a90e2;
  text-decoration: none;
  transition: color 0.3s;
}

.app-footer a:hover {
  color: #81baff;
}
</style>
