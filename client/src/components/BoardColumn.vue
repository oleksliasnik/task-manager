<script setup lang="ts">
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'
import type { Task } from '../stores/tasks'

const props = defineProps<{
  title: string
  tasks: Task[]
  status: string
  headerClass?: string
}>()

const emit = defineEmits<{
  (e: 'update:tasks', value: Task[]): void
  (e: 'drag-change', event: any): void
  (e: 'update-task', taskId: string, updates: Partial<Task>): void
  (e: 'delete-task', taskId: string): void
  (e: 'edit-task', task: Task): void
}>()

function onDragChange(event: any) {
    emit('drag-change', event)
}

function handleUpdateTask(taskId: string, updates: Partial<Task>) {
  emit('update-task', taskId, updates)
}

function handleDeleteTask(taskId: string) {
  emit('delete-task', taskId)
}

function openEditModal(task: Task) {
  emit('edit-task', task)
}
</script>

<template>
  <div class="board-column">
    <div class="column-header" :class="headerClass">
      <h2>{{ title }}</h2>
      <span class="task-count">{{ tasks.length }}</span>
    </div>
    <draggable
      :model-value="tasks"
      @update:model-value="$emit('update:tasks', $event)"
      group="tasks"
      :animation="150"
      ghost-class="ghost-card"
      class="column-content"
      item-key="_id"
      @change="onDragChange"
      :style="{ cursor: 'move' }"
      :delay="200"
      :delay-on-touch-only="true"
    >
      <template #item="{ element }">
        <TaskCard
          :task="element"
          @update="handleUpdateTask"
          @delete="handleDeleteTask"
          @edit="openEditModal"
        />
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.board-column {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-left: 0.5rem;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  margin-bottom: 0.4rem;
  padding-bottom: 0.75rem;
  width: 95%;
  border-bottom: 2px solid var(--color-primary);
}

.column-header.in-progress {
  border-bottom-color: var(--status-doing);
}

.column-header.completed {
  border-bottom-color: var(--status-done);
}

.column-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-main);
}

.task-count {
  background: var(--bg-card);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.column-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none; 
  padding: 0.9rem;
  cursor: default !important;
  min-height: 0;
}

.ghost-card {
  opacity: 1;
  background: var(--bg-card-hover);
  border: 1px dashed var(--color-primary);
}

@media (max-width: 768px) {
  .column-header h2 {
    min-width: 150px;
  }
}
</style>
