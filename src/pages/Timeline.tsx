import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GitBranch, Clock, AlertTriangle, Layers, Plus, ZoomIn, ZoomOut } from 'lucide-react';

export const Timeline: React.FC = () => {
  const { tasks, setSelectedTask, setIsQuickAddOpen } = useApp();
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const now = Date.now();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <GitBranch className="w-6 h-6 text-titanium-accent" /> Timeline & Gantt Planner
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Sequential Scheduling
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Visual project timeline depicting execution durations, milestones, and task concurrency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-titanium-surface border border-titanium-border text-xs font-semibold">
            {(['day', 'week', 'month'] as const).map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-3 py-1 rounded-lg uppercase text-[10px] font-mono transition-colors ${
                  zoom === z ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-text-muted hover:text-titanium-text'
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main text-xs font-bold shadow-glow-accent hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Gantt Matrix Panel */}
      <div className="glass-panel p-6 rounded-3xl space-y-6 overflow-x-auto">
        <div className="min-w-[700px] space-y-4">
          {/* Header Time Axis */}
          <div className="grid grid-cols-12 gap-2 pb-3 border-b border-titanium-border text-[11px] font-mono text-titanium-text-muted text-center uppercase font-bold">
            <div className="col-span-4 text-left">Task / Milestone</div>
            <div className="col-span-8 grid grid-cols-4 gap-2">
              <span>Today</span>
              <span>Tomorrow</span>
              <span>+3 Days</span>
              <span>+7 Days</span>
            </div>
          </div>

          {/* Task Timeline Rows */}
          <div className="space-y-3">
            {pendingTasks.map((task, idx) => {
              const diffHours = (task.deadline - now) / 3600000;
              const isOverdue = diffHours < 0;

              // Calculate visual bar width & offset
              const barWidth = Math.min(100, Math.max(25, 20 + (task.estimatedMinutes / 60) * 15));
              const barOffset = Math.min(75, Math.max(0, (diffHours / 168) * 70));

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="grid grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-titanium-surface/60 border border-titanium-border hover:border-titanium-accent/40 transition-colors cursor-pointer group"
                >
                  {/* Task Info Column */}
                  <div className="col-span-4 flex items-center gap-3 truncate pr-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      task.priority === 1 ? 'bg-semantic-error' : task.priority === 2 ? 'bg-semantic-warning' : 'bg-titanium-accent'
                    }`} />
                    <div className="truncate">
                      <p className="text-xs font-bold text-titanium-text truncate group-hover:text-titanium-electric transition-colors">
                        {task.title}
                      </p>
                      <p className="text-[10px] font-mono text-titanium-text-muted">
                        Est: {task.estimatedMinutes}m · Due: {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Visual Gantt Bar Column */}
                  <div className="col-span-8 relative h-7 bg-titanium-main/60 rounded-xl overflow-hidden border border-titanium-border/80 flex items-center px-1">
                    <div
                      className={`h-5 rounded-lg text-[10px] font-mono font-bold px-2 flex items-center justify-between text-titanium-main transition-all ${
                        isOverdue
                          ? 'bg-gradient-to-r from-semantic-error to-rose-400'
                          : task.priority === 1
                          ? 'bg-gradient-to-r from-semantic-error to-semantic-warning'
                          : 'bg-gradient-to-r from-titanium-accent to-titanium-electric'
                      }`}
                      style={{
                        width: `${barWidth}%`,
                        marginLeft: `${barOffset}%`,
                      }}
                    >
                      <span className="truncate">{task.estimatedMinutes}m window</span>
                      {isOverdue && <AlertTriangle className="w-3 h-3 text-white flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
