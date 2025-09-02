<template>
  <footer class="app-footer">
    <p>
      Made with <span class="heart">❤️</span> by
      <a href="https://www.hidayalab.org/" target="_blank" class="badge">
        <img src="/public/footer_logo.png" alt="logo" />
        HidayaLab
      </a>
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
  font-size: 0.95rem;
  color: #e0e0e0;
  background-color: #1a1a1a;
  border-top: 1px solid #2c3e50;
  z-index: 1000;
}

.heart {
  color: #ff4b5c;
  margin: 0 5px;
}

.badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid #c9a227;
  border-radius: 20px;
  padding: 4px 12px;
  margin-left: 6px;
  font-weight: bold;
  font-size: 0.95rem;
  color: #f1c40f;
  text-decoration: none;
  transition: 0.3s;
}

.badge:hover {
  background-color: rgba(201, 162, 39, 0.2);
}

.badge img {
  width: 18px;
  height: 18px;
  margin-right: 6px;
  border-radius: 50%;
}
</style>
