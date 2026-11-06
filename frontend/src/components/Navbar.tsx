import React from 'react';
import { Menu, Plus, RefreshCw, Server } from 'lucide-react';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickAdd: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  backendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onOpenQuickAdd,
  onRefresh,
  isLoading,
  backendConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/80 dark:border-slate-800/80 bg-[#0B0F17]/85 dark:bg-[#0B0F17]/85 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            C++ DSA Engine Port 8080
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Server status pill */}
        <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
          <Server className={`w-3.5 h-3.5 ${backendConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="hidden md:inline">{backendConnected ? 'Connected (C++ Engine)' : 'Disconnected'}</span>
        </div>

        {/* Manual refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh tasks from C++ backend"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Quick Add CTA */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};

