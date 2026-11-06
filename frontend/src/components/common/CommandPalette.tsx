import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types/task';
import {
  Search,
  LayoutDashboard,
  Sun,
  Inbox,
  CheckSquare,
  Sparkles,
  Calendar,
  GitBranch,
  Repeat,
  Network,
  Flame,
  Sliders,
  Target,
  BarChart3,
  History,
  Layers,
  Cpu,
  Bell,
  Settings,
  Activity,
  Plus,
  Play,
  ArrowRight
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Action' | 'Algorithm' | 'Task';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentPage,
    setIsQuickAddOpen,
    setSchedulingMode,
    tasks,
    setSelectedTask
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigationCommands: CommandItem[] = [
    { id: 'nav-dash', title: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => setCurrentPage('dashboard') },
    { id: 'nav-day', title: 'Go to My Day', category: 'Navigation', icon: Sun, action: () => setCurrentPage('my-day') },
    { id: 'nav-tasks', title: 'Go to All Tasks', category: 'Navigation', icon: CheckSquare, action: () => setCurrentPage('tasks') },
    { id: 'nav-sched', title: 'Open Smart Scheduler', category: 'Navigation', icon: Sparkles, action: () => setCurrentPage('scheduler') },
    { id: 'nav-heap', title: 'Launch Min Heap Visualizer', category: 'Navigation', icon: Layers, action: () => setCurrentPage('heap-visualizer') },
    { id: 'nav-cal', title: 'Open Calendar', category: 'Navigation', icon: Calendar, action: () => setCurrentPage('calendar') },
    { id: 'nav-time', title: 'Open Timeline & Gantt', category: 'Navigation', icon: GitBranch, action: () => setCurrentPage('timeline') },
    { id: 'nav-focus', title: 'Enter Focus Studio', category: 'Navigation', icon: Flame, action: () => setCurrentPage('focus') },
    { id: 'nav-analytics', title: 'View Analytics', category: 'Navigation', icon: BarChart3, action: () => setCurrentPage('analytics') },
    { id: 'nav-dep', title: 'View Dependency Graph', category: 'Navigation', icon: Network, action: () => setCurrentPage('dependencies') },
    { id: 'nav-diag', title: 'System Diagnostics', category: 'Navigation', icon: Activity, action: () => setCurrentPage('diagnostics') },
  ];

  const actionCommands: CommandItem[] = [
    { id: 'act-add', title: 'Create New Task', category: 'Action', icon: Plus, action: () => setIsQuickAddOpen(true), shortcut: 'N' },
    { id: 'act-focus', title: 'Start 25-Min Pomodoro Focus', category: 'Action', icon: Play, action: () => setCurrentPage('focus') },
    { id: 'act-mode-deadline', title: 'Algorithm: Switch to Deadline-First Mode', category: 'Algorithm', icon: Sparkles, action: () => setSchedulingMode('DEADLINE_FIRST') },
    { id: 'act-mode-priority', title: 'Algorithm: Switch to Priority-First Mode', category: 'Algorithm', icon: Sparkles, action: () => setSchedulingMode('PRIORITY_FIRST') },
    { id: 'act-mode-urgency', title: 'Algorithm: Switch to Smart Urgency Scoring', category: 'Algorithm', icon: Sparkles, action: () => setSchedulingMode('SMART_URGENCY') },
    { id: 'act-mode-balanced', title: 'Algorithm: Switch to Balanced Scheduling', category: 'Algorithm', icon: Sparkles, action: () => setSchedulingMode('BALANCED') },
  ];

  const taskCommands: CommandItem[] = tasks.map(t => ({
    id: `task-${t.id}`,
    title: `Task: ${t.title}`,
    category: 'Task',
    icon: CheckSquare,
    action: () => {
      setSelectedTask(t);
      setCurrentPage('tasks');
    }
  }));

  const allCommands = [...actionCommands, ...navigationCommands, ...taskCommands];

  const filtered = query.trim()
    ? allCommands.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          setIsCommandPaletteOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filtered, selectedIndex, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div
        className="w-full max-w-xl rounded-2xl glass-panel-elevated border border-titanium-accent/40 shadow-titanium-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="p-4 border-b border-titanium-border flex items-center gap-3">
          <Search className="w-5 h-5 text-titanium-accent" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, page, algorithm or task..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-titanium-text placeholder-titanium-text-muted"
          />
          <kbd className="px-2 py-0.5 rounded bg-titanium-surface border border-titanium-border text-[10px] font-mono text-titanium-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-titanium-text-muted">
              No matching commands or tasks found
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-titanium-hover text-titanium-text border border-titanium-accent/40 shadow-sm'
                      : 'text-titanium-text-secondary hover:bg-titanium-surface/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-titanium-electric' : 'text-titanium-steel'
                      }`}
                    />
                    <span className="font-medium text-titanium-text">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-titanium-surface text-titanium-text-muted border border-titanium-border">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-titanium-surface text-titanium-accent border border-titanium-border">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-titanium-accent" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-titanium-border bg-titanium-sidebar/60 flex items-center justify-between text-[11px] text-titanium-text-muted">
          <span>Navigate with ↑ ↓ · Press Enter to execute</span>
          <span className="font-mono text-titanium-accent">NEXORA C++ Core Engine</span>
        </div>
      </div>
    </div>
  );
};
