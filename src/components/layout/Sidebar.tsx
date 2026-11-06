import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types/task';
import { NexoraLogo } from '../common/NexoraLogo';
import {
  LayoutDashboard,
  Sun,
  Inbox,
  CheckSquare,
  Sparkles,
  Calendar as CalendarIcon,
  GitBranch,
  Repeat,
  Network,
  Flame,
  Target,
  BarChart3,
  History,
  Layers,
  Cpu,
  Bell,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sliders,
  FolderDot
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    isSidebarCollapsed,
    toggleSidebar,
    tasks,
    notifications,
    dependencies,
  } = useApp();

  const pendingCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my-day', label: 'My Day Plan', icon: Sun },
        { id: 'inbox', label: 'Inbox', icon: Inbox, badge: unreadCount || undefined, badgeColor: 'bg-titanium-accent text-titanium-main' },
        { id: 'tasks', label: 'All Tasks', icon: CheckSquare, badge: pendingCount || undefined },
      ],
    },
    {
      title: 'Planning & Algorithms',
      items: [
        { id: 'scheduler', label: 'Smart Scheduler', icon: Sparkles, badge: 'C++ Heap', badgeColor: 'bg-titanium-steel/40 text-titanium-electric' },
        { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
        { id: 'timeline', label: 'Timeline & Gantt', icon: GitBranch },
        { id: 'recurring', label: 'Recurring Tasks', icon: Repeat },
        { id: 'dependencies', label: 'Dependencies', icon: Network, badge: dependencies.length || undefined },
      ],
    },
    {
      title: 'Productivity & Focus',
      items: [
        { id: 'focus', label: 'Focus Studio', icon: Flame },
        { id: 'habits', label: 'Habits & Streaks', icon: Sliders },
        { id: 'goals', label: 'Strategic Goals', icon: Target },
      ],
    },
    {
      title: 'Insights & DSA Lab',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'activity', label: 'Activity History', icon: History },
        { id: 'heap-visualizer', label: 'Min-Heap Lab', icon: Layers, badge: 'DSA', badgeColor: 'bg-titanium-accent/20 text-titanium-electric' },
      ],
    },
    {
      title: 'System & Telemetry',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'diagnostics', label: 'Diagnostics', icon: Activity, badge: 'C++', badgeColor: 'bg-semantic-success/20 text-semantic-success' },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-titanium-sidebar border-r border-titanium-border flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 px-4 flex items-center justify-between border-b border-titanium-border/80 bg-titanium-sidebar">
        {!isSidebarCollapsed ? (
          <NexoraLogo size="md" />
        ) : (
          <div className="mx-auto">
            <NexoraLogo size="sm" showText={false} />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-xl text-titanium-text-secondary hover:text-titanium-text hover:bg-titanium-surface transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace Switcher */}
      {!isSidebarCollapsed && (
        <div className="p-3 border-b border-titanium-border/60">
          <div className="p-2.5 rounded-2xl bg-titanium-surface/70 border border-titanium-border flex items-center justify-between text-xs cursor-pointer hover:border-titanium-accent/40 transition-colors shadow-sm">
            <div className="flex items-center gap-2.5 truncate">
              <FolderDot className="w-4 h-4 text-titanium-accent flex-shrink-0" />
              <div className="truncate">
                <p className="font-bold text-titanium-text truncate">Engineering Sprint</p>
                <p className="text-[11px] text-titanium-text-muted truncate">C++ DSA Core Engine</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-semantic-success shadow-[0_0_8px_#35D6A1] flex-shrink-0"></span>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map(sec => (
          <div key={sec.title} className="space-y-1.5">
            {!isSidebarCollapsed && (
              <h4 className="px-3 text-xs font-bold uppercase tracking-wider text-titanium-text-muted">
                {sec.title}
              </h4>
            )}
            <div className="space-y-1">
              {sec.items.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-titanium-surface text-titanium-text border border-titanium-accent/40 shadow-titanium font-bold'
                        : 'text-titanium-text-secondary hover:text-titanium-text hover:bg-titanium-hover/40'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-titanium-electric' : 'text-titanium-steel'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-titanium-surface text-titanium-text-secondary border border-titanium-border'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-titanium-border/80 bg-titanium-sidebar">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-titanium-surface/60 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-titanium-accent to-titanium-steel flex items-center justify-center font-bold text-xs text-titanium-main shadow-sm">
                AB
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-bold text-titanium-text truncate">Aarav Bhasin</p>
                <p className="text-xs text-titanium-text-muted truncate">Product Architect</p>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-semantic-success"></div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-titanium-accent to-titanium-steel flex items-center justify-center font-bold text-xs text-titanium-main">
              AB
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
