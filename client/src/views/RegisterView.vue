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
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!email.value || !username.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await authApi.register(email.value, password.value, username.value)
    authStore.setUser(response.user, response.token)
    router.push('/tasks')
  } catch (err: any) {
    error.value = err.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout
    title="Create Account"
    subtitle="Start managing your tasks efficiently"
    :loading="loading"
    :error="error"
    submit-label="Sign Up"
    loading-label="Creating account..."
    @submit="handleRegister"
  >
    <AuthInput
      id="username"
      label="Username"
      v-model="username"
      type="text"
      placeholder="Choose a username"
      autocomplete="username"
      required
    />

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
      placeholder="Create a password"
      autocomplete="new-password"
      required
    />

    <AuthInput
      id="confirm-password"
      label="Confirm Password"
      v-model="confirmPassword"
      type="password"
      placeholder="Confirm your password"
      autocomplete="new-password"
      required
    />

    <template #footer>
      <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
    </template>
  </AuthLayout>
</template>
