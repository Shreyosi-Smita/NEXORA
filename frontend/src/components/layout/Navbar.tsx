import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Command,
  Bell,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Home
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    setViewMode,
    currentPage,
    setCurrentPage,
    isSidebarCollapsed,
    setIsQuickAddOpen,
    setIsCommandPaletteOpen,
    globalSearch,
    setGlobalSearch,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    loadAllData,
    isLoading
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getBreadcrumb = () => {
    switch (currentPage) {
      case 'dashboard': return ['Overview', 'Command Center'];
      case 'my-day': return ['Overview', 'My Day Schedule'];
      case 'inbox': return ['Overview', 'Triage Inbox'];
      case 'tasks': return ['Overview', 'Task Inventory'];
      case 'scheduler': return ['Planning', 'Smart Min-Heap Scheduler'];
      case 'calendar': return ['Planning', 'Interactive Calendar'];
      case 'timeline': return ['Planning', 'Gantt Timeline & Dependencies'];
      case 'recurring': return ['Planning', 'Recurring Task Automations'];
      case 'dependencies': return ['Planning', 'DAG Dependency Network'];
      case 'focus': return ['Productivity', 'Focus Studio & Pomodoro'];
      case 'habits': return ['Productivity', 'Habit Tracker & Streaks'];
      case 'goals': return ['Productivity', 'Strategic Goals & Milestones'];
      case 'analytics': return ['Insights', 'Productivity Metrics & Velocity'];
      case 'activity': return ['Insights', 'System Activity & Audit Log'];
      case 'heap-visualizer': return ['DSA LAB', 'Live Min-Heap Binary Tree'];
      case 'algo-playground': return ['DSA LAB', 'Algorithm Simulator & Invariants'];
      case 'notifications': return ['System', 'Notification Center'];
      case 'settings': return ['System', 'Preferences & Integration'];
      case 'diagnostics': return ['System', 'C++ Backend Diagnostics'];
      default: return ['Overview', 'Dashboard'];
    }
  };

  const [section, pageTitle] = getBreadcrumb();

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-20 border-b border-titanium-border/80 bg-titanium-app/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-8 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Breadcrumbs + Home Return */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setViewMode('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-xs font-semibold text-titanium-text-secondary hover:text-titanium-text transition-colors"
          title="Return to 3D Landing Page"
        >
          <Home className="w-4 h-4 text-titanium-accent" />
          <span className="hidden sm:inline">Landing Showcase</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
          <span className="text-titanium-text-muted">{section}</span>
          <ChevronRight className="w-4 h-4 text-titanium-steel" />
          <span className="text-titanium-text font-bold text-base">{pageTitle}</span>
        </div>
      </div>

      {/* Center Global Search with improved readability */}
      <div className="hidden lg:flex items-center relative w-80 xl:w-96">
        <Search className="w-4 h-4 text-titanium-steel absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          placeholder="Search tasks, categories, algorithms..."
          className="w-full bg-titanium-surface/80 border border-titanium-border/80 focus:border-titanium-accent rounded-xl pl-10 pr-16 py-2 text-sm text-titanium-text placeholder-titanium-text-muted outline-none transition-all shadow-inner"
        />
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="absolute right-2 px-2 py-1 rounded-lg bg-titanium-elevated text-xs font-mono text-titanium-text-secondary border border-titanium-border flex items-center gap-1 hover:text-titanium-text transition-colors"
        >
          <Command className="w-3 h-3" /> K
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-3.5">
        {/* Refresh Sync */}
        <button
          onClick={() => loadAllData()}
          title="Synchronize state with C++ Min-Heap Engine"
          className="p-2.5 rounded-xl bg-titanium-surface border border-titanium-border text-titanium-text-secondary hover:text-titanium-text hover:border-titanium-accent/40 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-titanium-accent' : ''}`} />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            title="Notifications"
            className="p-2.5 rounded-xl bg-titanium-surface border border-titanium-border text-titanium-text-secondary hover:text-titanium-text hover:border-titanium-accent/40 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-semantic-error text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-88 rounded-2xl glass-panel-elevated p-4 shadow-titanium-lg z-50 border border-titanium-accent/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-titanium-border">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-titanium-text">Notifications</h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-titanium-surface text-titanium-accent">
                    {unreadCount} new
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-titanium-accent hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center text-titanium-text-muted py-4">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 rounded-xl text-xs transition-colors cursor-pointer border ${
                        n.isRead
                          ? 'bg-titanium-surface/40 border-titanium-border/40 text-titanium-text-muted'
                          : 'bg-titanium-elevated border-titanium-accent/30 text-titanium-text'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{n.title}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-titanium-accent"></span>}
                      </div>
                      <p className="text-xs mt-1 text-titanium-text-secondary leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  setIsNotifOpen(false);
                  setCurrentPage('notifications');
                }}
                className="w-full py-2 text-center text-xs font-medium text-titanium-accent hover:text-titanium-electric transition-colors"
              >
                View full Notification Center
              </button>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main font-bold text-xs shadow-glow-accent hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>
    </header>
  );
};
