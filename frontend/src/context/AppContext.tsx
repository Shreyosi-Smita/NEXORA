import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Task,
  PageId,
  SchedulingMode,
  Habit,
  Goal,
  ActivityItem,
  NotificationItem,
  RecurringRule,
  DependencyEdge,
  DiagnosticsData,
  FocusSession
} from '../types/task';
import { api, SchedulerNextResponse } from '../services/api';
import { ClientMinHeap } from '../engine/ClientMinHeap';

interface AppContextType {
  // Navigation
  viewMode: 'landing' | 'app';
  setViewMode: (mode: 'landing' | 'app') => void;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Global State
  tasks: Task[];
  recommendedTask: Task | null;
  recommendedExplanation: string;
  schedulingMode: SchedulingMode;
  setSchedulingMode: (mode: SchedulingMode) => Promise<void>;
  dependencies: DependencyEdge[];
  topologicalOrder: string[];
  hasDependencyCycle: boolean;

  // Auxiliary Modules
  habits: Habit[];
  goals: Goal[];
  focusSessions: FocusSession[];
  activityLog: ActivityItem[];
  notifications: NotificationItem[];
  recurringRules: RecurringRule[];
  diagnostics: DiagnosticsData | null;

  // Actions
  loadAllData: () => Promise<void>;
  createTask: (taskData: {
    title: string;
    description?: string;
    priority: number;
    deadline?: number;
    estimatedMinutes?: number;
    categoryId?: string;
  }) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addDependency: (dependentTaskId: string, prerequisiteTaskId: string) => Promise<boolean>;
  removeDependency: (dependentTaskId: string, prerequisiteTaskId: string) => Promise<void>;

  // Habit & Goal Actions
  toggleHabitToday: (habitId: string) => void;
  createHabit: (title: string, category: string, frequency?: 'daily' | 'weekly') => void;
  createGoal: (title: string, category: string, targetDays?: number) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;

  // Focus & Notifications
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  toggleRecurringRule: (id: string) => void;

  // Modals & Drawers
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;

  // Search & Filter
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // UI / Status
  isLoading: boolean;
  apiError: string | null;
  backendStatus: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Seed for auxiliary features to give an instant, rich SaaS feel
const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Review Min Heap Scheduling Invariants',
    frequency: 'daily',
    streak: 6,
    completedDates: ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'],
    category: 'Engineering',
    color: '#6D9BCB',
  },
  {
    id: 'habit-2',
    title: 'Daily Deep Work Session (90 min)',
    frequency: 'daily',
    streak: 12,
    completedDates: ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'],
    category: 'Focus',
    color: '#35D6A1',
  },
  {
    id: 'habit-3',
    title: 'Code Review & PR Audit',
    frequency: 'daily',
    streak: 4,
    completedDates: ['2026-11-03', '2026-11-04', '2026-11-05'],
    category: 'Architecture',
    color: '#FFBC69',
  },
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Deliver NEXORA 2.0 Titanium Platform',
    category: 'Product Release',
    progress: 85,
    targetDate: Date.now() + 86400000 * 5,
    linkedTaskIds: ['task-101'],
    description: 'Complete core C++ DSA integration and Titanium Blue UI redesign.',
  },
  {
    id: 'goal-2',
    title: 'Zero Latency Scheduling SLA (<5ms)',
    category: 'Performance',
    progress: 95,
    targetDate: Date.now() + 86400000 * 14,
    linkedTaskIds: ['task-102'],
    description: 'Optimize Min Heap binary heapify and DAG topological sorting routines.',
  },
  {
    id: 'goal-3',
    title: '99% On-Time Task Execution Rate',
    category: 'Productivity',
    progress: 72,
    targetDate: Date.now() + 86400000 * 30,
    linkedTaskIds: [],
    description: 'Enforce smart urgency scoring across all team sprints.',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'C++ Scheduling Engine Active',
    message: 'NEXORA C++ Min Heap is online and computing optimal task priority.',
    timestamp: Date.now() - 1000 * 60 * 15,
    isRead: false,
    type: 'system',
  },
  {
    id: 'notif-2',
    title: 'High Priority Task Approaching',
    message: 'Deploy Production Hotfix is scheduled within your next working window.',
    timestamp: Date.now() - 1000 * 60 * 45,
    isRead: false,
    type: 'deadline',
  },
  {
    id: 'notif-3',
    title: 'Algorithm Optimization Notice',
    message: 'Deadline-First scheduling algorithm selected as active heap comparator.',
    timestamp: Date.now() - 1000 * 60 * 120,
    isRead: true,
    type: 'recommendation',
  },
];

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'task-101',
    userId: 'user_default',
    title: 'Deploy Production Hotfix',
    description: 'Resolve high priority security patch and restart container instances.',
    priority: 1,
    status: 'IN_PROGRESS',
    deadline: Date.now() + 1000 * 60 * 90,
    estimatedMinutes: 30,
    actualMinutes: 15,
    progressPercentage: 50,
    categoryId: 'Engineering',
    tags: ['Critical', 'Backend', 'Security'],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
    dependencies: [],
  },
  {
    id: 'task-102',
    userId: 'user_default',
    title: 'Prepare DSA Lecture Slides',
    description: 'Design binary heap diagrams and asymptotic recurrence trees.',
    priority: 2,
    status: 'PENDING',
    deadline: Date.now() + 1000 * 60 * 60 * 4,
    estimatedMinutes: 45,
    actualMinutes: 0,
    progressPercentage: 0,
    categoryId: 'Education',
    tags: ['Slides', 'MinHeap'],
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    dependencies: [],
  },
  {
    id: 'task-103',
    userId: 'user_default',
    title: 'Audit Heapify Invariants',
    description: 'Verify parent <= children ordering property across all priority modes.',
    priority: 1,
    status: 'PENDING',
    deadline: Date.now() + 1000 * 60 * 60 * 8,
    estimatedMinutes: 60,
    actualMinutes: 0,
    progressPercentage: 0,
    categoryId: 'Testing',
    tags: ['DSA', 'Verification'],
    createdAt: Date.now() - 10800000,
    updatedAt: Date.now() - 10800000,
    dependencies: ['task-101'],
  },
  {
    id: 'task-104',
    userId: 'user_default',
    title: 'Optimize REST Endpoint Serialization',
    description: 'Benchmark JSON parsing routines against binary memory buffers.',
    priority: 3,
    status: 'COMPLETED',
    deadline: Date.now() - 1000 * 60 * 60 * 2,
    estimatedMinutes: 40,
    actualMinutes: 35,
    progressPercentage: 100,
    categoryId: 'Architecture',
    tags: ['Performance'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 7200000,
    completedAt: Date.now() - 7200000,
    dependencies: [],
  },
  {
    id: 'task-105',
    userId: 'user_default',
    title: 'Sync Topological Sorter with DAG',
    description: 'Detect dependency graph cycle hazards before task execution.',
    priority: 2,
    status: 'PENDING',
    deadline: Date.now() + 1000 * 60 * 60 * 24,
    estimatedMinutes: 50,
    actualMinutes: 0,
    progressPercentage: 0,
    categoryId: 'Engineering',
    tags: ['Graph', 'DAG'],
    createdAt: Date.now() - 14400000,
    updatedAt: Date.now() - 14400000,
    dependencies: ['task-102'],
  }
];

const INITIAL_RECURRING: RecurringRule[] = [
  {
    id: 'rec-1',
    title: 'Daily Standup & Heap Rebalance',
    frequency: 'daily',
    interval: 1,
    priority: 2,
    estimatedMinutes: 20,
    nextOccurrence: Date.now() + 86400000,
    isActive: true,
  },
  {
    id: 'rec-2',
    title: 'Weekly Sprint Backlog Triage',
    frequency: 'weekly',
    interval: 1,
    priority: 1,
    estimatedMinutes: 45,
    nextOccurrence: Date.now() + 86400000 * 3,
    isActive: true,
  },
  {
    id: 'rec-3',
    title: 'Monthly DSA Complexity & Memory Audit',
    frequency: 'monthly',
    interval: 1,
    priority: 2,
    estimatedMinutes: 60,
    nextOccurrence: Date.now() + 86400000 * 20,
    isActive: false,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Core C++ State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recommendedTask, setRecommendedTask] = useState<Task | null>(null);
  const [recommendedExplanation, setRecommendedExplanation] = useState<string>('');
  const [schedulingMode, setModeState] = useState<SchedulingMode>('DEADLINE_FIRST');
  const [dependencies, setDependencies] = useState<DependencyEdge[]>([]);
  const [topologicalOrder, setTopologicalOrder] = useState<string[]>([]);
  const [hasDependencyCycle, setHasDependencyCycle] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);

  // Auxiliary Modules
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('nexora_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('nexora_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('nexora_focus_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activityLog, setActivityLog] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('nexora_activity_log');
    return saved ? JSON.parse(saved) : [
      {
        id: 'act-init',
        action: 'System Initialized',
        timestamp: Date.now() - 3600000,
        details: 'Connected to C++ REST Engine at port 8081',
        type: 'mode'
      }
    ];
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>(INITIAL_RECURRING);

  // Modals & UI
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // Status
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState('Connecting to C++ Engine...');

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  // Save auxiliary modules to localStorage
  useEffect(() => {
    localStorage.setItem('nexora_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('nexora_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('nexora_focus_sessions', JSON.stringify(focusSessions));
  }, [focusSessions]);

  useEffect(() => {
    localStorage.setItem('nexora_activity_log', JSON.stringify(activityLog));
  }, [activityLog]);

  // Log an activity event
  const logActivity = (action: string, details: string, type: ActivityItem['type'], taskId?: string, taskTitle?: string) => {
    const item: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      timestamp: Date.now(),
      details,
      type,
      taskId,
      taskTitle
    };
    setActivityLog(prev => [item, ...prev].slice(0, 100));
  };

  // Helper for computing client-side heap and schedule when running standalone on Vercel / offline
  const computeClientHeapState = useCallback((currentTasks: Task[], mode: SchedulingMode) => {
    const heap = new ClientMinHeap(mode);
    const activeTasks = currentTasks.filter(t => t.status !== 'COMPLETED' && !t.isArchived);
    activeTasks.forEach(t => heap.insert(t));
    const nextTask = heap.getMin();

    const explanations: Record<SchedulingMode, string> = {
      DEADLINE_FIRST: 'Selected by earliest timestamp deadline at the Min Heap root.',
      PRIORITY_FIRST: 'Selected by highest priority tier (P1 > P2 > P3).',
      SMART_URGENCY: 'Selected by highest urgency score balancing deadline proximity and duration.',
      BALANCED: 'Selected by balanced weighting of priority, duration, and deadline.',
      CUSTOM: 'Evaluated under custom scheduling parameter weights.'
    };

    return {
      recommendedTask: nextTask,
      recommendedExplanation: nextTask ? explanations[mode] : 'No active tasks in queue.',
    };
  }, []);

  // Centralized data loader from C++ backend with client-side fallback for Vercel
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Parallel fetch from C++ API
      const [health, serverTasks, nextRes, depRes, diagRes] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getTasks().catch(() => null),
        api.getNextTask().catch(() => null),
        api.getDependencies().catch(() => null),
        api.getDiagnostics().catch(() => null),
      ]);

      if (health && serverTasks && serverTasks.length >= 0) {
        // Connected to live C++ backend
        setTasks(serverTasks);
        setRecommendedTask(nextRes?.task || null);
        setRecommendedExplanation(nextRes?.explanation || '');
        setDependencies(depRes?.edges || []);
        setTopologicalOrder(depRes?.topologicalOrder || []);
        setHasDependencyCycle(depRes?.hasCycle || false);
        setDiagnostics(diagRes);
        setBackendStatus(`C++ Engine Active (Port ${health.port})`);
      } else {
        // Running standalone on Vercel or local C++ server offline: fallback to Client Min-Heap
        const saved = localStorage.getItem('nexora_local_tasks');
        const fallbackTasks: Task[] = saved ? JSON.parse(saved) : INITIAL_DEMO_TASKS;
        if (!saved) {
          localStorage.setItem('nexora_local_tasks', JSON.stringify(INITIAL_DEMO_TASKS));
        }
        setTasks(fallbackTasks);

        const { recommendedTask: recTask, recommendedExplanation: recExp } = computeClientHeapState(fallbackTasks, schedulingMode);
        setRecommendedTask(recTask);
        setRecommendedExplanation(recExp);

        // Client-side dependency graph
        const edges: DependencyEdge[] = [];
        fallbackTasks.forEach(t => {
          (t.dependencies || []).forEach(depId => {
            edges.push({ dependentTaskId: t.id, prerequisiteTaskId: depId });
          });
        });
        setDependencies(edges);
        setTopologicalOrder(fallbackTasks.map(t => t.id));
        setHasDependencyCycle(false);
        setBackendStatus('Client DSA Engine Active (Browser Min-Heap)');
      }
    } catch (err: any) {
      console.warn('Backend connection notice, running client heap fallback:', err);
      const saved = localStorage.getItem('nexora_local_tasks');
      const fallbackTasks: Task[] = saved ? JSON.parse(saved) : INITIAL_DEMO_TASKS;
      setTasks(fallbackTasks);
      const { recommendedTask: recTask, recommendedExplanation: recExp } = computeClientHeapState(fallbackTasks, schedulingMode);
      setRecommendedTask(recTask);
      setRecommendedExplanation(recExp);
      setBackendStatus('Client DSA Engine Active (Standalone Mode)');
    } finally {
      setIsLoading(false);
    }
  }, [computeClientHeapState, schedulingMode]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mode changer
  const handleSetSchedulingMode = async (mode: SchedulingMode) => {
    setModeState(mode);
    try {
      await api.setSchedulingMode(mode);
      logActivity('Mode Changed', `Switched scheduler to ${mode.replace('_', ' ')} mode`, 'mode');
      await loadAllData();
    } catch {
      // Offline fallback
      logActivity('Mode Changed', `Switched client scheduler to ${mode.replace('_', ' ')} mode`, 'mode');
      const { recommendedTask: recTask, recommendedExplanation: recExp } = computeClientHeapState(tasks, mode);
      setRecommendedTask(recTask);
      setRecommendedExplanation(recExp);
    }
  };

  // Create Task
  const handleCreateTask = async (taskData: {
    title: string;
    description?: string;
    priority: number;
    deadline?: number;
    estimatedMinutes?: number;
    categoryId?: string;
  }): Promise<Task | null> => {
    try {
      const res = await api.createTask(taskData);
      logActivity('Task Created', `Created task "${res.task.title}" in C++ Min Heap`, 'create', res.task.id, res.task.title);
      await loadAllData();
      return res.task;
    } catch {
      // Offline / Vercel fallback
      const priorityVal = (taskData.priority === 1 || taskData.priority === 2 || taskData.priority === 3) ? taskData.priority : 2;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        userId: 'user_default',
        title: taskData.title,
        description: taskData.description || '',
        priority: priorityVal,
        deadline: taskData.deadline || Date.now() + 86400000,
        estimatedMinutes: taskData.estimatedMinutes || 30,
        actualMinutes: 0,
        progressPercentage: 0,
        status: 'PENDING',
        categoryId: taskData.categoryId || 'General',
        tags: ['New'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        dependencies: [],
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem('nexora_local_tasks', JSON.stringify(updated));
      const { recommendedTask: recTask, recommendedExplanation: recExp } = computeClientHeapState(updated, schedulingMode);
      setRecommendedTask(recTask);
      setRecommendedExplanation(recExp);
      logActivity('Task Created', `Created task "${newTask.title}" in Client Min Heap`, 'create', newTask.id, newTask.title);
      return newTask;
    }
  };

  // Update Task
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await api.updateTask(taskId, updates);
      logActivity('Task Updated', `Updated metadata for task ID: ${taskId}`, 'schedule', taskId);
      await loadAllData();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch {
      // Offline / Vercel fallback
      const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      setTasks(updated);
      localStorage.setItem('nexora_local_tasks', JSON.stringify(updated));
      const { recommendedTask: recTask, recommendedExplanation: recExp } = computeClientHeapState(updated, schedulingMode);
      setRecommendedTask(recTask);
      setRecommendedExplanation(recExp);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
      }
      logActivity('Task Updated', `Updated task metadata (Client Mode)`, 'schedule', taskId);
    }
  };

  // Complete Task
  const handleCompleteTask = async (taskId: string) => {
    try {
      const t = tasks.find(item => item.id === taskId);
      await api.completeTask(taskId);
      logActivity('Task Completed', `Completed task "${t ? t.title : taskId}"`, 'complete', taskId, t?.title);
      await loadAllData();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    } catch {
      // Offline / Vercel fallback
      const t = tasks.find(item => item.id === taskId);
      const updated = tasks.map(item => item.id === taskId ? { ...item, status: 'COMPLETED' as const, completedAt: Date.now() } : item);
      setTasks(updated);
      localStorage.setItem('nexora_local_tasks', JSON.stringify(updated));
      const { recommendedTask: recTask, recommendedExplanation: recExp } = computeClientHeapState(updated, schedulingMode);
      setRecommendedTask(recTask);
      setRecommendedExplanation(recExp);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
      logActivity('Task Completed', `Completed task "${t ? t.title : taskId}"`, 'complete', taskId, t?.title);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task permanently from the Min-Heap engine?')) return;
    try {
      const t = tasks.find(item => item.id === taskId);
      await api.deleteTask(taskId);
      logActivity('Task Deleted', `Removed task "${t ? t.title : taskId}" from scheduling queue`, 'delete', taskId);
      await loadAllData();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    } catch {
      // Offline / Vercel fallback
      const t = tasks.find(item => item.id === taskId);
      const updated = tasks.filter(item => item.id !== taskId);
      setTasks(updated);
      localStorage.setItem('nexora_local_tasks', JSON.stringify(updated));
      const { recommendedTask: recTask, recommendedExplanation: recExp } = computeClientHeapState(updated, schedulingMode);
      setRecommendedTask(recTask);
      setRecommendedExplanation(recExp);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
      logActivity('Task Deleted', `Removed task "${t ? t.title : taskId}" from scheduling queue`, 'delete', taskId);
    }
  };

  // Add Dependency
  const handleAddDependency = async (dependentTaskId: string, prerequisiteTaskId: string): Promise<boolean> => {
    try {
      await api.addDependency(dependentTaskId, prerequisiteTaskId);
      logActivity('Dependency Added', `Task ${dependentTaskId} now depends on ${prerequisiteTaskId}`, 'dependency');
      await loadAllData();
      return true;
    } catch {
      // Offline fallback
      setDependencies(prev => [...prev, { dependentTaskId, prerequisiteTaskId }]);
      logActivity('Dependency Added', `Task ${dependentTaskId} now depends on ${prerequisiteTaskId}`, 'dependency');
      return true;
    }
  };

  // Remove Dependency
  const handleRemoveDependency = async (dependentTaskId: string, prerequisiteTaskId: string) => {
    try {
      await api.removeDependency(dependentTaskId, prerequisiteTaskId);
      logActivity('Dependency Removed', `Removed constraint between ${dependentTaskId} and ${prerequisiteTaskId}`, 'dependency');
      await loadAllData();
    } catch {
      // Offline fallback
      setDependencies(prev => prev.filter(d => !(d.dependentTaskId === dependentTaskId && d.prerequisiteTaskId === prerequisiteTaskId)));
      logActivity('Dependency Removed', `Removed constraint between ${dependentTaskId} and ${prerequisiteTaskId}`, 'dependency');
    }
  };

  // Habits
  const toggleHabitToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        const hasCompleted = h.completedDates.includes(today);
        const newDates = hasCompleted
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today];
        const newStreak = hasCompleted ? Math.max(0, h.streak - 1) : h.streak + 1;
        return { ...h, completedDates: newDates, streak: newStreak };
      })
    );
  };

  const createHabit = (title: string, category: string, frequency: 'daily' | 'weekly' = 'daily') => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title,
      category,
      frequency,
      streak: 0,
      completedDates: [],
      color: '#6D9BCB'
    };
    setHabits(prev => [...prev, newHabit]);
    logActivity('Habit Created', `Created habit: "${title}"`, 'focus');
  };

  // Goals
  const createGoal = (title: string, category: string, targetDays: number = 30) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title,
      category,
      progress: 0,
      targetDate: Date.now() + 86400000 * targetDays,
      linkedTaskIds: [],
    };
    setGoals(prev => [...prev, newGoal]);
    logActivity('Goal Created', `Created target goal: "${title}"`, 'schedule');
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress: Math.min(100, Math.max(0, progress)) } : g));
  };

  // Focus
  const addFocusSession = (session: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...session,
      id: `session-${Date.now()}`
    };
    setFocusSessions(prev => [newSession, ...prev]);
    logActivity('Focus Completed', `Logged ${session.durationMinutes} min focus session`, 'focus', session.taskId, session.taskTitle);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Recurring
  const toggleRecurringRule = (id: string) => {
    setRecurringRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        currentPage,
        setCurrentPage,
        isSidebarCollapsed,
        toggleSidebar,
        tasks,
        recommendedTask,
        recommendedExplanation,
        schedulingMode,
        setSchedulingMode: handleSetSchedulingMode,
        dependencies,
        topologicalOrder,
        hasDependencyCycle,
        habits,
        goals,
        focusSessions,
        activityLog,
        notifications,
        recurringRules,
        diagnostics,
        loadAllData,
        createTask: handleCreateTask,
        updateTask: handleUpdateTask,
        completeTask: handleCompleteTask,
        deleteTask: handleDeleteTask,
        addDependency: handleAddDependency,
        removeDependency: handleRemoveDependency,
        toggleHabitToday,
        createHabit,
        createGoal,
        updateGoalProgress,
        addFocusSession,
        markNotificationAsRead,
        clearNotifications,
        toggleRecurringRule,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        selectedTask,
        setSelectedTask,
        globalSearch,
        setGlobalSearch,
        isLoading,
        apiError,
        backendStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
