<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter, useRoute } from "vue-router";
import { authApi } from "../services/api";
import { User } from "../types/user";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const user = ref<User | null>(null);
const loading = ref(false);
const error = ref("");
const showDeleteModal = ref(false);

onMounted(async () => {
  if (authStore.user?.role !== "admin") {
    router.push("/tasks");
    return;
  }

  await fetchUser();
});

async function fetchUser() {
  loading.value = true;
  error.value = "";

  try {
    if (!authStore.token) {
      throw new Error("Not authenticated");
    }

    const userId = route.params.id as string;
    const response = await authApi.getUserById(authStore.token, userId);
    user.value = response.user;
  } catch (err: any) {
    error.value = err.message || "Failed to fetch user";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push("/admin");
}

function openDeleteModal() {
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
}

async function confirmDelete() {
  if (!user.value || !authStore.token) return;

  try {
    await authApi.deleteUser(authStore.token, user.value._id);
    router.push("/admin");
  } catch (err: any) {
    error.value = err.message || "Failed to delete user";
    closeDeleteModal();
  }
}
</script>

<template>
  <div class="user-detail-view">
    <div class="user-detail-container glass-panel">
      <div class="header">
        <button @click="goBack" class="btn-back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Users
        </button>
        <h1>User Details</h1>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading user...</p>
      </div>

      <div v-else-if="error" class="error-message">{{ error }}</div>

      <div v-else-if="user" class="user-content">
        <div class="user-header">
          <div class="user-avatar-large">
            <img
              v-if="user.avatar"
              :src="
                user.avatar.startsWith('http')
                  ? user.avatar
                  : `http://localhost:3000${user.avatar}`
              "
              :alt="user.username"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">
              {{ user.username?.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="user-title">
            <h2>{{ user.username }}</h2>
            <span v-if="user.role === 'admin'" class="badge-admin">Admin</span>
            <span v-else class="badge-user">User</span>
          </div>
        </div>

        <div class="user-info-section">
          <h3>Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Username</span>
              <span class="info-value">{{ user.username }}</span>
            </div>
            <div class="info-item" v-if="user.firstName || user.lastName">
              <span class="info-label">Full Name</span>
              <span class="info-value"
                >{{ user.firstName }} {{ user.lastName }}</span
              >
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Role</span>
              <span class="info-value">{{ user.role }}</span>
            </div>
          </div>
        </div>

        <div class="actions" v-if="user._id !== authStore.user?._id">
          <button @click="openDeleteModal" class="btn btn-danger">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Delete User
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button @click="closeDeleteModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete user
            <strong>{{ user?.username }}</strong
            >?
          </p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="confirmDelete" class="btn btn-danger">Delete</button>
          <button @click="closeDeleteModal" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-detail-view {
  height: 100vh;
  display: flex;
  padding: 2rem;
  overflow: hidden;
}

@media (max-width: 1280px) {
  .user-detail-container {
    padding: 1rem;
  }
}

.user-detail-container {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-modal);
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
}

@media (max-width: 768px) {
  .header {
    justify-content: end;
  }
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
  position: absolute;
  left: 0;
}

.btn-back:hover {
  color: var(--text-main);
}

.header h1 {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
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
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--status-danger);
  border-radius: var(--radius-md);
  color: var(--status-danger);
  text-align: center;
}

.user-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.user-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-color);
  flex-shrink: 0;
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
  background: var(--bg-card-hover);
  color: var(--text-muted);
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.user-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-title h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-main);
}

.user-info-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: var(--text-main);
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-card-hover);
  border-radius: var(--radius-md);
}

.info-label {
  font-weight: 600;
  color: var(--text-muted);
}

.info-value {
  color: var(--text-main);
  word-break: break-all;
}

.actions {
  display: flex;
  justify-content: flex-end;
  align-items: end;
  height: 100%;
  gap: 1rem;
  padding: 2rem 0;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger {
  background: transparent;
  border: 1px solid var(--status-danger);
  color: var(--status-danger);
}

.btn-danger:hover {
  background: #dc2626;
  color: white;
}

.btn-secondary {
  background: var(--bg-card-hover);
  color: var(--text-main);
  border: 1px solid transparent;
}

.btn-secondary:hover {
  background: var(--border-color);
  border: 1px solid var(--text-main);
}

.badge-admin {
  background: var(--color-primary);
  color: white;
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  border-radius: 99px;
  text-transform: uppercase;
  font-weight: 700;
  display: inline-block;
  width: fit-content;
}

.badge-user {
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  border-radius: 99px;
  text-transform: uppercase;
  font-weight: 700;
  display: inline-block;
  width: fit-content;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-small {
  max-width: 400px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-main);
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: var(--text-main);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.warning-text {
  color: var(--status-danger);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .user-detail-view {
    padding: 1rem;
  }

  .user-detail-container {
    padding: 1rem;
  }

  .user-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-item {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>
