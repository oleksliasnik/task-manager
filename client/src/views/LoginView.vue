<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../services/api'
import AuthLayout from '../components/AuthLayout.vue'
import AuthInput from '../components/AuthInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await authApi.login(email.value, password.value)
    authStore.setUser(response.user, response.token)
    router.push('/tasks')
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout
    title="Welcome Back"
    subtitle="Sign in to manage your tasks"
    :loading="loading"
    :error="error"
    submit-label="Sign In"
    loading-label="Signing in..."
    @submit="handleLogin"
  >
    <AuthInput
      id="email"
      label="Email"
      v-model="email"
      type="email"
      placeholder="Enter your email"
      autocomplete="email"
      required
    />

    <AuthInput
      id="password"
      label="Password"
      v-model="password"
      type="password"
      placeholder="Enter your password"
      autocomplete="current-password"
      required
    />

    <template #footer>
      <p>Don't have an account? <router-link to="/register">Sign up</router-link></p>
    </template>
  </AuthLayout>
</template>
