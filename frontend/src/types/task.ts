export type Priority = 1 | 2 | 3; // 1: High, 2: Medium, 3: Low

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'PAUSED' | 'CANCELLED';

export type SchedulingMode = 'DEADLINE_FIRST' | 'PRIORITY_FIRST' | 'BALANCED' | 'SMART_URGENCY' | 'CUSTOM';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  categoryId?: string;
  tags?: string[];
  deadline: number; // Unix timestamp in ms
  priority: Priority;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutes: number;
  progressPercentage: number;
  dependencies?: string[]; // task IDs
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  calculatedUrgencyScore?: number;
  schedulingReason?: string;
  isArchived?: boolean;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  startedAt: number;
  isCompleted: boolean;
  notes?: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[]; // YYYY-MM-DD
  category: string;
  color?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number; // 0 - 100
  targetDate: number;
  linkedTaskIds: string[];
  description?: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: number;
  taskId?: string;
  taskTitle?: string;
  details: string;
  type: 'create' | 'complete' | 'delete' | 'schedule' | 'focus' | 'dependency' | 'mode';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  type: 'deadline' | 'overdue' | 'system' | 'recommendation' | 'achievement';
  taskId?: string;
}

export interface RecurringRule {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  priority: Priority;
  estimatedMinutes: number;
  nextOccurrence: number;
  isActive: boolean;
}

export interface DependencyEdge {
  dependentTaskId: string;
  prerequisiteTaskId: string;
}

export interface DiagnosticsData {
  status: string;
  application: string;
  engine: string;
  port: number;
  totalRegisteredTasks: number;
  activeHeapQueueSize: number;
  schedulingMode: string;
  currentTimeMs: number;
  memoryModel: string;
  cycleDetector: string;
}

export type PageId =
  | 'dashboard'
  | 'my-day'
  | 'inbox'
  | 'tasks'
  | 'scheduler'
  | 'calendar'
  | 'timeline'
  | 'recurring'
  | 'dependencies'
  | 'focus'
  | 'habits'
  | 'goals'
  | 'analytics'
  | 'reports'
  | 'activity'
  | 'heap-visualizer'
  | 'algo-playground'
  | 'simulator'
  | 'dsa-performance'
  | 'notifications'
  | 'integrations'
  | 'settings'
  | 'help'
  | 'diagnostics';
