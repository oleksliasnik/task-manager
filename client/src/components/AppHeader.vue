<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useTaskStore } from '../stores/tasks'
import { useTheme } from '../composables/useTheme'
import IconSortAsc from './icons/IconSortAsc.vue'
import IconSortDesc from './icons/IconSortDesc.vue'
import IconSortManual from './icons/IconSortManual.vue'
import IconLogout from './icons/IconLogout.vue'
import IconSun from './icons/IconSun.vue'
import IconMoon from './icons/IconMoon.vue'
import IconMenu from './icons/IconMenu.vue'
import IconX from './icons/IconX.vue'
import IconUser from './icons/IconUser.vue'
import IconShield from './icons/IconShield.vue'
import IconList from './icons/IconList.vue'
import { ref } from 'vue'

const props = defineProps<{
  viewMode: 'board' | 'list'
  showingAllTasks: boolean
}>()

const emit = defineEmits<{
  (e: 'update:viewMode', value: 'board' | 'list'): void
  (e: 'toggle-all-tasks'): void
  (e: 'create-task'): void
  (e: 'sort-change'): void
}>()

const authStore = useAuthStore()
const taskStore = useTaskStore()
const { theme, toggleTheme } = useTheme()
const isMenuOpen = ref(false)

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <header class="app-header glass-panel">
    <div class="header-content">
      <h1>Task Manager</h1>
      <div class="header-actions">

        <button @click="$emit('create-task')" class="btn btn-primary">
            + New Task
        </button>
        
        <div class="desktop-group">
          <button 
            @click="$emit('sort-change')" 
            class="btn btn-secondary btn-sort" 
            :title="taskStore.sortOrder === 'manual' ? 'Manual Sort' : (taskStore.sortOrder === 'asc' ? 'Oldest First' : 'Newest First')"
          >
            <IconSortAsc v-if="taskStore.sortOrder === 'asc'" />
            <IconSortDesc v-else-if="taskStore.sortOrder === 'desc'" />
            <IconSortManual v-else />
          </button>
  
          <div class="view-toggle">
            <button
              @click="$emit('update:viewMode', 'board')"
              class="btn-toggle"
              :class="{ active: viewMode === 'board' }"
            >
              All tasks
            </button>
            <button
              @click="$emit('update:viewMode', 'list')"
              class="btn-toggle"
              :class="{ active: viewMode === 'list' }"
            >
              Pending
            </button>
          </div>
      
          <button 
            v-if="authStore.user?.role === 'admin'" 
            @click="$emit('toggle-all-tasks')" 
            class="btn btn-secondary"
          >
            {{ showingAllTasks ? 'Show My Tasks' : 'Show All Tasks' }}
          </button>

          <router-link to="/profile" class="user-profile-link" v-if="authStore.user">
            <div class="avatar-container">
              <img 
                v-if="authStore.user.avatar" 
                :src="authStore.user.avatar.startsWith('http') ? authStore.user.avatar : `http://localhost:3000${authStore.user.avatar}`" 
                class="header-avatar" 
                alt="Avatar"
              />
              <div v-else class="header-avatar-placeholder">
                {{ authStore.user.username?.charAt(0).toUpperCase() }}
              </div>
            </div>
          </router-link>

          <router-link v-if="authStore.user.role === 'admin'" to="/admin" class="badge-admin">Admin</router-link>
     
          <button @click="toggleTheme" class="btn btn-secondary btn-icon-only" title="Toggle Theme">
            <IconSun v-if="theme === 'dark'" />
            <IconMoon v-else />
          </button>
  
          <button @click="handleLogout" class="btn btn-logout" title="Logout">
            <IconLogout />
          </button>
        </div>

        <button class="btn btn-secondary btn-icon-only btn-burger" @click="isMenuOpen = !isMenuOpen">
          <IconX v-if="isMenuOpen" />
          <IconMenu v-else />
        </button>

        <!-- Mobile menu -->
        <div class="mobile-menu glass-panel" :class="{ open: isMenuOpen }">
          <div class="mobile-header-row">
            <button class="btn btn-icon-only btn-close-menu" @click="isMenuOpen = false">
              <IconX />
            </button>
          </div>

          <div class="mobile-admin-section">
              <router-link to="/profile" v-if="authStore.user">
                <button class="btn btn-secondary mobile-full-btn">
                  <IconUser />
                  <span>Profile</span>
                </button>
            </router-link>
            <router-link v-if="authStore.user.role === 'admin'" to="/admin" class="admin">
              <button class="btn btn-secondary mobile-full-btn">
                <IconShield />
                <span>Admin panel</span>
              </button>
            </router-link>
            <button 
               v-if="authStore.user?.role === 'admin'" 
               @click="$emit('toggle-all-tasks')" 
               class="btn btn-secondary mobile-full-btn"
            >
              <IconList color="white" />
              <span>{{ showingAllTasks ? 'Show My Tasks' : 'Show All Tasks' }}</span>
            </button>
          </div>
          
          <div class="mobile-menu-items">
             <div class="mobile-row">
                 <button 
                 @click="$emit('sort-change')" 
                 class="btn btn-secondary btn-sort" 
                 >
                  <IconSortAsc v-if="taskStore.sortOrder === 'asc'" />
                  <IconSortDesc v-else-if="taskStore.sortOrder === 'desc'" />
                  <IconSortManual v-else />
                  <span class="btn-text">{{ taskStore.sortOrder === 'manual' ? 'Manual' : (taskStore.sortOrder === 'asc' ? 'Oldest' : 'Newest') }}</span>
                </button>
             </div>

             <div class="mobile-row">
                <div class="view-toggle">
                  <button
                    @click="$emit('update:viewMode', 'board')"
                    class="btn-toggle"
                    :class="{ active: viewMode === 'board' }"
                  >
                    All Tasks
                  </button>
                  <button
                    @click="$emit('update:viewMode', 'list')"
                    class="btn-toggle"
                    :class="{ active: viewMode === 'list' }"
                  >
                    Panding Tasks
                  </button>
                </div>
             </div>

             <div class="mobile-row">
               <button @click="toggleTheme" class="btn btn-secondary btn-icon-only">
                  <IconSun v-if="theme === 'dark'" />
                  <IconMoon v-else />
                  <span class="btn-text">{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
               </button>
             </div>

             <div class="mobile-row">
                <button @click="handleLogout" class="btn btn-logout mobile-full-btn">
                  <IconLogout />
                  <span>Logout</span>
                </button>
             </div>
          </div>         
        </div>
      </div>
    </div>
    
    <div 
      class="menu-overlay" 
      :class="{ open: isMenuOpen }" 
      @click="isMenuOpen = false"
    ></div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 50;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.app-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--status-doing) 50%, var(--status-done) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-profile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  cursor: pointer;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.header-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 1.3rem;
  line-height: 1;
  border: 2px solid var(--border-color);
}

.badge-admin {
  background: var(--color-primary);
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 99px;
  text-transform: uppercase;
  font-weight: 700;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-sort {
  height: 2rem; 
  padding: 0.5rem 0.45rem;
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--bg-card);
}
.btn-sort:hover {
  background: var(--color-primary);
  color: white;
}

.btn-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;
}

.btn-logout {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
}

.btn-logout:hover {
  background: var(--color-primary);
  color: white;
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

@media (max-width: 768px) {
  .app-header {
    padding: 0.5rem 1rem;
    margin-bottom: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }
}

.desktop-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-burger {
  display: none;
}

.mobile-menu {
  display: none;
}

/* Burger Menu Breakpoint */
@media (max-width: 1200px) {
  .desktop-group {
    display: none;
  } 

  .btn-burger {
    display: flex;
  } 

  .header-actions {
    position: static; 
  }  

  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: -2px;
    width: 300px;
    height: 100vh;
    background: var(--bg-card);
    border-left: 1px solid var(--glass-border);
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    padding: 2rem 1.5rem;
    z-index: 100;
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.2);
    
    transform: translateX(100%);
    visibility: hidden;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s;
    overflow-y: auto;
  }
  
  .mobile-menu.open {
    transform: translateX(0);
    visibility: visible;
  }

   .mobile-admin-section {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    width: 100%;
  }

  .admin {
    color: var(--text-main);
    font-size: 1rem;
    border-radius: 99px;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mobile-menu-items {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  
  .mobile-row {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 0;
    border-bottom: 1px solid var(--glass-border);
    gap: 0.75rem;
    width: 100%;
  }
  
  .mobile-row:last-child {
    border-bottom: none;
  }
  
  .mobile-label {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }
  
  /* Buttons in menu */
  .mobile-menu .btn-secondary, 
  .mobile-menu .view-toggle,
  .mobile-menu .btn-logout {
    width: auto;
  }

  /* Flatten Buttons to List Items */
  .mobile-menu .btn-secondary, 
  .mobile-menu .view-toggle,
  .mobile-menu .btn-logout,
  .mobile-menu .btn-sort {
    width: 100%;
    background: transparent;
    border: none;
    padding: 0.5rem 0;
    justify-content: flex-start;
    color: var(--text-main);
    height: auto;
    border-radius: 0;
  }
  
  .mobile-menu .btn-secondary:hover,
  .mobile-menu .btn-logout:hover {
    background: transparent;
    color: var(--color-primary);
  }

  .mobile-menu .btn-secondary {
   gap: 1rem;
  }

  .mobile-menu .view-toggle {
    display: flex;
    background: var(--bg-card-hover);
    padding: 0.25rem;
    border-radius: var(--radius-md);
    border: none;
  }

  .mobile-menu .btn-toggle {
    flex: 1;
    justify-content: center;
    border-radius: var(--radius-sm);
  }

  .mobile-menu .btn-text {
    font-size: 1rem;
  }
  
  .mobile-full-btn {
    text-align: left;
    justify-content: flex-start;
    padding-left: 0;
    font-size: 1rem;
    gap: 1rem;
  }

  .mobile-menu svg {
    width: 20px;
    height: 20px;
    color: var(--text-muted);
  }
  
  .mobile-menu button:hover svg {
    color: var(--color-primary);
  }
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(4px);
}

.menu-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.mobile-header-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.btn-close-menu {
  color: var(--text-muted);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}
.btn-close-menu:hover {
  color: var(--text-main);
  background: rgba(0,0,0,0.05);
}
</style>
