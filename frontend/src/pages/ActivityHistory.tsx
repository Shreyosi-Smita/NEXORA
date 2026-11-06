import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Network,
  Clock,
  Filter
} from 'lucide-react';

export const ActivityHistory: React.FC = () => {
  const { activityLog } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = activityLog.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'create': return <Plus className="w-3.5 h-3.5 text-titanium-accent" />;
      case 'complete': return <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />;
      case 'delete': return <Trash2 className="w-3.5 h-3.5 text-semantic-error" />;
      case 'focus': return <Flame className="w-3.5 h-3.5 text-semantic-warning" />;
      case 'dependency': return <Network className="w-3.5 h-3.5 text-titanium-electric" />;
      case 'mode': return <Sparkles className="w-3.5 h-3.5 text-titanium-accent" />;
      default: return <Clock className="w-3.5 h-3.5 text-titanium-steel" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <History className="w-6 h-6 text-titanium-accent" /> System Audit & Activity Log
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Immutable Trace
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Chronological audit trail of task lifecycle state transitions, heap operations, and focus sessions.
          </p>
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-titanium-surface border border-titanium-border rounded-xl px-3 py-1.5 text-xs text-titanium-text outline-none self-start"
        >
          <option value="all">All Operations</option>
          <option value="create">Task Creation</option>
          <option value="complete">Completions</option>
          <option value="delete">Deletions</option>
          <option value="mode">Scheduling Mode</option>
          <option value="focus">Focus Sessions</option>
          <option value="dependency">Dependencies</option>
        </select>
      </div>

      {/* Activity Timeline */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        {filteredLogs.length === 0 ? (
          <p className="text-xs text-titanium-text-muted text-center py-12">No activity records found</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-titanium-border">
            {filteredLogs.map(item => (
              <div key={item.id} className="relative flex items-start gap-4 text-xs">
                {/* Dot */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-titanium-elevated border border-titanium-border flex items-center justify-center">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-titanium-text">{item.action}</span>
                    <span className="text-[10px] font-mono text-titanium-text-muted">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-titanium-text-secondary leading-snug">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
