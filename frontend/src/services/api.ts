import { Task } from '../types/task';

const API_BASE = 'http://localhost:8080/api/v1';

export interface SchedulerNextResponse {
  task: Task | null;
  algorithmMode?: string;
  explanation?: string;
  message?: string;
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
    id?: string;
  }): Promise<{ message: string; task: Task }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Failed to create task: HTTP ${res.status}`);
    }

    return res.json();
  },

  // 5. PATCH mark task completed
  async completeTask(taskId: string): Promise<{ message: string; task: Task }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      throw new Error(`Failed to complete task: HTTP ${res.status}`);
    }

    return res.json();
  },

  // 6. DELETE task from C++ Engine
  async deleteTask(taskId: string): Promise<{ message: string; taskId: string }> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete task: HTTP ${res.status}`);
    }

    return res.json();
  },
};

