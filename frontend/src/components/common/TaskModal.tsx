import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, Clock, AlertTriangle, Layers, Tag } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const { isQuickAddOpen, setIsQuickAddOpen, createTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [dueHours, setDueHours] = useState('4');
  const [category, setCategory] = useState('Engineering');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickAddOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const hours = parseFloat(dueHours) || 4;
      const deadline = Date.now() + hours * 3600 * 1000;
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        deadline,
        estimatedMinutes: parseInt(estimatedMinutes, 10) || 30,
        categoryId: category,
      });

      setTitle('');
      setDescription('');
      setIsQuickAddOpen(false);
    } catch (err: any) {
      alert(`Failed to add task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetTimes = [
    { label: '+2 Hours', hours: '2' },
    { label: '+6 Hours', hours: '6' },
    { label: 'Tomorrow', hours: '24' },
    { label: '+3 Days', hours: '72' },
    { label: '+1 Week', hours: '168' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl glass-panel-elevated border border-titanium-accent/40 shadow-titanium-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-titanium-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-titanium-surface border border-titanium-accent/30 text-titanium-electric">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-titanium-text">Add Task to C++ Scheduling Engine</h3>
              <p className="text-[11px] text-titanium-text-muted">Inserted directly into live Min-Heap priority queue</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1 rounded-lg text-titanium-text-muted hover:text-titanium-text hover:bg-titanium-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-titanium-text block mb-1">Task Title *</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Implement DFS Topological Sort & Cycle Shield"
              className="w-full bg-titanium-surface border border-titanium-border focus:border-titanium-accent rounded-xl px-3.5 py-2 text-xs text-titanium-text placeholder-titanium-text-muted outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-titanium-text block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Context, requirements, and constraints..."
              className="w-full bg-titanium-surface border border-titanium-border focus:border-titanium-accent rounded-xl px-3.5 py-2 text-xs text-titanium-text placeholder-titanium-text-muted outline-none transition-all resize-none"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="text-xs font-semibold text-titanium-text block mb-1.5">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority(1)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  priority === 1
                    ? 'bg-semantic-error/20 border-semantic-error text-semantic-error shadow-sm'
                    : 'bg-titanium-surface border-titanium-border text-titanium-text-secondary hover:bg-titanium-hover'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-semantic-error"></span>
                P1 High
              </button>
              <button
                type="button"
                onClick={() => setPriority(2)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  priority === 2
                    ? 'bg-semantic-warning/20 border-semantic-warning text-semantic-warning shadow-sm'
                    : 'bg-titanium-surface border-titanium-border text-titanium-text-secondary hover:bg-titanium-hover'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-semantic-warning"></span>
                P2 Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority(3)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  priority === 3
                    ? 'bg-titanium-accent/20 border-titanium-accent text-titanium-electric shadow-sm'
                    : 'bg-titanium-surface border-titanium-border text-titanium-text-secondary hover:bg-titanium-hover'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-titanium-accent"></span>
                P3 Low
              </button>
            </div>
          </div>

          {/* Deadline Presets */}
          <div>
            <label className="text-xs font-semibold text-titanium-text block mb-1.5">
              Deadline Proximity
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presetTimes.map(p => (
                <button
                  type="button"
                  key={p.hours}
                  onClick={() => setDueHours(p.hours)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                    dueHours === p.hours
                      ? 'bg-titanium-accent text-titanium-main border-titanium-accent font-bold'
                      : 'bg-titanium-surface border-titanium-border text-titanium-text-secondary hover:bg-titanium-hover'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-titanium-text block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-titanium-surface border border-titanium-border focus:border-titanium-accent rounded-xl px-3 py-2 text-xs text-titanium-text outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="DSA Core">DSA Core</option>
                <option value="Product">Product</option>
                <option value="Architecture">Architecture</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-titanium-text block mb-1">Estimated Minutes</label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(e.target.value)}
                className="w-full bg-titanium-surface border border-titanium-border focus:border-titanium-accent rounded-xl px-3 py-2 text-xs text-titanium-text outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-titanium-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-titanium-text-secondary hover:text-titanium-text hover:bg-titanium-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main font-bold text-xs shadow-glow-accent hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Inserting into Heap...' : 'Insert into C++ Heap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
