export type Priority = 1 | 2 | 3; // 1: High, 2: Medium, 3: Low

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'PAUSED' | 'CANCELLED';

export type SchedulingMode = 'DEADLINE_FIRST' | 'PRIORITY_FIRST' | 'BALANCED' | 'SMART_URGENCY';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  categoryId?: string;
  tags: string[];
  deadline: number; // Unix timestamp in ms
  priority: Priority;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutes: number;
  progressPercentage: number;
  dependencies: string[]; // task IDs
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  calculatedUrgencyScore?: number;
  schedulingReason?: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  startedAt: number;
  isCompleted: boolean;
}

