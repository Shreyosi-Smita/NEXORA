import { Task, SchedulingMode, DiagnosticsData, DependencyEdge } from '../types/task';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || 'http://localhost:8081/api/v1';

export interface SchedulerNextResponse {
  task: Task | null;
  algorithmMode?: string;
  explanation?: string;
  message?: string;
}

export interface DependenciesResponse {
  hasCycle: boolean;
  edges: DependencyEdge[];
  topologicalOrder: string[];
}

export interface HeapResponse {
  mode: string;
  heapSize: number;
  tasks: Task[];
}

export const api = {
  // 1. Health check
  async getHealth(): Promise<{ status: string; application: string; backend: string; port: number; activeQueueSize: number }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`);
    return res.json();
  },

  // 2. GET all tasks from C++ Engine
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error(`Failed to fetch tasks: HTTP ${res.status}`);
    return res.json();
  },

  // 3. GET next recommended task from C++ Min Heap
  async getNextTask(): Promise<SchedulerNextResponse> {
    const res = await fetch(`${API_BASE}/scheduler/next`);
    if (!res.ok) throw new Error(`Failed to fetch next task: HTTP ${res.status}`);
    return res.json();
  },

  // 4. POST create a new task into C++ Min Heap
  async createTask(taskData: {
    title: string;
    description?: string;
    priority: number;
    deadline?: number;
    estimatedMinutes?: number;
    categoryId?: string;
    id?: string;
  }): Promise<{ message: string; task: Task }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Failed to create task: HTTP ${res.status}`);
    }

    return res.json();
  },

  // 5. PUT / PATCH update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ message: string; task: Task }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error(`Failed to update task: HTTP ${res.status}`);
    }

    return res.json();
  },

  // 6. PATCH mark task completed
  async completeTask(taskId: string): Promise<{ message: string; task: Task }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      throw new Error(`Failed to complete task: HTTP ${res.status}`);
    }

    return res.json();
  },

  // 7. DELETE task from C++ Engine
  async deleteTask(taskId: string): Promise<{ message: string; taskId: string }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete task: HTTP ${res.status}`);
    }

    return res.json();
  },

  // 8. POST switch C++ scheduling mode
  async setSchedulingMode(mode: SchedulingMode): Promise<{ message: string; mode: string; activeQueueSize: number }> {
    const res = await fetch(`${API_BASE}/scheduler/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });

    if (!res.ok) {
      throw new Error(`Failed to change scheduling mode: HTTP ${res.status}`);
    }

    return res.json();
  },

  // 9. GET raw heap array from C++ MinHeap
  async getHeap(): Promise<HeapResponse> {
    const res = await fetch(`${API_BASE}/scheduler/heap`);
    if (!res.ok) throw new Error(`Failed to fetch heap array: HTTP ${res.status}`);
    return res.json();
  },

  // 10. GET dependencies & topological order from C++ DAG
  async getDependencies(): Promise<DependenciesResponse> {
    const res = await fetch(`${API_BASE}/dependencies`);
    if (!res.ok) throw new Error(`Failed to fetch dependencies: HTTP ${res.status}`);
    return res.json();
  },

  // 11. POST add dependency edge with cycle detection
  async addDependency(dependentTaskId: string, prerequisiteTaskId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/dependencies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dependentTaskId, prerequisiteTaskId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Dependency error: HTTP ${res.status}`);
    }

    return res.json();
  },

  // 12. DELETE dependency edge
  async removeDependency(dependentTaskId: string, prerequisiteTaskId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/dependencies`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dependentTaskId, prerequisiteTaskId }),
    });

    if (!res.ok) throw new Error(`Failed to remove dependency: HTTP ${res.status}`);
    return res.json();
  },

  // 13. GET system diagnostics
  async getDiagnostics(): Promise<DiagnosticsData> {
    const res = await fetch(`${API_BASE}/system/diagnostics`);
    if (!res.ok) throw new Error(`Diagnostics check failed: HTTP ${res.status}`);
    return res.json();
  },
};
