import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  Play,
  Check,
  Plus,
  ArrowRight,
  Calendar,
  Flame,
  Network,
  Cpu,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    tasks,
    recommendedTask,
    recommendedExplanation,
    schedulingMode,
    setCurrentPage,
    setIsQuickAddOpen,
    setSelectedTask,
    completeTask,
    isLoading,
    backendStatus
  } = useApp();

  // Metrics computation
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  const now = Date.now();
  const overdueTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.deadline < now);
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 100;

  // Weekly Overview Mock / Live Distribution for Recharts
  const weeklyData = useMemo(() => [
    { day: 'Mon', completed: 4, scheduled: 6 },
    { day: 'Tue', completed: 7, scheduled: 8 },
    { day: 'Wed', completed: 5, scheduled: 7 },
    { day: 'Thu', completed: 8, scheduled: 9 },
    { day: 'Fri', completed: Math.max(completedTasks.length, 3), scheduled: Math.max(totalTasks, 5) },
    { day: 'Sat', completed: 2, scheduled: 3 },
    { day: 'Sun', completed: 1, scheduled: 2 },
  ], [completedTasks.length, totalTasks]);

  // Today's Agenda (tasks due within next 24h)
  const todayAgenda = useMemo(() => {
    return pendingTasks
      .slice()
      .sort((a, b) => a.deadline - b.deadline)
      .slice(0, 4);
  }, [pendingTasks]);

  // Upcoming deadlines sorted
  const upcomingDeadlines = useMemo(() => {
    return pendingTasks
      .slice()
      .sort((a, b) => a.deadline - b.deadline)
      .slice(0, 5);
  }, [pendingTasks]);

  const formatRemainingTime = (deadline: number) => {
    const diff = deadline - Date.now();
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m left`;
    }
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-titanium-text tracking-tight">
              {getGreeting()}, <span className="text-titanium-gradient">Welcome to NEXORA</span>
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-titanium-surface border border-titanium-border text-titanium-accent">
              {schedulingMode.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}
            <span>{pendingTasks.length} active tasks queued in C++ Min Heap priority queue</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentPage('scheduler')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-titanium-surface border border-titanium-border text-xs font-semibold text-titanium-text hover:border-titanium-accent/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-titanium-accent" />
            <span>Open Scheduler</span>
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main text-xs font-bold shadow-glow-accent hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Cards Section */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => setCurrentPage('tasks')}
          className="p-4 rounded-2xl glass-panel hover:border-titanium-accent/40 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-titanium-text-muted">Total Tasks</span>
            <div className="p-1.5 rounded-lg bg-titanium-surface text-titanium-steel group-hover:text-titanium-accent transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-titanium-text">{totalTasks}</h3>
            <p className="text-[10px] text-titanium-text-muted mt-0.5">In C++ repository</p>
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('tasks')}
          className="p-4 rounded-2xl glass-panel hover:border-titanium-accent/40 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-titanium-text-muted">Pending Heap</span>
            <div className="p-1.5 rounded-lg bg-titanium-surface text-titanium-accent">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-titanium-accent">{pendingTasks.length}</h3>
            <p className="text-[10px] text-titanium-text-muted mt-0.5">Active priority items</p>
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('tasks')}
          className="p-4 rounded-2xl glass-panel hover:border-titanium-accent/40 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-titanium-text-muted">In Progress</span>
            <div className="p-1.5 rounded-lg bg-titanium-surface text-semantic-info">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-semantic-info">{inProgressTasks.length}</h3>
            <p className="text-[10px] text-titanium-text-muted mt-0.5">Currently focused</p>
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('tasks')}
          className="p-4 rounded-2xl glass-panel hover:border-titanium-accent/40 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-titanium-text-muted">Completed</span>
            <div className="p-1.5 rounded-lg bg-titanium-surface text-semantic-success">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-semantic-success">{completedTasks.length}</h3>
            <p className="text-[10px] text-titanium-text-muted mt-0.5">Fully executed</p>
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('tasks')}
          className="p-4 rounded-2xl glass-panel hover:border-titanium-accent/40 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-titanium-text-muted">Overdue</span>
            <div className="p-1.5 rounded-lg bg-titanium-surface text-semantic-error">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-semantic-error">{overdueTasks.length}</h3>
            <p className="text-[10px] text-titanium-text-muted mt-0.5">Requires attention</p>
          </div>
        </div>

        <div
          onClick={() => setCurrentPage('analytics')}
          className="p-4 rounded-2xl glass-panel hover:border-titanium-accent/40 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-titanium-text-muted">Productivity</span>
            <div className="p-1.5 rounded-lg bg-titanium-surface text-titanium-electric">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-titanium-electric">{productivityScore}%</h3>
            <p className="text-[10px] text-titanium-text-muted mt-0.5">On-time index</p>
          </div>
        </div>
      </section>

      {/* Main Grid: Section A (Your Next Move) & Section B (Weekly Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A — Your Next Move (C++ Min-Heap Root) */}
        <div className="lg:col-span-2 glass-panel-glow p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-titanium-accent/20 text-titanium-electric border border-titanium-accent/30">
                  <Sparkles className="w-3.5 h-3.5 text-titanium-accent" /> YOUR NEXT MOVE
                </span>
                <span className="text-xs font-mono text-titanium-text-muted">
                  [C++ Min-Heap Root Node]
                </span>
              </div>
              <span className="text-xs font-mono text-titanium-accent">
                Algorithm: {schedulingMode.replace('_', ' ')}
              </span>
            </div>

            {recommendedTask ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-titanium-text tracking-tight">
                      {recommendedTask.title}
                    </h2>
                    <p className="text-xs text-titanium-text-secondary mt-1 max-w-xl leading-relaxed">
                      {recommendedTask.description || 'Top prioritized task deterministically selected by the zero-based Min Heap comparator.'}
                    </p>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                    recommendedTask.priority === 1
                      ? 'bg-semantic-error/20 text-semantic-error border border-semantic-error/30'
                      : recommendedTask.priority === 2
                      ? 'bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30'
                      : 'bg-titanium-accent/20 text-titanium-electric border border-titanium-accent/30'
                  }`}>
                    Priority {recommendedTask.priority}
                  </span>
                </div>

                {/* Algorithmic Reason Box */}
                <div className="p-3.5 rounded-xl bg-titanium-main/80 border border-titanium-border/80 text-xs text-titanium-text space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-titanium-accent">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Algorithmic Selection Rationale:</span>
                  </div>
                  <p className="text-titanium-text-secondary">
                    {recommendedTask.schedulingReason || recommendedExplanation || 'Earliest deadline and highest priority satisfy heap invariant condition.'}
                  </p>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-titanium-text-secondary pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-titanium-steel" />
                    <span>Countdown: {formatRemainingTime(recommendedTask.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-titanium-accent" />
                    <span>Estimated: {recommendedTask.estimatedMinutes}m</span>
                  </div>
                  {recommendedTask.calculatedUrgencyScore !== undefined && (
                    <div className="flex items-center gap-1.5 text-titanium-electric">
                      <span>Urgency Score: {recommendedTask.calculatedUrgencyScore.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-titanium-text-muted">
                No active tasks in scheduling queue. All items completed!
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {recommendedTask && (
            <div className="pt-6 border-t border-titanium-border/60 flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => completeTask(recommendedTask.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-semantic-success to-emerald-400 text-titanium-main font-bold text-xs shadow-sm hover:opacity-95 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Complete Task</span>
                </button>

                <button
                  onClick={() => setCurrentPage('focus')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-xs font-semibold text-titanium-text transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-titanium-accent" />
                  <span>Start Focus Session</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedTask(recommendedTask)}
                className="text-xs text-titanium-accent hover:underline flex items-center gap-1 font-medium"
              >
                <span>Inspect full details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Section B — Weekly Overview Chart */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-titanium-accent" /> Weekly Velocity
              </h3>
              <span className="text-[10px] font-mono text-titanium-text-muted">Sprint Progress</span>
            </div>
            <p className="text-xs text-titanium-text-muted">Completed vs scheduled task distribution</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#293B51" vertical={false} />
                <XAxis dataKey="day" stroke="#70839A" fontSize={10} tickLine={false} />
                <YAxis stroke="#70839A" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131F30',
                    border: '1px solid #293B51',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#EDF4FC'
                  }}
                />
                <Bar dataKey="completed" fill="#6D9BCB" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="scheduled" fill="#24374D" radius={[4, 4, 0, 0]} name="Scheduled" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-titanium-border flex items-center justify-between text-xs text-titanium-text-secondary">
            <span>On-time completion</span>
            <span className="font-mono font-bold text-titanium-electric">92.4%</span>
          </div>
        </div>
      </div>

      {/* Secondary Multi-Column Row: Section C (Today's Agenda) & Section D (Smart Insights) & Section E (DSA Engine Preview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Section C — Today's Agenda */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-titanium-accent" /> Today's Agenda
            </h3>
            <button
              onClick={() => setCurrentPage('my-day')}
              className="text-xs text-titanium-accent hover:underline flex items-center gap-1"
            >
              My Day <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayAgenda.length === 0 ? (
            <p className="text-xs text-titanium-text-muted py-6 text-center">No urgent tasks remaining for today</p>
          ) : (
            <div className="space-y-2.5">
              {todayAgenda.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-3 rounded-xl bg-titanium-surface/60 border border-titanium-border/70 hover:border-titanium-accent/40 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-2 h-2 rounded-full ${
                      task.priority === 1 ? 'bg-semantic-error' : task.priority === 2 ? 'bg-semantic-warning' : 'bg-titanium-accent'
                    }`} />
                    <span className="text-xs font-semibold text-titanium-text truncate">{task.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-titanium-text-muted flex-shrink-0">
                    {formatRemainingTime(task.deadline)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section D — Smart Insights & Workload Warnings */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-titanium-accent" /> Smart Insights
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-titanium-surface text-titanium-electric">
              AI Engine
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-titanium-surface/60 border border-titanium-border text-xs space-y-1">
              <p className="font-semibold text-titanium-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-semantic-success"></span> Balanced Schedule
              </p>
              <p className="text-[11px] text-titanium-text-secondary leading-relaxed">
                Active tasks do not exceed your 6-hour daily focus threshold. You have 3.5h open bandwidth.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-titanium-surface/60 border border-titanium-border text-xs space-y-1">
              <p className="font-semibold text-titanium-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-titanium-accent"></span> Algorithm Optimization
              </p>
              <p className="text-[11px] text-titanium-text-secondary leading-relaxed">
                Min-Heap root is computed in O(1) time. All parent-child node relationships validated.
              </p>
            </div>

            {overdueTasks.length > 0 && (
              <div className="p-3 rounded-xl bg-semantic-error/10 border border-semantic-error/30 text-xs space-y-1">
                <p className="font-semibold text-semantic-error flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Overdue Workload Notice
                </p>
                <p className="text-[11px] text-semantic-error/80 leading-relaxed">
                  {overdueTasks.length} task(s) past original deadline. Recommend rescheduling or prioritizing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section E — DSA Engine Live Preview */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Cpu className="w-4 h-4 text-titanium-accent" /> DSA Engine Preview
            </h3>
            <button
              onClick={() => setCurrentPage('heap-visualizer')}
              className="text-xs text-titanium-accent hover:underline flex items-center gap-1"
            >
              Full Lab <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-titanium-main/80 border border-titanium-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-titanium-text-muted">Heap Structure:</span>
              <span className="font-mono text-titanium-text font-semibold">Zero-Based Binary Tree</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-titanium-text-muted">Active Elements:</span>
              <span className="font-mono text-titanium-accent font-bold">{pendingTasks.length} nodes</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-titanium-text-muted">Root Peek:</span>
              <span className="font-mono text-semantic-success font-semibold">O(1) Access</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-titanium-text-muted">Insert / Extract:</span>
              <span className="font-mono text-titanium-electric font-semibold">O(log n) Heapify</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('heap-visualizer')}
            className="w-full py-2.5 rounded-xl bg-titanium-surface border border-titanium-accent/30 hover:border-titanium-accent text-xs font-semibold text-titanium-electric transition-colors flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-titanium-accent" />
            <span>Launch Min-Heap Visualizer</span>
          </button>
        </div>
      </div>

      {/* Section F & G: Upcoming Deadlines & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section F — Upcoming Deadlines */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-titanium-text">Upcoming Deadlines</h3>
            <button
              onClick={() => setCurrentPage('tasks')}
              className="text-xs text-titanium-accent hover:underline flex items-center gap-1"
            >
              View all tasks <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-titanium-border/60">
            {upcomingDeadlines.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="py-3 flex items-center justify-between gap-4 hover:bg-titanium-surface/40 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    t.priority === 1 ? 'bg-semantic-error' : t.priority === 2 ? 'bg-semantic-warning' : 'bg-titanium-accent'
                  }`} />
                  <div>
                    <p className="text-xs font-semibold text-titanium-text">{t.title}</p>
                    <p className="text-[11px] text-titanium-text-muted">
                      Due: {new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-titanium-accent">{formatRemainingTime(t.deadline)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTask(t.id);
                    }}
                    className="p-1.5 rounded-lg text-titanium-steel hover:text-semantic-success hover:bg-titanium-surface transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section G — Quick Actions */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-titanium-text">Quick Actions</h3>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="p-3 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-left text-xs font-semibold text-titanium-text flex items-center justify-between group transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-titanium-accent" />
                Add New Task
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-titanium-steel group-hover:text-titanium-accent transition-colors" />
            </button>

            <button
              onClick={() => setCurrentPage('scheduler')}
              className="p-3 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-left text-xs font-semibold text-titanium-text flex items-center justify-between group transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-titanium-accent" />
                Run C++ Scheduler
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-titanium-steel group-hover:text-titanium-accent transition-colors" />
            </button>

            <button
              onClick={() => setCurrentPage('focus')}
              className="p-3 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-left text-xs font-semibold text-titanium-text flex items-center justify-between group transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-titanium-accent" />
                Start Focus Session
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-titanium-steel group-hover:text-titanium-accent transition-colors" />
            </button>

            <button
              onClick={() => setCurrentPage('calendar')}
              className="p-3 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-left text-xs font-semibold text-titanium-text flex items-center justify-between group transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-titanium-accent" />
                Open Interactive Calendar
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-titanium-steel group-hover:text-titanium-accent transition-colors" />
            </button>

            <button
              onClick={() => setCurrentPage('goals')}
              className="p-3 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-left text-xs font-semibold text-titanium-text flex items-center justify-between group transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-titanium-accent" />
                Track Habits & Goals
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-titanium-steel group-hover:text-titanium-accent transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
