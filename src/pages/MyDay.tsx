import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  Clock,
  Plus,
  Play,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const MyDay: React.FC = () => {
  const {
    tasks,
    completeTask,
    setSelectedTask,
    setIsQuickAddOpen,
    setCurrentPage,
  } = useApp();

  // Time slots from 08:00 to 20:00
  const hours = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM'
  ];

  // Schedule map: hour -> taskId
  const [slotAssignments, setSlotAssignments] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (tasks.length > 0) map['09:00 AM'] = tasks[0].id;
    if (tasks.length > 1) map['11:00 AM'] = tasks[1].id;
    if (tasks.length > 2) map['02:00 PM'] = tasks[2].id;
    return map;
  });

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const totalEstimatedMinutes = pendingTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const availableMinutes = 8 * 60; // 8 working hours = 480 mins
  const isOverCapacity = totalEstimatedMinutes > availableMinutes;

  const handleAssignTask = (hour: string, taskId: string) => {
    setSlotAssignments(prev => ({ ...prev, [hour]: taskId }));
    setSelectedSlot(null);
  };

  const handleClearSlot = (hour: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlotAssignments(prev => {
      const copy = { ...prev };
      delete copy[hour];
      return copy;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner with Larger Font Sizes & Better Padding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-titanium-text flex items-center gap-3">
              <Sun className="w-8 h-8 text-semantic-warning" /> My Day Planning Workspace
            </h1>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Active Focus Window
            </span>
          </div>
          <p className="text-sm sm:text-base text-titanium-text-secondary mt-1.5">
            Deterministic daily time-blocking synchronized with C++ Min-Heap priorities.
          </p>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main text-sm font-extrabold shadow-glow-accent hover:opacity-95 transition-all self-start"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> Add Task for Today
        </button>
      </div>

      {/* Workload Bandwidth Capacity Gauge */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isOverCapacity
          ? 'bg-semantic-warning/10 border-semantic-warning/40 text-semantic-warning'
          : 'glass-panel border-titanium-border text-titanium-text'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isOverCapacity ? 'bg-semantic-warning/20' : 'bg-titanium-surface'} border border-titanium-border`}>
            <Clock className={`w-7 h-7 ${isOverCapacity ? 'text-semantic-warning' : 'text-titanium-accent'}`} />
          </div>
          <div>
            <h3 className="text-base font-extrabold">
              {isOverCapacity ? 'Daily Working Capacity Exceeded' : 'Daily Workload on Track'}
            </h3>
            <p className="text-sm text-titanium-text-secondary mt-0.5">
              Estimated Duration: <strong className="font-mono text-titanium-text font-bold">{(totalEstimatedMinutes / 60).toFixed(1)} hrs</strong>
              {' · '}
              Available Working Window: <strong className="font-mono text-titanium-text font-bold">8.0 hrs</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-sm font-mono">
          <div className="w-48 h-3 rounded-full bg-titanium-main overflow-hidden border border-titanium-border">
            <div
              className={`h-full transition-all ${isOverCapacity ? 'bg-semantic-warning' : 'bg-titanium-accent'}`}
              style={{ width: `${Math.min(100, (totalEstimatedMinutes / availableMinutes) * 100)}%` }}
            />
          </div>
          <span className="font-bold text-base">{Math.round((totalEstimatedMinutes / availableMinutes) * 100)}% Load</span>
        </div>
      </div>

      {/* Main Grid: Left (Hourly Schedule Timeline) & Right (Available Queue Pool) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Hourly Schedule Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-titanium-border">
            <div>
              <h3 className="text-lg font-bold text-titanium-text flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-titanium-accent" /> Hourly Time-Blocked Timeline
              </h3>
              <p className="text-xs text-titanium-text-muted mt-0.5">
                Click any slot to assign or reallocate tasks from the queue
              </p>
            </div>
            <span className="text-xs font-mono text-titanium-accent font-semibold">12 Active Blocks</span>
          </div>

          <div className="space-y-3">
            {hours.map(hour => {
              const assignedTaskId = slotAssignments[hour];
              const task = tasks.find(t => t.id === assignedTaskId);
              const isSelected = selectedSlot === hour;

              return (
                <div
                  key={hour}
                  onClick={() => setSelectedSlot(isSelected ? null : hour)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-titanium-accent bg-titanium-hover shadow-titanium-lg scale-[1.01]'
                      : task
                      ? 'border-titanium-border/80 bg-titanium-surface hover:border-titanium-accent/40 shadow-sm'
                      : 'border-dashed border-titanium-border/70 hover:border-titanium-accent/30 bg-titanium-main/40'
                  }`}
                >
                  <div className="flex items-center gap-5 flex-1 truncate">
                    <span className="w-20 font-mono text-sm font-bold text-titanium-text-muted flex-shrink-0">
                      {hour}
                    </span>

                    {task ? (
                      <div className="flex items-center gap-3 truncate">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          task.priority === 1 ? 'bg-semantic-error' : task.priority === 2 ? 'bg-semantic-warning' : 'bg-titanium-accent'
                        }`} />
                        <span className="text-sm font-bold text-titanium-text truncate">{task.title}</span>
                        <span className="text-xs font-mono text-titanium-accent hidden sm:inline font-semibold">
                          ({task.estimatedMinutes || 30}m)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-titanium-text-muted italic">
                        {isSelected ? 'Select a task from right panel to assign...' : 'Open Time Slot — Click to schedule'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {task && (
                      <button
                        onClick={(e) => handleClearSlot(hour, e)}
                        className="text-xs font-mono text-titanium-text-muted hover:text-semantic-error transition-colors px-3 py-1 rounded-xl bg-titanium-main border border-titanium-border font-semibold"
                      >
                        Unassign
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Available Tasks Pool */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-titanium-border">
              <h3 className="text-lg font-bold text-titanium-text flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-titanium-accent" /> Available Queue
              </h3>
              <span className="text-xs font-mono text-titanium-accent font-bold px-2 py-0.5 rounded bg-titanium-surface">
                {pendingTasks.length} queued
              </span>
            </div>

            {selectedSlot && (
              <div className="p-3.5 rounded-2xl bg-titanium-accent/15 border border-titanium-accent/40 text-xs text-titanium-electric font-semibold">
                Select a task below to assign to <strong className="font-mono text-titanium-text">{selectedSlot}</strong>:
              </div>
            )}

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {pendingTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    if (selectedSlot) {
                      handleAssignTask(selectedSlot, t.id);
                    } else {
                      setSelectedTask(t);
                    }
                  }}
                  className="p-4 rounded-2xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 transition-colors cursor-pointer space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      t.priority === 1 ? 'bg-semantic-error/20 text-semantic-error' :
                      t.priority === 2 ? 'bg-semantic-warning/20 text-semantic-warning' : 'bg-titanium-accent/20 text-titanium-electric'
                    }`}>
                      P{t.priority}
                    </span>
                    <span className="text-xs font-mono text-titanium-text-muted">
                      {t.estimatedMinutes}m
                    </span>
                  </div>
                  <p className="text-sm font-bold text-titanium-text group-hover:text-titanium-electric transition-colors leading-snug">
                    {t.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('focus')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main font-extrabold text-sm shadow-glow-accent hover:opacity-95 transition-all flex items-center justify-center gap-2.5 mt-4"
          >
            <Play className="w-4 h-4 fill-current" /> Start Today's Focus Routine
          </button>
        </div>
      </div>
    </div>
  );
};
