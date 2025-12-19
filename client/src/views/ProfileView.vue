<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const username = ref(authStore.user?.username || '')
const email = ref(authStore.user?.email || '')
const firstName = ref(authStore.user?.firstName || '')
const lastName = ref(authStore.user?.lastName || '')

const avatarUrl = ref(authStore.user?.avatar)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const profileMessage = ref('')
const profileError = ref('')
const passwordMessage = ref('')
const passwordError = ref('')

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    if (file.size > 500 * 1024) {
      profileError.value = 'File size must be less than 500KB'
      target.value = ''
      selectedFile.value = null
      return
    }

    selectedFile.value = file
    avatarUrl.value = URL.createObjectURL(selectedFile.value)
    profileError.value = ''
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleUpdateProfile() {
  profileMessage.value = ''
  profileError.value = ''

  if (!username.value.trim()) {
    profileError.value = 'Username cannot be empty'
    return
  }

  try {
    await authStore.updateProfile(username.value, selectedFile.value || undefined, firstName.value, lastName.value)
    avatarUrl.value = authStore.user?.avatar
    selectedFile.value = null
    profileMessage.value = 'Profile updated successfully'
  } catch (err: any) {
    profileError.value = err.message || 'Failed to update profile'
  }
}

async function handleUpdatePassword() {
  passwordMessage.value = ''
  passwordError.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = 'All fields are required'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New passwords do not match'
    return
  }

  try {
    await authStore.updatePassword(currentPassword.value, newPassword.value)
    passwordMessage.value = 'Password updated successfully'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: any) {
    passwordError.value = err.message || 'Failed to update password'
  }
}

function goBack() {
  router.push('/tasks')
}
</script>

<template>
  <div class="profile-view">
    <div class="profile-container glass-panel">
      <div class="header">
        <button @click="goBack" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Tasks
        </button>
      </div>

      <div class="profile-content">
        <div class="profile-section">
          <h2>Profile Information</h2>
          <form @submit.prevent="handleUpdateProfile" class="form-group">
            <div class="avatar-upload">
              <div class="avatar-preview" @click="triggerFileInput">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="avatar-img" />
                <div v-else class="avatar-placeholder">
                  <span>{{ username.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="avatar-overlay">
                  <span>Change Photo</span>
                </div>
              </div>
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                class="hidden-input"
                @change="handleFileSelect"
              />
            </div>

            <div class="input-group">
              <label>Email: {{ email }}</label>
            </div>
            
            <div class="input-group">
              <label>Username</label>
              <input v-model="username" type="text" class="input-field" />
            </div>

            <div class="input-group">
              <label>First Name</label>
              <input v-model="firstName" type="text" class="input-field" placeholder="Optional" />
            </div>

            <div class="input-group">
              <label>Last Name</label>
              <input v-model="lastName" type="text" class="input-field" placeholder="Optional" />
            </div>

            <div v-if="profileMessage" class="success-message">{{ profileMessage }}</div>
            <div v-if="profileError" class="error-message">{{ profileError }}</div>

            <button type="submit" class="btn btn-primary">Update Profile</button>
          </form>
        </div>

        <div class="divider-vertical"></div>

        <div class="profile-section">
          <h2>Change Password</h2>
          <form @submit.prevent="handleUpdatePassword" class="form-group">
            <div class="input-group">
              <label>Current Password</label>
              <input v-model="currentPassword" type="password" class="input-field" />
            </div>

            <div class="input-group">
              <label>New Password</label>
              <input v-model="newPassword" type="password" class="input-field" />
            </div>

            <div class="input-group">
              <label>Confirm New Password</label>
              <input v-model="confirmPassword" type="password" class="input-field" />
            </div>

            <div v-if="passwordMessage" class="success-message">{{ passwordMessage }}</div>
            <div v-if="passwordError" class="error-message">{{ passwordError }}</div>

            <button type="submit" class="btn btn-primary">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
}

.profile-container {
  width: 100%;
  max-width: 1000px;
  padding: 2rem;
  background-color: var(--bg-modal);
}

@media (max-width: 1280px) {
  .profile-view {
    padding: 1rem;
  }
   .profile-container {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 0.5rem;
  }
}

.profile-content {
  display: flex;
  gap: 3rem;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    gap: 2rem;
  }
  
  .divider-vertical {
    display: none;
  }
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
}

@media (max-width: 1280px) {
  .header{
  margin-bottom: 1.5rem;
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
  z-index: 10;
}

.btn-back:hover {
  color: var(--text-main);
}

.header h1 {
  flex: 1;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.profile-section {
  flex: 1;
}

.profile-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--text-main);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.input-field.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider-vertical {
  width: 1px;
  background: var(--border-color);
  align-self: stretch;
}

.avatar-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

@media (max-width: 1280px) {
  .avatar-upload {
  margin-bottom: 0;
 }
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: var(--bg-card-hover);
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
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-muted);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-overlay span {
  color: white;
  font-size: 0.8rem;
  text-align: center;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.hidden-input {
  display: none;
}

.success-message {
  color: var(--status-done);
  font-size: 0.9rem;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-sm);
}

.error-message {
  color: var(--status-danger);
  font-size: 0.9rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
}
</style>
