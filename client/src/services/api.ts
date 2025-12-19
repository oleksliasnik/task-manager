const API_BASE_URL = `http://${window.location.hostname}:3000/api`

interface AuthResponse {
    token: string
    user: any
}

export const authApi = {
    async register(email: string, password: string, username: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, username }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Registration failed')
        }

        return response.json()
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Login failed')
        }

        return response.json()
    },

    async updateProfile(token: string, formData: FormData) {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to update profile')
        }

        return response.json()
    },

    async updatePassword(token: string, currentPassword: string, newPassword: string) {
        const response = await fetch(`${API_BASE_URL}/auth/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to update password')
        }

        return response.json()
    },

    async getAllUsers(token: string) {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to fetch users')
        }

        return response.json()
    },

    async getUserById(token: string, userId: string) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to fetch user')
        }

        return response.json()
    },

    async deleteUser(token: string, userId: string) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to delete user')
        }

        return response.json()
    },
}

export const taskApi = {
    async getTasks(token: string, sort: 'asc' | 'desc' | 'manual' = 'manual') {
        const response = await fetch(`${API_BASE_URL}/task?sort=${sort}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch tasks')
        }

        return response.json()
    },

    async getAllTasks(token: string, sort: 'asc' | 'desc' | 'manual' = 'manual') {
        const response = await fetch(`${API_BASE_URL}/task/all?sort=${sort}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch all tasks')
        }

        return response.json()
    },

    async createTask(token: string, title: string, description: string, dueDate?: string) {
        const response = await fetch(`${API_BASE_URL}/task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, description, dueDate }),
        })

        if (!response.ok) {
            throw new Error('Failed to create task')
        }

        return response.json()
    },

    async updateTask(token: string, taskId: string, updates: any) {
        const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        })

        if (!response.ok) {
            throw new Error('Failed to update task')
        }

        return response.json()
    },

    async deleteTask(token: string, taskId: string) {
        const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to delete task')
        }

        return response.json()
    },

    async reorderTasks(token: string, tasks: { _id: string; order: number }[]) {
        const response = await fetch(`${API_BASE_URL}/task/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ tasks }),
        })

        if (!response.ok) {
            throw new Error('Failed to reorder tasks')
        }

        return response.json()
    },
}
