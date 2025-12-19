<script setup lang="ts">
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'
import type { Task } from '../stores/tasks'

const props = defineProps<{
  tasks: Task[]
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
  <div class="list-section">
    <h2 class="section-title">Pending Tasks</h2>
    <div class="tasks-list">
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
  </div>
</template>

<style scoped>
.list-section {
  padding: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  padding-left: 1rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: scroll;
  max-height: 84vh;
  scrollbar-width: none;
  padding: 1rem 1.5rem;
}

.ghost-card {
  opacity: 1;
  background: var(--bg-card-hover);
  border: 1px dashed var(--color-primary);
}

.column-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
