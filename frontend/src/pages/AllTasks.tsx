import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Priority, TaskStatus } from '../types/task';
import {
  List,
  LayoutGrid,
  Columns3,
  Table as TableIcon,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
  MoreVertical,
  Check
} from 'lucide-react';

type ViewMode = 'list' | 'grid' | 'kanban' | 'table';

export const AllTasks: React.FC = () => {
  const {
    tasks,
    deleteTask,
    completeTask,
    setSelectedTask,
    setIsQuickAddOpen,
    globalSearch,
    setGlobalSearch
  } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'createdAt'>('deadline');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && t.priority.toString() !== priorityFilter) return false;
        if (categoryFilter !== 'all' && (t.categoryId || 'General') !== categoryFilter) return false;
        if (globalSearch.trim()) {
          const q = globalSearch.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = (t.description || '').toLowerCase().includes(q);
          const matchCat = (t.categoryId || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') return a.deadline - b.deadline;
        if (sortBy === 'priority') return a.priority - b.priority;
        return b.createdAt - a.createdAt;
      });
  }, [tasks, statusFilter, priorityFilter, categoryFilter, globalSearch, sortBy]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map(t => t.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = async () => {
    for (const id of selectedIds) {
      await completeTask(id);
    }
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} tasks from C++ backend?`)) return;
    for (const id of selectedIds) {
      await deleteTask(id);
    }
    setSelectedIds([]);
  };

  // Kanban Columns
  const kanbanColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'PENDING', label: 'Pending in Heap', color: 'text-titanium-accent' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-semantic-info' },
    { id: 'COMPLETED', label: 'Completed', color: 'text-semantic-success' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-titanium-text">All Tasks Repository</h1>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Browse, filter, and inspect tasks stored in the C++ memory space ({tasks.length} total).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-titanium-surface border border-titanium-border">
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-steel hover:text-titanium-text'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-steel hover:text-titanium-text'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              title="Kanban Board"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-steel hover:text-titanium-text'
              }`}
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-steel hover:text-titanium-text'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main text-xs font-bold shadow-glow-accent hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filter and Bulk Actions Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-titanium-surface border border-titanium-border rounded-xl px-3 py-1.5 text-titanium-text outline-none text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-titanium-surface border border-titanium-border rounded-xl px-3 py-1.5 text-titanium-text outline-none text-xs"
          >
            <option value="all">All Priorities</option>
            <option value="1">P1 High</option>
            <option value="2">P2 Medium</option>
            <option value="3">P3 Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-titanium-surface border border-titanium-border rounded-xl px-3 py-1.5 text-titanium-text outline-none text-xs"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="priority">Sort by Priority</option>
            <option value="createdAt">Sort by Newest</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-titanium-accent font-bold">{selectedIds.length} selected</span>
            <button
              onClick={handleBulkComplete}
              className="px-3 py-1.5 rounded-xl bg-semantic-success/20 text-semantic-success border border-semantic-success/30 font-semibold"
            >
              Complete Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-xl bg-semantic-error/20 text-semantic-error border border-semantic-error/30 font-semibold"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Main Content Renderers based on ViewMode */}
      {filteredTasks.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <p className="text-sm font-semibold text-titanium-text">No matching tasks found</p>
          <p className="text-xs text-titanium-text-muted">
            Try adjusting your search query or filters, or add a new task.
          </p>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-4 py-2 rounded-xl bg-titanium-accent text-titanium-main text-xs font-bold"
          >
            Create Task
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-titanium-border/60">
          {filteredTasks.map(task => {
            const isCompleted = task.status === 'COMPLETED';
            const isSelected = selectedIds.includes(task.id);

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-titanium-hover/60' : 'hover:bg-titanium-surface/40'
                } ${isCompleted ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3.5 truncate">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={e => toggleSelectOne(task.id, e)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-titanium-border text-titanium-accent bg-titanium-surface focus:ring-0"
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTask(task.id);
                    }}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-semantic-success border-semantic-success text-titanium-main'
                        : 'border-titanium-border text-transparent hover:border-titanium-accent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="truncate">
                    <p className={`text-xs font-semibold text-titanium-text truncate ${isCompleted ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-titanium-text-muted mt-0.5 truncate">
                      {task.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    task.priority === 1 ? 'bg-semantic-error/20 text-semantic-error' :
                    task.priority === 2 ? 'bg-semantic-warning/20 text-semantic-warning' : 'bg-titanium-accent/20 text-titanium-electric'
                  }`}>
                    P{task.priority}
                  </span>

                  <span className="text-titanium-text-muted text-[11px] hidden sm:inline">
                    {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="p-1 rounded-lg text-titanium-steel hover:text-semantic-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="p-5 rounded-2xl glass-panel hover:border-titanium-accent/50 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    task.priority === 1 ? 'bg-semantic-error/20 text-semantic-error' :
                    task.priority === 2 ? 'bg-semantic-warning/20 text-semantic-warning' : 'bg-titanium-accent/20 text-titanium-electric'
                  }`}>
                    Priority {task.priority}
                  </span>
                  <span className="text-[10px] font-mono text-titanium-text-muted">{task.status}</span>
                </div>

                <h3 className="text-sm font-bold text-titanium-text leading-snug">{task.title}</h3>
                <p className="text-xs text-titanium-text-secondary line-clamp-2">
                  {task.description || 'No description'}
                </p>
              </div>

              <div className="pt-3 border-t border-titanium-border/80 flex items-center justify-between text-[11px] font-mono text-titanium-text-muted">
                <span>Due: {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                <span className="text-titanium-accent font-semibold">{task.estimatedMinutes}m</span>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="glass-panel p-4 rounded-3xl space-y-3 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-titanium-border">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.label}
                  </h3>
                  <span className="text-xs font-mono font-bold text-titanium-text px-2 py-0.5 rounded-lg bg-titanium-surface">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3.5 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          task.priority === 1 ? 'bg-semantic-error/20 text-semantic-error' :
                          task.priority === 2 ? 'bg-semantic-warning/20 text-semantic-warning' : 'bg-titanium-accent/20 text-titanium-electric'
                        }`}>
                          P{task.priority}
                        </span>
                        <span className="text-[10px] font-mono text-titanium-text-muted">
                          {task.estimatedMinutes}m
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-titanium-text">{task.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel rounded-3xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-titanium-surface/80 border-b border-titanium-border text-[11px] font-mono uppercase text-titanium-text-muted">
              <tr>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Deadline</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-titanium-border/60">
              {filteredTasks.map(task => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-titanium-surface/40 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 font-semibold text-titanium-text">{task.title}</td>
                  <td className="p-3.5 font-mono text-[11px]">{task.status}</td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      task.priority === 1 ? 'bg-semantic-error/20 text-semantic-error' :
                      task.priority === 2 ? 'bg-semantic-warning/20 text-semantic-warning' : 'bg-titanium-accent/20 text-titanium-electric'
                    }`}>
                      P{task.priority}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-titanium-text-secondary text-[11px]">
                    {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5 text-titanium-text-muted">{task.categoryId || 'General'}</td>
                  <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-titanium-steel hover:text-semantic-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
