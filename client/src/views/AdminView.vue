<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { authApi } from '../services/api'

const authStore = useAuthStore()
const router = useRouter()

interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  role: string
  firstName?: string
  lastName?: string
}

const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const viewMode = ref<'table' | 'grid'>('table')

onMounted(async () => {
  if (authStore.user?.role !== 'admin') {
    router.push('/tasks')
    return
  }
  
  await fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  error.value = ''
  
  try {
    if (!authStore.token) {
      throw new Error('Not authenticated')
    }
    
    const response = await authApi.getAllUsers(authStore.token)
    users.value = response.users
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/tasks')
}

function openUserDetail(user: User) {
  router.push(`/admin/user/${user._id}`)
}
</script>

<template>
  <div class="admin-view">
    <div class="admin-container glass-panel">
      <div class="header">
        <button @click="goBack" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Tasks
        </button>
        <h1>User Management</h1>
        <div class="view-toggle">
          <button
            @click="viewMode = 'table'"
            class="btn-toggle"
            :class="{ active: viewMode === 'table' }"
          >
            Table
          </button>
          <button
            @click="viewMode = 'grid'"
            class="btn-toggle"
            :class="{ active: viewMode === 'grid' }"
          >
            Grid
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>

      <div v-else-if="error" class="error-message">{{ error }}</div>

      <div v-else-if="viewMode === 'grid'" class="users-grid">
        <div v-for="user in users" :key="user._id" class="user-card glass-panel" @click="openUserDetail(user)">
          <div class="card-left">
            <div class="user-avatar">
              <img 
                v-if="user.avatar" 
                :src="user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000${user.avatar}`" 
                :alt="user.username"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ user.username?.charAt(0).toUpperCase() }}
              </div>
            </div>
            <span v-if="user.role === 'admin'" class="badge-admin">Admin</span>
            <span v-else class="badge-user">User</span>
          </div>
          <div class="card-right">
            <h3>{{ user.username }}</h3>
            <p v-if="user.firstName || user.lastName" class="user-fullname">{{ user.firstName }} {{ user.lastName }}</p>
            <p class="user-email">{{ user.email }}</p>
          </div>
        </div>
      </div>

      <div v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id" class="table-row" @click="openUserDetail(user)">
              <td>
                <div class="table-avatar">
                  <img 
                    v-if="user.avatar" 
                    :src="user.avatar"
                    :alt="user.username"
                    class="avatar-img"
                  />
                  <div v-else class="avatar-placeholder-small">
                    {{ user.username?.charAt(0).toUpperCase() }}
                  </div>
                </div>
              </td>
              <td class="username-cell">{{ user.username }}</td>
              <td class="fullname-cell">{{ user.firstName }} {{ user.lastName }}</td>
              <td class="email-cell">{{ user.email }}</td>
              <td>
                <span v-if="user.role === 'admin'" class="badge-admin">Admin</span>
                <span v-else class="badge-user">User</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-view {
  height: 100vh;
  display: flex;
  padding: 1rem;
  overflow: hidden;
}

.admin-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-modal);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-shrink: 0;
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.btn-back:hover {
  color: var(--text-main);
}

.header h1 {
  text-align: center;
  width: max-content;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.view-toggle {
  display: flex;
  gap: 0;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.btn-toggle {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  font-weight: 500;
}

.btn-toggle.active {
  border: 1px solid var(--color-primary);
  color: var(--text-main);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-card);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--status-danger);
  border-radius: var(--radius-md);
  color: var(--status-danger);
  text-align: center;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding: 0.5rem;
  
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.users-grid::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.user-card {
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  transition: transform 0.2s;
  cursor: pointer;
  background: var(--bg-card);
}

.user-card:hover {
  transform: translateY(-2px);
}

.card-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.card-right {
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.card-right h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: var(--text-main);
}

.user-email {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 0;
  word-break: break-all;
}

.user-fullname {
  color: var(--text-main);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.badge-admin {
  background: var(--color-primary);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 99px;
  text-transform: uppercase;
  font-weight: 700;
  display: inline-block;
}

.badge-user {
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 99px;
  text-transform: uppercase;
  font-weight: 700;
  display: inline-block;
}

.users-table-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
  padding-right: 0.2rem;
  border-radius: var(--radius-md);
}

.users-table-container::-webkit-scrollbar {
  width: 8px;
}

.users-table-container::-webkit-scrollbar-track {
  background: transparent;
}

.users-table-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.users-table-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.users-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--bg-card);
}

.users-table thead {
  background: var(--bg-card-hover);
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-main);
  border-bottom: 2px solid var(--border-color);
  background: var(--bg-card-hover);
  position: sticky;
  top: 0;
  z-index: 10;
}

.users-table td {
  padding: 1rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.table-row:hover {
  background: var(--bg-card-hover);
}

.table-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.avatar-placeholder-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
}

.username-cell {
  font-weight: 500;
}

.email-cell {
  color: var(--text-muted);
}

.fullname-cell {
  color: var(--text-main);
}

@media (max-width: 1280px) {
  .admin-view {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .admin-view {
    padding: 1rem;
  }

  .admin-container {
    padding: 0.5rem;
  }

  .header {
    display: flex;
    margin-bottom: 1rem;
    position: relative;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .view-toggle {
    position: static;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header h1 {
    margin: auto;
    margin-bottom: 0.5rem;
  }

  .users-table-container {
    padding-right: 0;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  .users-table-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  
}
</style>

