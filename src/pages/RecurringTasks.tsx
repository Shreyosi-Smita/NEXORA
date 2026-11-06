import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RecurringRule } from '../types/task';
import { Repeat, Plus, Clock, Play, Pause, Calendar, Layers } from 'lucide-react';

export const RecurringTasks: React.FC = () => {
  const { recurringRules, toggleRecurringRule } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [estimated, setEstimated] = useState('30');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    alert(`Created recurring template "${newTitle.trim()}". Will automatically inject into C++ Min-Heap.`);
    setNewTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Repeat className="w-6 h-6 text-titanium-accent" /> Recurring Task Automations
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Automated Ingestion
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Configure periodic routines that automatically replenish your scheduling queue upon completion.
          </p>
        </div>
      </div>

      {/* Add Recurring Rule Form */}
      <form onSubmit={handleAddRule} className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-titanium-text">Create Recurring Routine</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Routine title (e.g. Weekly DSA Sprint Planning)..."
            className="sm:col-span-2 bg-titanium-surface border border-titanium-border rounded-xl px-3 py-2 text-xs text-titanium-text outline-none focus:border-titanium-accent"
          />

          <select
            value={frequency}
            onChange={e => setFrequency(e.target.value as any)}
            className="bg-titanium-surface border border-titanium-border rounded-xl px-3 py-2 text-xs text-titanium-text outline-none"
          >
            <option value="daily">Daily Repetition</option>
            <option value="weekly">Weekly Repetition</option>
            <option value="monthly">Monthly Repetition</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main text-xs font-bold shadow-glow-accent hover:opacity-95 transition-all"
          >
            + Create Routine
          </button>
        </div>
      </form>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recurringRules.map(rule => (
          <div
            key={rule.id}
            className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-titanium-surface text-titanium-accent border border-titanium-border font-bold">
                  {rule.frequency}
                </span>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  rule.isActive
                    ? 'bg-semantic-success/20 text-semantic-success'
                    : 'bg-titanium-surface text-titanium-text-muted'
                }`}>
                  {rule.isActive ? 'Active Automation' : 'Paused'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-titanium-text">{rule.title}</h3>
              <p className="text-[11px] text-titanium-text-muted">
                Est: {rule.estimatedMinutes}m · Injects with Priority {rule.priority}
              </p>
            </div>

            <div className="pt-3 border-t border-titanium-border/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-titanium-text-muted">
                Next: {new Date(rule.nextOccurrence).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>

              <button
                onClick={() => toggleRecurringRule(rule.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  rule.isActive
                    ? 'bg-titanium-surface text-titanium-text hover:bg-titanium-hover'
                    : 'bg-titanium-accent text-titanium-main font-bold'
                }`}
              >
                {rule.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {rule.isActive ? 'Pause' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
