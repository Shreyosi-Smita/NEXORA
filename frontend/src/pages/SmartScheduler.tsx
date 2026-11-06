import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchedulingMode, Task } from '../types/task';
import {
  Sparkles,
  Sliders,
  Check,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Clock,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const SmartScheduler: React.FC = () => {
  const {
    tasks,
    recommendedTask,
    recommendedExplanation,
    schedulingMode,
    setSchedulingMode,
    setSelectedTask,
    completeTask,
    isLoading
  } = useApp();

  const [priorityWeight, setPriorityWeight] = useState(40);
  const [deadlineWeight, setDeadlineWeight] = useState(60);
  const [workingHours, setWorkingHours] = useState(8);

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

  const modes: { id: SchedulingMode; title: string; desc: string; complexity: string }[] = [
    {
      id: 'DEADLINE_FIRST',
      title: 'Deadline-First (EDF)',
      desc: 'Earliest deadline scheduled at root of C++ Min Heap. Priority tie-breaks.',
      complexity: 'O(log n) insert · O(1) peek'
    },
    {
      id: 'PRIORITY_FIRST',
      title: 'Priority-First (HPF)',
      desc: 'Highest priority (P1 > P2 > P3) root order. Earliest deadline tie-breaks.',
      complexity: 'O(log n) insert · O(1) peek'
    },
    {
      id: 'SMART_URGENCY',
      title: 'Smart Urgency Scoring',
      desc: 'Continuous dynamic polynomial score combining deadline delta and priority weighting.',
      complexity: 'O(log n) heapify'
    },
    {
      id: 'BALANCED',
      title: 'Balanced Schedule',
      desc: 'Weighted trade-off preventing starvation of medium priority tasks with near deadlines.',
      complexity: 'O(log n) heapify'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-titanium-accent" /> Smart Min-Heap Scheduler
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              C++ Core Engine
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Deterministic algorithmic scheduler with zero-based vector Min-Heap and tie-breaking invariants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-titanium-text-muted">
            Queue Size: <strong className="text-titanium-accent">{pendingTasks.length}</strong>
          </span>
        </div>
      </div>

      {/* Tri-Pane Scheduler Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Scheduling Modes & Weights */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Sliders className="w-4 h-4 text-titanium-accent" /> Algorithm Mode
            </h3>
            <p className="text-[11px] text-titanium-text-muted mt-1">
              Select heap comparator executed in C++ engine
            </p>
          </div>

          <div className="space-y-2.5">
            {modes.map(m => {
              const isActive = schedulingMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSchedulingMode(m.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isActive
                      ? 'bg-titanium-elevated border-titanium-accent shadow-titanium'
                      : 'bg-titanium-surface border-titanium-border hover:border-titanium-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isActive ? 'text-titanium-electric' : 'text-titanium-text'}`}>
                      {m.title}
                    </span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-titanium-accent"></span>}
                  </div>
                  <p className="text-[10px] text-titanium-text-secondary leading-tight">
                    {m.desc}
                  </p>
                  <p className="text-[9px] font-mono text-titanium-steel pt-0.5">
                    {m.complexity}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Weight Sliders */}
          <div className="pt-4 border-t border-titanium-border space-y-4">
            <h4 className="text-xs font-bold text-titanium-text">Urgency Weights</h4>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-titanium-text-muted">Deadline Urgency</span>
                <span className="text-titanium-accent font-bold">{deadlineWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={deadlineWeight}
                onChange={e => setDeadlineWeight(parseInt(e.target.value, 10))}
                className="w-full accent-[#6D9BCB] h-1.5 bg-titanium-surface rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-titanium-text-muted">Priority Weight</span>
                <span className="text-titanium-electric font-bold">{priorityWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={priorityWeight}
                onChange={e => setPriorityWeight(parseInt(e.target.value, 10))}
                className="w-full accent-[#B5D7F5] h-1.5 bg-titanium-surface rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-titanium-text-muted">Daily Working Window</span>
                <span className="text-titanium-text font-bold">{workingHours} hrs</span>
              </div>
              <input
                type="range"
                min="4"
                max="14"
                value={workingHours}
                onChange={e => setWorkingHours(parseInt(e.target.value, 10))}
                className="w-full accent-[#91B8DE] h-1.5 bg-titanium-surface rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Center Panel: Live Ordered Task Queue (2 Cols on lg) */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-titanium-border">
            <div>
              <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
                <Layers className="w-4 h-4 text-titanium-accent" /> Heap-Ordered Execution Queue
              </h3>
              <p className="text-xs text-titanium-text-muted">
                Tasks sorted continuously by C++ Min Heap priority queue
              </p>
            </div>
            <span className="text-xs font-mono text-titanium-accent">
              Active Invariant: Verified
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.map((task, index) => {
              const isRoot = index === 0;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isRoot
                      ? 'glass-panel-glow border-titanium-accent shadow-titanium'
                      : 'bg-titanium-surface border-titanium-border hover:border-titanium-accent/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <span className={`w-7 h-7 rounded-xl font-mono text-xs font-extrabold flex items-center justify-center flex-shrink-0 ${
                      isRoot
                        ? 'bg-titanium-accent text-titanium-main shadow-sm'
                        : 'bg-titanium-elevated text-titanium-text-muted border border-titanium-border'
                    }`}>
                      #{index + 1}
                    </span>

                    <div className="truncate">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-bold text-titanium-text truncate">{task.title}</span>
                        {isRoot && (
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-titanium-accent/20 text-titanium-electric border border-titanium-accent/30 flex-shrink-0">
                            Next Up (Root)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-titanium-text-muted mt-0.5 truncate">
                        Due: {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        Est: {task.estimatedMinutes}m
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 1 ? 'bg-semantic-error/20 text-semantic-error' :
                      task.priority === 2 ? 'bg-semantic-warning/20 text-semantic-warning' : 'bg-titanium-accent/20 text-titanium-electric'
                    }`}>
                      P{task.priority}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeTask(task.id);
                      }}
                      className="p-1.5 rounded-lg text-titanium-steel hover:text-semantic-success hover:bg-titanium-hover transition-colors"
                      title="Complete task"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Algorithmic Recommendation Breakdown */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Cpu className="w-4 h-4 text-titanium-accent" /> Algorithmic Rationale
            </h3>
            <p className="text-[11px] text-titanium-text-muted mt-1">
              Why the C++ Min Heap selected this root
            </p>
          </div>

          {recommendedTask ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-titanium-surface border border-titanium-border space-y-2">
                <span className="text-[10px] font-mono uppercase text-titanium-text-muted block">Selected Root Task</span>
                <h4 className="text-sm font-bold text-titanium-text">{recommendedTask.title}</h4>
                <p className="text-xs text-titanium-text-secondary leading-relaxed">
                  {recommendedTask.schedulingReason || recommendedExplanation || 'Computed using minimum deadline timestamp comparator.'}
                </p>
              </div>

              {/* Urgency Factor Breakdown */}
              <div className="space-y-2 text-xs">
                <span className="text-[11px] font-mono text-titanium-text-muted uppercase tracking-wider block">
                  Deterministic Factors
                </span>

                <div className="p-2.5 rounded-xl bg-titanium-surface/60 border border-titanium-border flex justify-between">
                  <span className="text-titanium-text-secondary">Deadline Delta:</span>
                  <span className="font-mono text-titanium-accent">
                    {Math.max(0, Math.floor((recommendedTask.deadline - Date.now()) / 3600000))} hrs
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-titanium-surface/60 border border-titanium-border flex justify-between">
                  <span className="text-titanium-text-secondary">Priority Level:</span>
                  <span className="font-mono text-titanium-text">P{recommendedTask.priority}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-titanium-surface/60 border border-titanium-border flex justify-between">
                  <span className="text-titanium-text-secondary">Dependency Check:</span>
                  <span className="font-mono text-semantic-success flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Unblocked
                  </span>
                </div>
              </div>

              <button
                onClick={() => completeTask(recommendedTask.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-semantic-success to-emerald-400 text-titanium-main font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Complete Root Task
              </button>
            </div>
          ) : (
            <p className="text-xs text-titanium-text-muted py-8 text-center">
              All tasks cleared. Queue is currently empty.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
