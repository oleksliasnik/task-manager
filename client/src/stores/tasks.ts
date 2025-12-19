import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskApi } from '../services/api'
import { useAuthStore } from './auth'

export interface Task {
    _id: string
    title: string
    description: string
    completed: boolean
    status?: 'pending' | 'in_progress' | 'completed'
    createBy: string
    dueDate?: string
    order: number
}

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref<Task[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const sortOrder = ref<'asc' | 'desc' | 'manual'>('manual')

    async function fetchTasks() {
        const authStore = useAuthStore()
        if (!authStore.token) return

        loading.value = true
        error.value = null
        try {
            const fetchedTasks = await taskApi.getTasks(authStore.token, sortOrder.value)
            tasks.value = fetchedTasks.map((task: Task) => ({
                ...task,
                status: task.status || (task.completed ? 'completed' : 'pending')
            }))
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    async function fetchAllTasks() {
        const authStore = useAuthStore()
        if (!authStore.token) return

        loading.value = true
        error.value = null
        try {
            const fetchedTasks = await taskApi.getAllTasks(authStore.token, sortOrder.value)
            tasks.value = fetchedTasks.map((task: Task) => ({
                ...task,
                status: task.status || (task.completed ? 'completed' : 'pending')
            }))
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    async function createTask(title: string, description: string, dueDate?: string) {
        const authStore = useAuthStore()
        if (!authStore.token) return

        try {
            const newTask = await taskApi.createTask(authStore.token, title, description, dueDate)
            tasks.value.push(newTask)
            
            if (sortOrder.value === 'desc') {
                tasks.value.unshift(newTask)
            } else {
                tasks.value.push(newTask)
            }

            await fetchTasks()
        } catch (err: any) {
            error.value = err.message
            throw err
        }
    }

    async function updateTask(taskId: string, updates: Partial<Task>) {
        const authStore = useAuthStore()
        if (!authStore.token) return

        try {
            const updated = await taskApi.updateTask(authStore.token, taskId, updates)
            const index = tasks.value.findIndex((task) => task._id === taskId)
            if (index !== -1) {
                tasks.value[index] = updated
            }
            return updated
        } catch (err: any) {
            error.value = err.message
            throw err
        }
    }

    async function deleteTask(taskId: string) {
        const authStore = useAuthStore()
        if (!authStore.token) return

        try {
            await taskApi.deleteTask(authStore.token, taskId)
            tasks.value = tasks.value.filter((task) => task._id !== taskId)
        } catch (err: any) {
            error.value = err.message
            throw err
        }
    }

    async function reorderTasks(updatedTasks: Task[]) {
        const authStore = useAuthStore()
        if (!authStore.token) return

        // Optimistic update
        tasks.value = updatedTasks

        try {
            const tasksToUpdate = updatedTasks.map((task, index) => ({
                _id: task._id,
                order: index * 1000 // Simple re-indexing strategy
            }))

            await taskApi.reorderTasks(authStore.token, tasksToUpdate)
        } catch (err: any) {
            error.value = err.message
            // Revert on error? For now just show error
            console.error('Failed to reorder', err)
        }
    }

    function toggleSortOrder() {
        if (sortOrder.value === 'manual') sortOrder.value = 'desc' // Newest first
        else if (sortOrder.value === 'desc') sortOrder.value = 'asc' // Oldest first
        else sortOrder.value = 'manual'
    }

    return {
        tasks,
        loading,
        error,
        sortOrder,
        fetchTasks,
        fetchAllTasks,
        createTask,
        updateTask,
        deleteTask,
        reorderTasks,
        toggleSortOrder,
    }
})
