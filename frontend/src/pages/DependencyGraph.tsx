import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Network,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Layers
} from 'lucide-react';

export const DependencyGraph: React.FC = () => {
  const {
    tasks,
    dependencies,
    topologicalOrder,
    hasDependencyCycle,
    addDependency,
    removeDependency,
    setSelectedTask
  } = useApp();

  const [dependentId, setDependentId] = useState('');
  const [prereqId, setPrereqId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

  const handleAddEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dependentId || !prereqId) return;
    if (dependentId === prereqId) {
      alert('Self-dependency is strictly forbidden in DAG models.');
      return;
    }

    setIsAdding(true);
    await addDependency(dependentId, prereqId);
    setIsAdding(false);
  };

  // Determine which tasks are blocked
  const completedIds = new Set(tasks.filter(t => t.status === 'COMPLETED').map(t => t.id));
  const blockedTaskIds = new Set<string>();

  dependencies.forEach(edge => {
    if (!completedIds.has(edge.prerequisiteTaskId)) {
      blockedTaskIds.add(edge.dependentTaskId);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Network className="w-6 h-6 text-titanium-accent" /> DAG Dependency Graph & Topological Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              C++ Kahn's & 3-Color DFS
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Directed Acyclic Graph solver with cycle detection shielding unready tasks from immediate heap scheduling.
          </p>
        </div>

        {/* Invariant status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-titanium-surface border border-titanium-border text-xs font-mono self-start">
          {hasDependencyCycle ? (
            <span className="flex items-center gap-1.5 text-semantic-error">
              <ShieldAlert className="w-4 h-4" /> Cycle Detected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-semantic-success">
              <ShieldCheck className="w-4 h-4" /> Valid Acyclic DAG
            </span>
          )}
        </div>
      </div>

      {/* Dependency Constraint Creation Bar */}
      <form onSubmit={handleAddEdge} className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-titanium-text">Add Dependency Edge:</span>

        <select
          value={dependentId}
          onChange={e => setDependentId(e.target.value)}
          className="bg-titanium-surface border border-titanium-border rounded-xl px-3 py-1.5 text-xs text-titanium-text outline-none max-w-xs"
        >
          <option value="">Select Dependent Task...</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <span className="text-xs font-mono text-titanium-text-muted">depends on</span>

        <select
          value={prereqId}
          onChange={e => setPrereqId(e.target.value)}
          className="bg-titanium-surface border border-titanium-border rounded-xl px-3 py-1.5 text-xs text-titanium-text outline-none max-w-xs"
        >
          <option value="">Select Prerequisite Task...</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!dependentId || !prereqId || isAdding}
          className="px-4 py-1.5 rounded-xl bg-titanium-accent text-titanium-main text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Constraint
        </button>
      </form>

      {/* Main Grid: Visual Dependency Network & Active Edges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Status Matrix (2 Cols on lg) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-titanium-border">
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Layers className="w-4 h-4 text-titanium-accent" /> Tasks Dependency State
            </h3>
            <span className="text-xs font-mono text-titanium-text-muted">
              {blockedTaskIds.size} blocked · {pendingTasks.length - blockedTaskIds.size} eligible for Heap
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tasks.map(task => {
              const isBlocked = blockedTaskIds.has(task.id);
              const isCompleted = task.status === 'COMPLETED';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isCompleted
                      ? 'bg-titanium-surface/40 border-titanium-border/60 opacity-60'
                      : isBlocked
                      ? 'bg-semantic-warning/10 border-semantic-warning/40 shadow-sm'
                      : 'bg-titanium-surface border-titanium-border hover:border-titanium-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-semantic-success/20 text-semantic-success'
                        : isBlocked
                        ? 'bg-semantic-warning/20 text-semantic-warning'
                        : 'bg-titanium-accent/20 text-titanium-electric'
                    }`}>
                      {isCompleted ? 'Completed' : isBlocked ? 'Blocked by Prerequisite' : 'Eligible for Root'}
                    </span>
                    <span className="text-[10px] font-mono text-titanium-text-muted">P{task.priority}</span>
                  </div>

                  <p className="text-xs font-bold text-titanium-text truncate">{task.title}</p>
                  <p className="text-[10px] text-titanium-text-muted">
                    Due: {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Topological Sort Order Ribbon */}
          {topologicalOrder.length > 0 && (
            <div className="pt-4 border-t border-titanium-border space-y-2">
              <span className="text-xs font-bold font-mono text-titanium-electric flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" /> Computed Topological Order (Kahn's Algorithm):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {topologicalOrder.map((taskId, idx) => {
                  const t = tasks.find(item => item.id === taskId);
                  return (
                    <div key={taskId} className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl bg-titanium-elevated border border-titanium-border text-[11px] font-mono text-titanium-text">
                        {t ? t.title : taskId}
                      </span>
                      {idx + 1 < topologicalOrder.length && (
                        <ArrowRight className="w-3 h-3 text-titanium-steel" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Active Directed Edges List */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="pb-3 border-b border-titanium-border">
            <h3 className="text-sm font-bold text-titanium-text">Active Dependency Constraints</h3>
            <p className="text-xs text-titanium-text-muted mt-0.5">
              {dependencies.length} directed constraints registered in C++
            </p>
          </div>

          {dependencies.length === 0 ? (
            <div className="py-16 text-center text-xs text-titanium-text-muted space-y-1">
              <Network className="w-8 h-8 mx-auto text-titanium-steel opacity-40 mb-2" />
              <p>No dependency constraints established.</p>
              <p className="text-[11px]">All pending tasks are currently free to schedule.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {dependencies.map((edge, idx) => {
                const dep = tasks.find(t => t.id === edge.dependentTaskId);
                const prereq = tasks.find(t => t.id === edge.prerequisiteTaskId);

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-titanium-surface border border-titanium-border space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-bold text-titanium-text truncate">{dep?.title || edge.dependentTaskId}</p>
                        <p className="text-[10px] text-titanium-text-muted flex items-center gap-1 mt-0.5">
                          <span>must wait for:</span>
                          <strong className="text-titanium-accent truncate">{prereq?.title || edge.prerequisiteTaskId}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => removeDependency(edge.dependentTaskId, edge.prerequisiteTaskId)}
                        className="p-1 text-titanium-steel hover:text-semantic-error transition-colors"
                        title="Remove constraint"
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
    </div>
  );
};
