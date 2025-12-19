<script setup lang="ts">
import { ref, watch } from 'vue'
import IconClock from './icons/IconClock.vue'
import IconCheck from './icons/IconCheck.vue'
import IconCircle from './icons/IconCircle.vue'
import IconEdit from './icons/IconEdit.vue'
import IconTrash from './icons/IconTrash.vue'
import type { Task } from '../stores/tasks'

const props = defineProps<{
  show: boolean
  task: Task
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', taskId: string, updates: Partial<Task>): void
  (e: 'delete', taskId: string): void
  (e: 'edit', task: Task): void
}>()

const isEditing = ref(false)
const editedTask = ref({
  title: '',
  description: '',
  dueDate: ''
})

// Helper to format Date object to datetime-local string (YYYY-MM-DDTHH:mm)
const toDatetimeLocal = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().slice(0, 16)
}

function startEditing() {
  editedTask.value = {
    title: props.task.title,
    description: props.task.description,
    dueDate: toDatetimeLocal(props.task.dueDate)
  }
  isEditing.value = true
}

function saveEditing() {
  const updates: Partial<Task> = {
    title: editedTask.value.title,
    description: editedTask.value.description
  }
  
  if (editedTask.value.dueDate) {
    updates.dueDate = new Date(editedTask.value.dueDate).toISOString()
  } else {
    updates.dueDate = undefined // Or handle removal if API supports it
  }

  emit('update', props.task._id, updates)
  isEditing.value = false
}

function cancelEditing() {
  isEditing.value = false
}

watch(() => props.show, (newVal) => {
  if (!newVal) {
    isEditing.value = false
  }
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleToggle() {
  const newStatus = props.task.status === 'completed' ? 'pending' : 'completed'
  emit('update', props.task._id, { 
    status: newStatus, 
    completed: newStatus === 'completed' 
  })
}

function handleDelete() {
  emit('delete', props.task._id)
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal glass-panel">
      
      <div class="modal-header">
        <div v-if="isEditing" class="edit-title-wrapper">
           <input v-model="editedTask.title" class="edit-input title-input" placeholder="Task Title" />
        </div>
        <h2 v-else>{{ props.task.title }}</h2>
        <button class="btn-close" @click="emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div v-if="isEditing" class="edit-form">
          <div class="edit-field">
            <label class="edit-label">Due Date</label>
            <div class="date-input-wrapper">
              <IconClock class="input-icon" width="16" height="16" />
              <input type="datetime-local" v-model="editedTask.dueDate" class="edit-input date-input" />
            </div>
          </div>          
          <div class="edit-field">
             <label class="edit-label">Description</label>
             <textarea v-model="editedTask.description" class="edit-textarea" placeholder="Add a description..."></textarea>
          </div>         
        </div>
        
        <div v-else>
          <div v-if="props.task.dueDate" class="task-detail-due">
            <IconClock width="14" height="14" />
            {{ formatDate(props.task.dueDate) }}
          </div>
          <p class="task-detail-description">{{ props.task.description }}</p>
        </div>
      </div>

      <div class="task-actions" v-if="isEditing">
        <button @click="cancelEditing" class="btn btn-secondary">Cancel</button>
        <button @click="saveEditing" class="btn btn-primary">Save</button>
      </div>
      <div class="task-actions" v-else>
        <button @click="handleToggle" class="btn-icon" :title="props.task.completed ? 'Mark incomplete' : 'Mark complete'">
          <IconCheck v-if="props.task.completed" />
          <IconCircle v-else />
        </button>
        <button @click="startEditing" class="btn-icon" title="Edit task">
          <IconEdit />
        </button>
        <button @click="handleDelete" class="btn-icon btn-danger-icon" title="Delete task">
          <IconTrash />
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 600px;
  height: 80vh;
  overflow: hidden;
  background: var(--bg-modal);
}

.modal-header {
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .modal-header {
    padding: 1rem;
  }
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-main);
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-muted);
  transition: var(--transition-fast);
}

.btn-close:hover {
  color: var(--text-main);
}

.modal-body {
  padding: 0.5rem 2rem;
  height: 65%;
}

@media (max-width: 768px) {
  .modal-body {
    padding: 0.5rem 1rem;
    height: 70%;
  }
}

.task-detail-description {
  max-height: 45vh;
  white-space: pre-wrap;
  padding: 0 0.5rem 2rem 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-muted);
  overflow-y: auto;
}

.task-detail-due {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--status-doing);
  background: rgba(var(--color-primary-rgb), 0.1);
  padding: 0.5rem 0;
  border-radius: var(--radius-sm);
  width: fit-content;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem 2rem;
  border-top: 1px solid var(--border-color);
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-primary);
}

.btn-danger-icon:hover {
  color: var(--status-danger);
}

.edit-title-wrapper {
  flex: 1;
  margin-right: 1rem;
}

.title-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0.25rem 0;
  outline: none;
  transition: var(--transition-fast);
}

.title-input:focus {
  border-bottom-color: var(--color-primary);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0 0;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.edit-input,
.edit-textarea {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  color: var(--text-main);
  font-family: inherit;
  font-size: 1rem;
  transition: var(--transition-fast);
  outline: none;
}

.edit-textarea {
  min-height: 180px;
  resize: vertical;
}

.edit-input:focus,
.edit-textarea:focus {
  border-color: var(--color-primary);
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 10;
}

.date-input {
  padding-left: 2.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: var(--transition-fast);
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover, #4f46e5); /* Fallback */
  filter: brightness(1.1);
}

.btn-secondary {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}
</style>
