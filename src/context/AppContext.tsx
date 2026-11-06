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

  // Centralized data loader from C++ backend
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Parallel fetch from C++ API
      const [health, serverTasks, nextRes, depRes, diagRes] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getTasks().catch(() => []),
        api.getNextTask().catch(() => ({ task: null, explanation: '' } as SchedulerNextResponse)),
        api.getDependencies().catch(() => ({ hasCycle: false, edges: [], topologicalOrder: [] })),
        api.getDiagnostics().catch(() => null),
      ]);

      setTasks(serverTasks);
      setRecommendedTask(nextRes.task);
      setRecommendedExplanation(nextRes.explanation || '');
      setDependencies(depRes.edges || []);
      setTopologicalOrder(depRes.topologicalOrder || []);
      setHasDependencyCycle(depRes.hasCycle || false);
      setDiagnostics(diagRes);

      if (health) {
        setBackendStatus(`C++ Engine Active (Port ${health.port})`);
      } else {
        setBackendStatus('C++ Engine Offline');
      }
    } catch (err: any) {
      console.error('Error fetching backend data:', err);
      setApiError(err.message || 'Could not connect to C++ backend');
      setBackendStatus('Backend Disconnected');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    try {
      await api.setSchedulingMode(mode);
      setModeState(mode);
      logActivity('Mode Changed', `Switched scheduler to ${mode.replace('_', ' ')} mode`, 'mode');
      await loadAllData();
    } catch (err: any) {
      alert(`Failed to set mode: ${err.message}`);
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
    } catch (err: any) {
      alert(`Error creating task: ${err.message}`);
      return null;
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
    } catch (err: any) {
      alert(`Error updating task: ${err.message}`);
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
    } catch (err: any) {
      alert(`Error completing task: ${err.message}`);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task permanently from the C++ Min-Heap engine?')) return;
    try {
      const t = tasks.find(item => item.id === taskId);
      await api.deleteTask(taskId);
      logActivity('Task Deleted', `Removed task "${t ? t.title : taskId}" from scheduling queue`, 'delete', taskId);
      await loadAllData();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    } catch (err: any) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  // Add Dependency
  const handleAddDependency = async (dependentTaskId: string, prerequisiteTaskId: string): Promise<boolean> => {
    try {
      await api.addDependency(dependentTaskId, prerequisiteTaskId);
      logActivity('Dependency Added', `Task ${dependentTaskId} now depends on ${prerequisiteTaskId}`, 'dependency');
      await loadAllData();
      return true;
    } catch (err: any) {
      alert(`Cycle or Dependency Error: ${err.message}`);
      return false;
    }
  };

  // Remove Dependency
  const handleRemoveDependency = async (dependentTaskId: string, prerequisiteTaskId: string) => {
    try {
      await api.removeDependency(dependentTaskId, prerequisiteTaskId);
      logActivity('Dependency Removed', `Removed constraint between ${dependentTaskId} and ${prerequisiteTaskId}`, 'dependency');
      await loadAllData();
    } catch (err: any) {
      alert(`Error removing dependency: ${err.message}`);
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
