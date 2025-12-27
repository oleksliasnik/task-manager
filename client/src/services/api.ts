import { User } from "@/types/user";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

// ====== Universal helper function ======
async function safeFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    // If network unavailable / Render is sleeping
    if (!res) {
      const err: any = new Error("Network unavailable");
      err.isOffline = true;
      throw err;
    }

    if (!res.ok) {
      let body;
      try {
        body = await res.json();
      } catch (_) {}

      const err: any = new Error(body?.message || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return res.json();
  } catch (e: any) {
    if (e?.name === "AbortError") {
      const err: any = new Error("Timeout — сервер не ответил");
      err.isOffline = true; // считаем Render спящим
      throw err;
    }

    if (e?.message === "Failed to fetch") {
      e.isOffline = true;
    }

    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// ============================ AUTH API ===============================

interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  async register(
    email: string,
    password: string,
    username: string
  ): Promise<AuthResponse> {
    return safeFetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return safeFetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  async updateProfile(token: string, formData: FormData) {
    return safeFetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },

  async updatePassword(
    token: string,
    currentPassword: string,
    newPassword: string
  ) {
    return safeFetch(`${API_BASE_URL}/auth/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async getAllUsers(token: string) {
    return safeFetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getUserById(token: string, userId: string) {
    return safeFetch(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async deleteUser(token: string, userId: string) {
    return safeFetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// ============================ TASK API ===============================

export const taskApi = {
  async getTasks(token: string, sort: "asc" | "desc" | "manual" = "manual") {
    return safeFetch(`${API_BASE_URL}/task?sort=${sort}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getAllTasks(token: string, sort: "asc" | "desc" | "manual" = "manual") {
    return safeFetch(`${API_BASE_URL}/task/all?sort=${sort}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async createTask(
    token: string,
    title: string,
    description: string,
    dueDate?: string
  ) {
    return safeFetch(`${API_BASE_URL}/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, dueDate }),
    });
  },

  async updateTask(token: string, taskId: string, updates: any) {
    return safeFetch(`${API_BASE_URL}/task/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(token: string, taskId: string) {
    return safeFetch(`${API_BASE_URL}/task/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async reorderTasks(token: string, tasks: { _id: string; order: number }[]) {
    return safeFetch(`${API_BASE_URL}/task/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tasks }),
    });
  },
};
