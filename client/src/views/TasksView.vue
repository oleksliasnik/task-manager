<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useTaskStore, type Task } from '../stores/tasks'
import BoardColumn from '../components/BoardColumn.vue'
import TaskModal from '../components/TaskModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import AppHeader from '../components/AppHeader.vue'
import TaskListView from '../components/TaskListView.vue'

const taskStore = useTaskStore()

const newTaskTitle = ref('')
const newTaskDescription = ref('')
const showCreateModal = ref(false)
const viewMode = ref<'board' | 'list'>('board')
const showingAllTasks = ref(false)

const showEditModal = ref(false)
const editingTask = ref<Task | null>(null)
const editTaskTitle = ref('')
const editTaskDescription = ref('')
const newTaskDueDate = ref('')
const editTaskDueDate = ref('')

async function handleSortChange() {
  taskStore.toggleSortOrder()
  if (showingAllTasks.value) {
    await taskStore.fetchAllTasks()
  } else {
    await taskStore.fetchTasks()
  }
}

const localPendingTasks = ref<Task[]>([])
const localInProgressTasks = ref<Task[]>([])
const localCompletedTasks = ref<Task[]>([])

// Sync local state with store
watch(() => taskStore.tasks, (newTasks) => {
  localPendingTasks.value = newTasks.filter(t => t.status === 'pending')
  localInProgressTasks.value = newTasks.filter(t => t.status === 'in_progress')
  localCompletedTasks.value = newTasks.filter(t => t.status === 'completed')
}, { deep: true, immediate: true })

onMounted(async () => {
  await taskStore.fetchTasks()
})

async function handleCreateTask() {
  if (!newTaskDescription.value.trim()) return

  try {
    await taskStore.createTask(newTaskTitle.value, newTaskDescription.value, newTaskDueDate.value || undefined)
    newTaskTitle.value = ''
    newTaskDescription.value = ''
    newTaskDueDate.value = ''
    showCreateModal.value = false
  } catch (err) {
    console.error('Failed to create task:', err)
  }
}

async function handleUpdateTask(taskId: string, updates: Partial<Task>) {
  try {
    await taskStore.updateTask(taskId, updates)
  } catch (err) {
    console.error('Failed to update task:', err)
  }
}

function openEditModal(task: Task) {
  editingTask.value = task
  editTaskTitle.value = task.title
  editTaskDescription.value = task.description
  if (task.dueDate) {
    const date = new Date(task.dueDate)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    editTaskDueDate.value = date.toISOString().slice(0, 16)
  } else {
    editTaskDueDate.value = ''
  }
  showEditModal.value = true
}

async function handleSaveEdit() {
  if (!editingTask.value || !editTaskTitle.value.trim() || !editTaskDescription.value.trim()) return

  try {
    await taskStore.updateTask(editingTask.value._id, { 
      title: editTaskTitle.value,
      description: editTaskDescription.value,
      dueDate: editTaskDueDate.value || undefined
    })
    showEditModal.value = false
    editingTask.value = null
    editTaskDescription.value = ''
  } catch (err) {
    console.error('Failed to update task:', err)
  }
}

async function toggleAllTasks() {
  if (showingAllTasks.value) {
    await taskStore.fetchTasks()
    showingAllTasks.value = false
  } else {
    await taskStore.fetchAllTasks()
    showingAllTasks.value = true
  }
}

const showDeleteModal = ref(false)
const taskToDelete = ref<string | null>(null)
const isDeleting = ref(false)

function handleDeleteTask(taskId: string) {
  taskToDelete.value = taskId
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!taskToDelete.value) return
  
  isDeleting.value = true
  try {
    await taskStore.deleteTask(taskToDelete.value)
    showDeleteModal.value = false
    taskToDelete.value = null
  } catch (err) {
    console.error('Failed to delete task:', err)
  } finally {
    isDeleting.value = false
  }
}

function handleDragChange(event: any, targetStatus: 'pending' | 'in_progress' | 'completed') {
  if (taskStore.sortOrder !== 'manual') {
    taskStore.sortOrder = 'manual'
  }

  if (event.added) {
    const task = event.added.element
    
    // Optimistically update
    task.status = targetStatus
    task.completed = targetStatus === 'completed'

    // Update backend
    handleUpdateTask(task._id, { 
      status: targetStatus,
      completed: targetStatus === 'completed' 
    })
  }

  // Calculate new order based on the current state of local lists
  const newAllTasks = [...localPendingTasks.value, ...localInProgressTasks.value, ...localCompletedTasks.value]
  
  taskStore.reorderTasks(newAllTasks)
}

const newTaskInput = ref<HTMLInputElement | null>(null)

watch(showCreateModal, async (newValue) => {
  if (newValue) {
    await nextTick()
    newTaskInput.value?.focus()
  }
})
</script>

<template>
  <div class="tasks-view">
    <AppHeader
      v-model:viewMode="viewMode"
      :showingAllTasks="showingAllTasks"
      @toggle-all-tasks="toggleAllTasks"
      @create-task="showCreateModal = true"
      @sort-change="handleSortChange"
    />

    <main class="main-content">

      <div v-if="taskStore.loading && taskStore.tasks.length === 0" class="loading">
        <div class="spinner"></div>
        <p>Loading tasks...</p>
      </div>

      <div v-else-if="taskStore.error" class="error-message">{{ taskStore.error }}</div>

      <div v-else-if="taskStore.tasks.length === 0" class="empty-state glass-panel">
        <h2>No tasks yet</h2>
        <p>Create your first task to get started!</p>
        <button @click="showCreateModal = true" class="btn btn-primary">+ Create Task</button>
      </div>

      <div v-else-if="viewMode === 'board'" class="board-view">
        <BoardColumn
          title="Pending Tasks"
          v-model:tasks="localPendingTasks"
          status="pending"
          @drag-change="handleDragChange($event, 'pending')"
          @update-task="handleUpdateTask"
          @delete-task="handleDeleteTask"
          @edit-task="openEditModal"
        />

        <BoardColumn
          title="In Progress"
          v-model:tasks="localInProgressTasks"
          status="in_progress"
          headerClass="in-progress"
          @drag-change="handleDragChange($event, 'in_progress')"
          @update-task="handleUpdateTask"
          @delete-task="handleDeleteTask"
          @edit-task="openEditModal"
        />

        <BoardColumn
          title="Completed"
          v-model:tasks="localCompletedTasks"
          status="completed"
          headerClass="completed"
          @drag-change="handleDragChange($event, 'completed')"
          @update-task="handleUpdateTask"
          @delete-task="handleDeleteTask"
          @edit-task="openEditModal"
        />
      </div>

      <div v-else class="list-view">
        <TaskListView
          v-model:tasks="localPendingTasks"
          @drag-change="handleDragChange($event, 'pending')"
          @update-task="handleUpdateTask"
          @delete-task="handleDeleteTask"
          @edit-task="openEditModal"
        />
      </div>
    </main>

    <TaskModal
      :show="showCreateModal"
      title="Create New Task"
      submitLabel="Create Task"
      v-model:taskTitle="newTaskTitle"
      v-model:taskDescription="newTaskDescription"
      v-model:taskDueDate="newTaskDueDate"
      @close="showCreateModal = false"
      @submit="handleCreateTask"
    />

    <TaskModal
      :show="showEditModal"
      title="Edit Task"
      submitLabel="Save Changes"
      v-model:taskTitle="editTaskTitle"
      v-model:taskDescription="editTaskDescription"
      v-model:taskDueDate="editTaskDueDate"
      @close="showEditModal = false"
      @submit="handleSaveEdit"
    />

    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Task"
      message="Are you sure you want to delete this task? This action cannot be undone."
      confirmLabel="Delete"
      :loading="isDeleting"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.tasks-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow: hidden;
}

.main-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.board-view {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  min-height: 0;
}

@media (max-width: 768px) {
  .tasks-view {
    padding: 0rem;
 }
  .board-view {
    overflow-x: auto;
    gap: 0rem;
  }
}
</style>
