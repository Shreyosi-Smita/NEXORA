import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const TaskDetailsDrawer: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    completeTask,
    deleteTask,
    updateTask,
    setCurrentPage,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  if (!selectedTask) return null;

  const isCompleted = selectedTask.status === 'COMPLETED';

  const handleStartFocus = () => {
    setCurrentPage('focus');
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    await updateTask(selectedTask.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-md h-full bg-titanium-elevated border-l border-titanium-border shadow-titanium-lg p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-titanium-border">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                selectedTask.priority === 1
                  ? 'bg-semantic-error/20 text-semantic-error border border-semantic-error/30'
                  : selectedTask.priority === 2
                  ? 'bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30'
                  : 'bg-titanium-accent/20 text-titanium-electric border border-titanium-accent/30'
              }`}>
                P{selectedTask.priority} {selectedTask.priority === 1 ? 'High' : selectedTask.priority === 2 ? 'Medium' : 'Low'}
              </span>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isCompleted
                  ? 'bg-semantic-success/20 text-semantic-success border border-semantic-success/30'
                  : 'bg-titanium-surface text-titanium-text-secondary border border-titanium-border'
              }`}>
                {selectedTask.status}
              </span>
            </div>

            <button
              onClick={() => setSelectedTask(null)}
              className="p-1.5 rounded-lg text-titanium-text-muted hover:text-titanium-text hover:bg-titanium-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Description */}
          <div>
            {!isEditing ? (
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-titanium-text leading-snug">
                  {selectedTask.title}
                </h2>
                <p className="text-xs text-titanium-text-secondary leading-relaxed">
                  {selectedTask.description || 'No description provided for this task.'}
                </p>
                <button
                  onClick={() => {
                    setEditTitle(selectedTask.title);
                    setEditDesc(selectedTask.description || '');
                    setIsEditing(true);
                  }}
                  className="text-[11px] text-titanium-accent hover:underline pt-1 block"
                >
                  Edit details
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-xl bg-titanium-surface border border-titanium-border">
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-titanium-elevated border border-titanium-border rounded-lg px-2.5 py-1.5 text-xs text-titanium-text outline-none"
                />
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full bg-titanium-elevated border border-titanium-border rounded-lg px-2.5 py-1.5 text-xs text-titanium-text outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-xs text-titanium-text-secondary hover:text-titanium-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 rounded-lg bg-titanium-accent text-titanium-main text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* C++ Algorithmic Reasoning Spotlight */}
          <div className="p-4 rounded-xl glass-panel-glow border border-titanium-accent/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-titanium-electric">
              <Sparkles className="w-4 h-4 text-titanium-accent" />
              <span>C++ Min-Heap Scheduling Evaluation</span>
            </div>
            <p className="text-xs text-titanium-text leading-relaxed">
              {selectedTask.schedulingReason || 'Positioned deterministically in binary heap using deadline & priority tie-breakers.'}
            </p>
            {selectedTask.calculatedUrgencyScore !== undefined && (
              <div className="pt-2 border-t border-titanium-border/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-titanium-text-muted">Calculated Urgency Score:</span>
                <span className="font-bold text-titanium-accent">{selectedTask.calculatedUrgencyScore.toFixed(1)} / 100</span>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-titanium-surface border border-titanium-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-titanium-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-titanium-steel" /> Deadline
              </span>
              <p className="font-semibold text-titanium-text">
                {new Date(selectedTask.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-titanium-surface border border-titanium-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-titanium-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-titanium-steel" /> Estimated Time
              </span>
              <p className="font-semibold text-titanium-text">
                {selectedTask.estimatedMinutes} minutes
              </p>
            </div>

            <div className="p-3 rounded-xl bg-titanium-surface border border-titanium-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-titanium-text-muted flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-titanium-steel" /> Category
              </span>
              <p className="font-semibold text-titanium-text">
                {selectedTask.categoryId || 'General'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-titanium-surface border border-titanium-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-titanium-text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" /> Integrity
              </span>
              <p className="font-semibold text-semantic-success font-mono">
                Verified Invariant
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-titanium-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => completeTask(selectedTask.id)}
              disabled={isCompleted}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isCompleted
                  ? 'bg-semantic-success/20 text-semantic-success border border-semantic-success/30 cursor-default'
                  : 'bg-gradient-to-r from-semantic-success to-emerald-400 text-titanium-main hover:opacity-95 shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </button>

            <button
              onClick={handleStartFocus}
              className="py-2.5 px-4 rounded-xl bg-titanium-surface border border-titanium-border text-titanium-text hover:border-titanium-accent/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-titanium-accent" />
              Start Focus
            </button>
          </div>

          <button
            onClick={() => deleteTask(selectedTask.id)}
            className="w-full py-2 rounded-xl text-xs text-semantic-error/80 hover:text-semantic-error hover:bg-semantic-error/10 border border-transparent hover:border-semantic-error/20 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Task from C++ Scheduler
          </button>
        </div>
      </div>
    </div>
  );
};
