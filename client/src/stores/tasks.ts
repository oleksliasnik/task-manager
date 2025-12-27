import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import { taskApi } from "../services/api";
import { useAuthStore } from "./auth";

export type SyncStatus = "synced" | "pending" | "error";

export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  status?: "pending" | "in_progress" | "completed";
  createBy: string;
  dueDate?: string;
  order: number;
  isTemp?: boolean;
  syncStatus?: SyncStatus;
}

interface PendingOp {
  type: "create" | "update" | "delete" | "reorder";
  tempId?: string;
  taskId?: string;
  payload?: any;
  retries?: number;
}

const LS_TASKS_KEY = "tasks_cache";
const LS_OPS_KEY = "tasks_pending_ops";
const LS_SORT_KEY = "tasks_sort_order";

export const useTaskStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const sortOrder = ref<"asc" | "desc" | "manual">("manual");
  const processing = ref(false); // background activity indicator
  const syncQueue = computed(() => pendingOps.value);

  const pendingOps = ref<PendingOp[]>([]);
  let retryTimeout: any = null;

  // ---------------- LOCAL STORAGE ----------------

  function loadFromLocalStorage() {
    const raw = localStorage.getItem(LS_TASKS_KEY);
    if (raw) {
      tasks.value = JSON.parse(raw);
    }

    const ops = localStorage.getItem(LS_OPS_KEY);
    if (ops) {
      pendingOps.value = JSON.parse(ops);
    }

    const savedSort = localStorage.getItem(LS_SORT_KEY);
    if (savedSort && ["asc", "desc", "manual"].includes(savedSort)) {
      sortOrder.value = savedSort as "asc" | "desc" | "manual";
    }
  }

  function saveTasksToLS() {
    localStorage.setItem(LS_TASKS_KEY, JSON.stringify(tasks.value));
  }

  function saveOpsToLS() {
    localStorage.setItem(LS_OPS_KEY, JSON.stringify(pendingOps.value));
  }

  function saveSortToLS() {
    localStorage.setItem(LS_SORT_KEY, sortOrder.value);
  }

  watch(tasks, saveTasksToLS, { deep: true });
  watch(pendingOps, saveOpsToLS, { deep: true });
  watch(sortOrder, () => {
    saveSortToLS();
    sortTasksLocally();
  });

  loadFromLocalStorage();

  // ---------------- HELPER: LOCAL SORT ----------------
  function sortTasksLocally() {
    if (sortOrder.value === "manual") {
      tasks.value.sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      tasks.value.sort((a, b) => {
        // Mongo _id contains timestamp. Sort by it is reliable for "created time"
        // asc = oldest first (smaller id first), desc = newest first
        if (a._id < b._id) return sortOrder.value === "asc" ? -1 : 1;
        if (a._id > b._id) return sortOrder.value === "asc" ? 1 : -1;
        return 0;
      });
    }
  }

  // ---------------- SYNCHRONIZATION ----------------

  async function syncPendingOps() {
    const auth = useAuthStore();
    if (!auth.token) return;
    if (processing.value) return;
    if (pendingOps.value.length === 0) return;

    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }

    processing.value = true;

    while (pendingOps.value.length > 0) {
      const op = pendingOps.value[0];

      try {
        if (op.type === "create") {
          const created = await taskApi.createTask(
            auth.token,
            op.payload.title,
            op.payload.description,
            op.payload.dueDate
          );

          const tempId = op.tempId;
          const realId = created._id;

          const taskIndex = tasks.value.findIndex((t) => t._id === tempId);
          if (taskIndex !== -1) {
            tasks.value[taskIndex] = {
              ...tasks.value[taskIndex],
              _id: realId,
              syncStatus: "synced",
              isTemp: false,
              createBy: created.createBy,
            };
          }

          for (let i = 1; i < pendingOps.value.length; i++) {
            const nextOp = pendingOps.value[i];

            if (nextOp.taskId === tempId) {
              nextOp.taskId = realId;
            }

            if (nextOp.type === "reorder" && Array.isArray(nextOp.payload)) {
              nextOp.payload = nextOp.payload.map((item: any) =>
                item._id === tempId ? { ...item, _id: realId } : item
              );
            }
          }
        }

        if (op.type === "update" && op.taskId) {
          const updated = await taskApi.updateTask(
            auth.token,
            op.taskId,
            op.payload
          );

          const idx = tasks.value.findIndex((t) => t._id === op.taskId);
          if (idx !== -1)
            tasks.value[idx] = {
              ...tasks.value[idx],
              ...updated,
              syncStatus: "synced",
            };
        }

        if (op.type === "delete" && op.taskId) {
          await taskApi.deleteTask(auth.token, op.taskId);
        }

        if (op.type === "reorder") {
          await taskApi.reorderTasks(auth.token, op.payload);

          const affectedIds = op.payload.map((p: any) => p._id);
          tasks.value = tasks.value.map((t) =>
            affectedIds.includes(t._id) ? { ...t, syncStatus: "synced" } : t
          );
        }

        pendingOps.value.shift();
      } catch (e: any) {
        // 1. FATAL ERRORS (404 Not Found, 400 Bad Request)
        // If task not found or request is invalid, no point in retrying.
        // Ignore operation and move to next.
        if (e.status === 404 || e.status === 400) {
          console.error(
            `Sync op failed permanently (status ${e.status}). Skipping.`,
            op
          );
          pendingOps.value.shift();
          continue; // Move to next operation
        }

        // 2. RETRY LOGIC for unknown errors
        // If error doesn't look like a network error, count retries
        const isNetworkError =
          e.isOffline || e.name === "AbortError" || e.status >= 500;

        if (!isNetworkError) {
          if (!op.retries) op.retries = 0;
          op.retries++;

          // If failed 3 times, skip
          if (op.retries >= 3) {
            console.error("Op failed too many times, skipping:", op);
            pendingOps.value.shift();
            continue;
          }
        }

        // 3. SERVER/NETWORK RETRY
        // If network or server error, wait and retry entire process
        console.warn("Sync failed (transient), retry in 10s:", e);
        processing.value = false;

        if (retryTimeout) clearTimeout(retryTimeout);
        retryTimeout = setTimeout(() => {
          syncPendingOps();
        }, 10000);

        return;
      }
    }

    processing.value = false;
  }

  // ---------------- FETCH ----------------

  async function fetchTasks() {
    const auth = useAuthStore();
    if (!auth.token) return;

    loading.value = true;
    error.value = null;

    try {
      const fetched = await taskApi.getTasks(auth.token, sortOrder.value);

      tasks.value = fetched.map((t: Task) => ({
        ...t,
        status: t.status || (t.completed ? "completed" : "pending"),
      }));

      await syncPendingOps();
    } catch (e: any) {
      console.warn("Server unavailable, using cache");
      // Don't show error if we have cached tasks
      if (tasks.value.length > 0) {
        error.value = null; // Clear error to ensure list is shown
        sortTasksLocally(); // Sort the cache according to current preference
      } else {
        error.value = "Offline mode (No cached tasks)";
      }
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllTasks() {
    const auth = useAuthStore();
    if (!auth.token) return;

    loading.value = true;
    error.value = null;

    try {
      // 1. Fetch data from server (it may not have our offline created tasks)
      const fetched = await taskApi.getAllTasks(auth.token, sortOrder.value);

      // 2. Save our local Pending tasks that are not on the server
      const pendingLocalTasks = tasks.value.filter(
        (t) => t.syncStatus === "pending"
      );

      // 3. Form an array: first what came, then on top we overlay pending

      const serverTasks = fetched.map((t: Task) => ({
        ...t,
        status: t.status || (t.completed ? "completed" : "pending"),
        syncStatus: "synced", // From server always Synced
      }));

      // Use Map to merge by _id
      const tasksMap = new Map<string, Task>();

      // First put server tasks
      serverTasks.forEach((t: any) => tasksMap.set(t._id, t));

      // Then put local pending tasks (they will overwrite server tasks if id matches, or add new)
      pendingLocalTasks.forEach((t) => tasksMap.set(t._id, t));

      // Convert back to array
      tasks.value = Array.from(tasksMap.values());

      // 4. Run sync to push pending to server
      await syncPendingOps();
    } catch (e: any) {
      console.warn("Server unavailable (fetchAllTasks)", e);
      if (tasks.value.length > 0) {
        error.value = null;
        sortTasksLocally();
      } else {
        error.value = "Offline mode or Error";
      }
    } finally {
      loading.value = false;
    }
  }
  // ---------------- CREATE ----------------

  async function createTask(
    title: string,
    description: string,
    dueDate?: string
  ) {
    const auth = useAuthStore();
    if (!auth.token) return;

    const tempId = uuidv4();

    const maxOrder = tasks.value.length
      ? Math.max(...tasks.value.map((t) => t.order || 0))
      : 0;

    const tempTask: Task = {
      _id: tempId,
      title,
      description,
      completed: false,
      status: "pending",
      createBy: auth.user?._id || "",
      dueDate,
      order: maxOrder + 1,
      isTemp: true,
      syncStatus: "pending",
    };

    // Show in UI
    tasks.value.push(tempTask);

    pendingOps.value.push({
      type: "create",
      tempId,
      payload: { title, description, dueDate },
    });

    await syncPendingOps();
  }

  // ---------------- UPDATE ----------------

  async function updateTask(taskId: string, updates: Partial<Task>) {
    const auth = useAuthStore();
    if (!auth.token) return;

    const index = tasks.value.findIndex((t) => t._id === taskId);
    if (index === -1) return;

    // Optimistically update
    tasks.value[index] = {
      ...tasks.value[index],
      ...updates,
      syncStatus: "pending", // Show "Syncing..."
    };

    pendingOps.value.push({
      type: "update",
      taskId,
      payload: updates,
    });

    await syncPendingOps();
  }

  // ---------------- DELETE ----------------

  async function deleteTask(taskId: string) {
    const auth = useAuthStore();
    if (!auth.token) return;

    tasks.value = tasks.value.filter((t) => t._id !== taskId);

    pendingOps.value.push({
      type: "delete",
      taskId,
    });

    await syncPendingOps();
  }

  // ---------------- REORDER ----------------

  async function reorderTasks(updated: Task[]) {
    const auth = useAuthStore();
    if (!auth.token) return;

    tasks.value = updated;

    tasks.value = tasks.value.map((t) => ({
      ...t,
      syncStatus: "synced",
    }));

    const payload = updated.map((t, i) => ({
      _id: t._id,
      order: i + 1,
    }));

    pendingOps.value.push({
      type: "reorder",
      payload,
    });

    await syncPendingOps();
  }

  function toggleSortOrder() {
    if (sortOrder.value === "manual") sortOrder.value = "desc";
    else if (sortOrder.value === "desc") sortOrder.value = "asc";
    else sortOrder.value = "manual";
  }

  window.addEventListener("online", () => {
    syncPendingOps();
  });

  return {
    tasks,
    processing,
    error,
    sortOrder,
    syncQueue,
    loading,
    fetchTasks,
    fetchAllTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    toggleSortOrder,
    syncPendingOps,
  };
});
