<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="home-view">
    <div class="glass-panel hero-section">
      <h1 class="title">Task Manager</h1>
      <p class="subtitle">Organize your life with our premium task management tool.</p>
      
      <div class="actions">
        <button @click="router.push('/login')" class="btn btn-primary">Login</button>
        <button @click="router.push('/register')" class="btn btn-secondary">Register</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--status-doing) 50%, var(--status-done) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-muted);
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  min-width: 120px;
  justify-content: center;
}
</style>
