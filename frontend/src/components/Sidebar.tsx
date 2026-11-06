import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  GitBranch,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Server
} from 'lucide-react';

export type NavTab = 'dashboard' | 'tasks' | 'calendar' | 'dsa' | 'analytics';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  backendConnected: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  backendConnected,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as NavTab, label: 'Task Manager', icon: CheckSquare },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: CalendarIcon },
    { id: 'dsa' as NavTab, label: 'DSA Explorer', icon: GitBranch },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#0B0F17] dark:bg-[#0B0F17] light:bg-slate-50
          border-r border-slate-800/80 dark:border-slate-800/80 light:border-slate-200
        `}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src="/nexora-icon.svg"
                alt="NEXORA"
                className="w-9 h-9 rounded-xl flex-shrink-0 shadow-lg shadow-emerald-500/20"
              />
              {!collapsed && (
                <div className="overflow-hidden">
                  <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent truncate block">
                    NEXORA
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 block truncate">
                    Own Your Time.
                  </span>
                </div>
              )}
            </div>

            {/* Collapse button (Desktop only) */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-100 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-200/60'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Server Status & Theme Switcher */}
        <div className="p-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 space-y-2">
          {/* C++ Backend Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-mono border ${
              backendConnected
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            } ${collapsed ? 'justify-center px-0' : ''}`}
            title={backendConnected ? 'C++ REST API Connected (Port 8080)' : 'C++ Backend Disconnected'}
          >
            <Server className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && (
              <span className="truncate">
                {backendConnected ? 'C++ Engine Live' : 'C++ Offline'}
              </span>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {!collapsed && <span>Light Theme</span>}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                {!collapsed && <span>Dark Theme</span>}
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

