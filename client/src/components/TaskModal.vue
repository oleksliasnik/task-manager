<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  title: string;
  submitLabel?: string;
  taskTitle: string;
  taskDescription: string;
  taskDueDate: string;
}>();

const emit = defineEmits<{
  (e: "update:taskTitle", value: string): void;
  (e: "update:taskDescription", value: string): void;
  (e: "update:taskDueDate", value: string): void;
  (e: "close"): void;
  (e: "submit"): void;
}>();
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal glass-panel">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button @click="emit('close')" class="btn-close">×</button>
      </div>
      <form @submit.prevent="emit('submit')" class="modal-body">
        <input
          :value="taskTitle"
          @input="
            emit('update:taskTitle', ($event.target as HTMLInputElement).value)
          "
          class="input-field task-input"
          placeholder="Task Title"
        />
        <input
          type="datetime-local"
          :value="taskDueDate"
          @input="
            emit(
              'update:taskDueDate',
              ($event.target as HTMLInputElement).value
            )
          "
          class="input-field task-input"
        />
        <textarea
          :value="taskDescription"
          @input="
            emit(
              'update:taskDescription',
              ($event.target as HTMLInputElement).value
            )
          "
          class="input-field task-textarea"
          placeholder="Enter task description..."
          rows="4"
          required
        ></textarea>
        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="btn btn-danger">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ submitLabel || "Save" }}
          </button>
        </div>
      </form>
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
  max-width: 500px;
  padding: 0;
  overflow: hidden;
}

.glass-panel {
  background: var(--bg-modal);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-lg);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 2rem;
}

.task-input {
  width: 100%;
  margin-bottom: 1rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 400;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.task-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.task-textarea {
  width: 100%;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 1.5rem;
  font-family: inherit;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.task-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-danger {
  background: transparent;
  color: var(--status-danger);
  border: 1px solid var(--status-danger);
}

.btn-danger:hover {
  background: var(--status-danger);
  color: white;
}
</style>
