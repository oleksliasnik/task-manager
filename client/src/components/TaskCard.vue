<script setup lang="ts">
import IconClock from "./icons/IconClock.vue";
import IconCheck from "./icons/IconCheck.vue";
import IconCircle from "./icons/IconCircle.vue";
import IconEdit from "./icons/IconEdit.vue";
import IconTrash from "./icons/IconTrash.vue";
import { ref } from "vue";
import TaskDetailModal from "./TaskDetailModal.vue";
import type { Task } from "../stores/tasks";

const props = defineProps<{
  task: Task;
}>();
const emit = defineEmits(["update", "delete", "dragstart", "edit"]);

const showDetail = ref(false);

function handleToggle() {
  const newStatus = props.task.status === "completed" ? "pending" : "completed";
  emit("update", props.task._id, {
    status: newStatus,
    completed: newStatus === "completed",
  });
}

function handleDelete() {
  emit("delete", props.task._id);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function handleUpdate(taskId: string, updates: Partial<Task>) {
  emit("update", taskId, updates);
}

function handleEdit(task: Task) {
  emit("edit", task);
}
</script>

<template>
  <div class="task-card glass-panel" @click="showDetail = true">
    <div class="task-content">
      <div class="card-header">
        <div class="title-group">
          <h3
            class="task-title"
            :class="{ 'pending-text': task.syncStatus === 'pending' }"
          >
            {{ task.title }}
          </h3>
          <span
            v-if="task.syncStatus === 'pending'"
            class="sync-badge"
            title="Synchronization in progress..."
          >
            <span class="sync-dot"></span>
            Syncing...
          </span>
        </div>
        <div v-if="task.dueDate" class="task-due-date">
          <IconClock width="14" height="14" />
          {{ formatDate(task.dueDate) }}
        </div>
      </div>
    </div>
    <p class="task-description">{{ task.description }}</p>
    <div class="task-actions">
      <button
        @click.stop="handleToggle"
        class="btn-icon"
        :title="task.completed ? 'Mark incomplete' : 'Mark complete'"
      >
        <IconCheck v-if="task.completed" />
        <IconCircle v-else />
      </button>
      <button
        @click.stop="$emit('edit', task)"
        class="btn-icon"
        title="Edit task"
      >
        <IconEdit />
      </button>
      <button
        @click.stop="handleDelete"
        class="btn-icon btn-danger-icon"
        title="Delete task"
      >
        <IconTrash />
      </button>
    </div>

    <Teleport to="body">
      <TaskDetailModal
        :show="showDetail"
        :task="task"
        @close="showDetail = false"
        @update="handleUpdate"
        @delete="handleDelete"
        @edit="handleEdit"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.task-card {
  padding: 1.25rem;
  cursor: grab;
  transition: var(--transition-fast);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .task-card {
    min-width: 280px;
  }
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.task-card:active {
  cursor: grabbing;
}

.task-content {
  flex: 1;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  transition: var(--transition-fast);
}

.pending-text {
  opacity: 0.7;
}

.sync-badge {
  font-size: 0.7rem;
  color: var(--status-doing);
  background: rgba(var(--color-primary-rgb), 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;
  font-weight: 500;
}

.sync-dot {
  width: 6px;
  height: 6px;
  background-color: var(--status-doing);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
}

.task-description {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-muted);
  /* multiline ellipsis – show up to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 2.75rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
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

.task-due-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--status-doing);
  background: rgba(var(--color-primary-rgb), 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
}
</style>
