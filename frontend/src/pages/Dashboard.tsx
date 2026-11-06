import React, { useState, useEffect, useCallback } from 'react';
import { ClientMinHeap } from '../engine/ClientMinHeap';
import { Task, SchedulingMode } from '../types/task';
import { HeapVisualizer } from '../components/HeapVisualizer';
import { Sidebar, NavTab } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import {
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Play,
  Check,
  TrendingUp,
  Trash2,
  AlertCircle,
  Calendar as CalendarIcon,
  BarChart3,
  GitBranch,
  ListTodo
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Core DSA and Task State
  const [heap] = useState(() => new ClientMinHeap('DEADLINE_FIRST'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mode, setMode] = useState<SchedulingMode>('DEADLINE_FIRST');
  const [heapArray, setHeapArray] = useState<Task[]>([]);
  const [recommendedTask, setRecommendedTask] = useState<Task | null>(null);

  // API State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick add form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<1 | 2 | 3>(2);
  const [newHoursDue, setNewHoursDue] = useState('4');

  // Focus mode quick simulation
  const [focusActive, setFocusActive] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);

  // Centralized task fetching function from real C++ Crow Backend
  const loadTasksFromBackend = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const serverTasks = await api.getTasks();
      setTasks(serverTasks);

      const nextRes = await api.getNextTask();
      if (nextRes.task) {
        setRecommendedTask(nextRes.task);
      } else {
        setRecommendedTask(null);
      }

      setBackendConnected(true);
    } catch (err: any) {
      console.error('API Error:', err);
      setApiError(err.message || 'Could not connect to C++ backend at http://localhost:8080');
      setBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load from C++ API
  useEffect(() => {
    loadTasksFromBackend();
  }, [loadTasksFromBackend]);

  // Sync client-side heap visualizer whenever tasks or mode changes
  useEffect(() => {
    heap.setMode(mode);
    const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
    heap.buildHeap(pendingTasks);
    setHeapArray(heap.getHeapArray());

    if (mode === 'DEADLINE_FIRST' && recommendedTask) {
      // Keep synchronized with C++ backend recommendation
    } else {
      setRecommendedTask(heap.getMin());
    }
  }, [tasks, mode, heap, recommendedTask]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: any = null;
    if (focusActive && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds(prev => prev - 1);
      }, 1000);
    } else if (focusSeconds === 0) {
      setFocusActive(false);
    }
    return () => clearInterval(interval);
  }, [focusActive, focusSeconds]);

  // Handle Mark Completed via C++ PATCH endpoint
  const handleComplete = async (taskId: string) => {
    try {
      await api.completeTask(taskId);
      await loadTasksFromBackend();
    } catch (err: any) {
      alert(`Error completing task: ${err.message}`);
    }
  };

  // Handle Delete via C++ DELETE endpoint
  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task from the C++ scheduler?')) return;
    try {
      await api.deleteTask(taskId);
      await loadTasksFromBackend();
    } catch (err: any) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  // Handle Quick Add Task via C++ POST endpoint
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const deadline = Date.now() + parseFloat(newHoursDue) * 3600 * 1000;
      await api.createTask({
        title: newTitle.trim(),
        description: 'Created via NEXORA Frontend connected to C++ Engine',
        priority: newPriority,
        deadline: deadline,
        estimatedMinutes: 30
      });

      setNewTitle('');
      setIsModalOpen(false);
      await loadTasksFromBackend();
    } catch (err: any) {
      alert(`Failed to add task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const highPriorityCount = tasks.filter(t => t.priority === 1 && t.status !== 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Collapsible Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        backendConnected={backendConnected}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Layout Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Sticky Navbar */}
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenQuickAdd={() => setIsModalOpen(true)}
          onRefresh={loadTasksFromBackend}
          isLoading={isLoading}
          backendConnected={backendConnected}
        />

        {/* Dynamic Views Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
          {/* Error Alert if C++ Server is unreachable */}
          {apiError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Backend Connection Issue</p>
                  <p className="text-xs text-rose-300/80">{apiError}</p>
                </div>
              </div>
              <button
                onClick={() => loadTasksFromBackend()}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs rounded-xl font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {/* VIEW 1: DASHBOARD (Active View) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Metric Cards Banner */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-mono text-slate-400 tracking-wider">Pending Queue</p>
                    <h2 className="text-2xl font-bold mt-1 text-slate-100">{pendingCount}</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Heap capacity: Active</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-slate-800/80 flex items-center justify-center text-emerald-400">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-mono text-slate-400 tracking-wider">Completed</p>
                    <h2 className="text-2xl font-bold mt-1 text-emerald-400">{completedCount}</h2>
                    <p className="text-[11px] text-emerald-500/70 mt-0.5">Verified in C++ store</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-mono text-slate-400 tracking-wider">High Priority (P1)</p>
                    <h2 className="text-2xl font-bold mt-1 text-rose-400">{highPriorityCount}</h2>
                    <p className="text-[11px] text-rose-500/70 mt-0.5">Requires immediate focus</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-mono text-slate-400 tracking-wider">Productivity Score</p>
                    <h2 className="text-2xl font-bold mt-1 text-teal-300">
                      {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}%` : '100%'}
                    </h2>
                    <p className="text-[11px] text-teal-400/70 mt-0.5">Calculated from live tasks</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-teal-950/40 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </section>

              {/* Next Recommended Task Spotlight */}
              <section className="glass-panel-glow p-6 md:p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> NEXT RECOMMENDED TASK (C++ Min-Heap Root)
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Mode: {mode.replace('_', ' ')}
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="py-4 text-slate-400 animate-pulse">
                        Querying C++ Min-Heap engine for next task...
                      </div>
                    ) : recommendedTask ? (
                      <>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                          {recommendedTask.title}
                        </h1>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {recommendedTask.description || 'No description provided'}
                        </p>
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-emerald-300 flex items-center gap-2">
                          <span className="font-semibold text-slate-400">Algorithmic Explanation:</span>
                          <span>{recommendedTask.schedulingReason || 'Recommended by C++ Min-Heap comparator'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-slate-400">
                        All tasks completed! You own your time. Add more tasks to schedule with the Min-Heap.
                      </div>
                    )}
                  </div>

                  {recommendedTask && (
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleComplete(recommendedTask.id)}
                        className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Check className="w-5 h-5" /> Complete Task
                      </button>
                      <button
                        onClick={() => setFocusActive(!focusActive)}
                        className="flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium px-6 py-3 rounded-xl transition-all border border-slate-700"
                      >
                        <Play className="w-4 h-4 text-emerald-400" />
                        {focusActive ? 'Pause Pomodoro' : 'Start Focus (25m)'}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Live Min-Heap Visualizer */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-400" /> DSA Scheduling Core
                    </h2>
                    <p className="text-xs text-slate-400">
                      Visualizing live contiguous vector heap state from active tasks.
                    </p>
                  </div>

                  {/* Algorithm Mode Switcher */}
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
                    {(['DEADLINE_FIRST', 'PRIORITY_FIRST', 'SMART_URGENCY', 'BALANCED'] as SchedulingMode[]).map(m => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          mode === m
                            ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <HeapVisualizer heapArray={heapArray} />
              </section>

              {/* Task Management Table */}
              <section className="glass-panel rounded-2xl overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Live Backend Task Store ({tasks.length} tasks)
                  </h3>
                  <span className="text-xs font-mono text-emerald-400">Synchronized with C++ Engine</span>
                </div>

                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading tasks from C++ backend...</div>
                ) : tasks.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    No tasks found in the C++ engine. Click "Quick Add Task" to schedule your first item!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {tasks.map(task => {
                      const isCompleted = task.status === 'COMPLETED';
                      return (
                        <div
                          key={task.id}
                          className={`py-3.5 flex items-center justify-between gap-4 transition-all ${
                            isCompleted ? 'opacity-40 line-through' : 'hover:bg-slate-800/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleComplete(task.id)}
                              disabled={isCompleted}
                              title={isCompleted ? 'Completed' : 'Mark Complete'}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950 cursor-default'
                                  : 'border-slate-700 hover:border-emerald-500'
                              }`}
                            >
                              {isCompleted && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{task.title}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                Due: {new Date(task.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              task.priority === 1 ? 'bg-rose-500/20 text-rose-300' :
                              task.priority === 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              Priority {task.priority}
                            </span>
                            <button
                              onClick={() => handleDelete(task.id)}
                              title="Delete task from C++ backend"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* VIEW 2: TASK MANAGER */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ListTodo className="w-6 h-6 text-emerald-400" /> Task Management
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage all your tasks directly stored in the C++ scheduling repository.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-xl"
                >
                  Create Task
                </button>
              </div>

              {/* Task list container */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
                  <span>TASK TITLE & DEADLINE</span>
                  <span>PRIORITY & ACTIONS</span>
                </div>
                {tasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">No tasks currently registered.</div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {tasks.map(task => {
                      const isCompleted = task.status === 'COMPLETED';
                      return (
                        <div key={task.id} className="py-4 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                isCompleted ? 'bg-slate-600' : task.priority === 1 ? 'bg-rose-500' : task.priority === 2 ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              <span className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {task.title}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Due: {new Date(task.deadline).toLocaleString()} | ID: <span className="font-mono text-slate-500">{task.id}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              P{task.priority}
                            </span>
                            {!isCompleted && (
                              <button
                                onClick={() => handleComplete(task.id)}
                                className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg hover:bg-emerald-500/30"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-emerald-400" /> Deadline Calendar
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Chronological schedule overview computed by deadline timestamps.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map(task => (
                    <div key={task.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          task.priority === 1 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          Priority {task.priority}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100">{task.title}</h4>
                      <p className="text-xs text-slate-400">
                        Target Time: {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: DSA EXPLORER */}
          {activeTab === 'dsa' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-6 h-6 text-emerald-400" /> Custom Min-Heap Algorithm Explorer
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  In-depth architectural inspection of zero-based vector tree invariants and tie-breaker sorting.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-400">Active Comparator Algorithm:</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">{mode.replace('_', ' ')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['DEADLINE_FIRST', 'PRIORITY_FIRST', 'SMART_URGENCY', 'BALANCED'] as SchedulingMode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        mode === m
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <HeapVisualizer heapArray={heapArray} />
            </div>
          )}

          {/* VIEW 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-emerald-400" /> Productivity Analytics
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time workload metrics computed directly from active C++ task records.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl space-y-2">
                  <span className="text-xs font-mono text-slate-400">Total Tasks Registered</span>
                  <p className="text-3xl font-extrabold text-white">{tasks.length}</p>
                  <p className="text-[11px] text-slate-500">Stored in C++ memory</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl space-y-2">
                  <span className="text-xs font-mono text-slate-400">Completed Rate</span>
                  <p className="text-3xl font-extrabold text-emerald-400">
                    {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}%` : '100%'}
                  </p>
                  <p className="text-[11px] text-emerald-500/70">{completedCount} tasks marked done</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl space-y-2">
                  <span className="text-xs font-mono text-slate-400">Active High Priority</span>
                  <p className="text-3xl font-extrabold text-rose-400">{highPriorityCount}</p>
                  <p className="text-[11px] text-rose-500/70">Top of heap attention</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Quick Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-[#111827] p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add Task to C++ Scheduling Engine</h3>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Finalize API Architecture"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>High (P1)</option>
                    <option value={2}>Medium (P2)</option>
                    <option value={3}>Low (P3)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Due In (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={newHoursDue}
                    onChange={e => setNewHoursDue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Inserting into Min-Heap...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Pomodoro Widget if Active */}
      {focusActive && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel-glow bg-[#111827] p-4 rounded-2xl border border-emerald-500/40 shadow-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
            {Math.floor(focusSeconds / 60)}:{('0' + (focusSeconds % 60)).slice(-2)}
          </div>
          <div>
            <span className="text-xs font-semibold text-white block">Focus Mode Running</span>
            <span className="text-[11px] text-slate-400">{recommendedTask?.title || 'Active Session'}</span>
          </div>
          <button
            onClick={() => setFocusActive(false)}
            className="text-xs text-slate-400 hover:text-rose-400 ml-2"
          >
            End
          </button>
        </div>
      )}
    </div>
  );
};
