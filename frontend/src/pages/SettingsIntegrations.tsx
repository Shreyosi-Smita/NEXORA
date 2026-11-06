import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Database,
  Moon,
  Bell,
  Clock,
  Shield,
  Keyboard,
  ExternalLink,
  Check,
  Save
} from 'lucide-react';

export const SettingsIntegrations: React.FC = () => {
  const [userName, setUserName] = useState(() => localStorage.getItem('nexora_user_name') || 'Workspace Member');
  const [email, setEmail] = useState(() => localStorage.getItem('nexora_user_email') || 'member@nexora.io');
  const [workingHours, setWorkingHours] = useState('8');
  const [pomodoroLength, setPomodoroLength] = useState('25');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nexora_user_name', userName);
    localStorage.setItem('nexora_user_email', email);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-titanium-accent" /> Settings & System Preferences
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Configuration
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Manage your developer workspace, appearance, scheduling defaults, and integration endpoints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Scheduling Configuration (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl space-y-5">
            <h3 className="text-sm font-bold text-titanium-text pb-2 border-b border-titanium-border">
              Profile & Workspace Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-titanium-text block mb-1">User Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full bg-titanium-surface border border-titanium-border rounded-xl px-3.5 py-2 text-xs text-titanium-text outline-none focus:border-titanium-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-titanium-text block mb-1">Primary Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-titanium-surface border border-titanium-border rounded-xl px-3.5 py-2 text-xs text-titanium-text outline-none focus:border-titanium-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-titanium-text block mb-1">Daily Work Window (Hours)</label>
                <input
                  type="number"
                  min="4"
                  max="16"
                  value={workingHours}
                  onChange={e => setWorkingHours(e.target.value)}
                  className="w-full bg-titanium-surface border border-titanium-border rounded-xl px-3.5 py-2 text-xs text-titanium-text outline-none focus:border-titanium-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-titanium-text block mb-1">Default Pomodoro Length (Mins)</label>
                <input
                  type="number"
                  min="15"
                  max="60"
                  step="5"
                  value={pomodoroLength}
                  onChange={e => setPomodoroLength(e.target.value)}
                  className="w-full bg-titanium-surface border border-titanium-border rounded-xl px-3.5 py-2 text-xs text-titanium-text outline-none focus:border-titanium-accent"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-titanium-border flex items-center justify-between">
              <span className="text-xs text-titanium-text-muted">Changes persist across sessions</span>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-titanium-accent text-titanium-main text-xs font-bold shadow-glow-accent hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaved ? 'Saved!' : 'Save Preferences'}
              </button>
            </div>
          </form>

          {/* Keyboard Shortcuts Cheat Sheet */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-titanium-accent" /> Keyboard Shortcuts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-titanium-surface border border-titanium-border flex justify-between items-center">
                <span className="text-titanium-text-secondary">Global Command Palette</span>
                <kbd className="px-2 py-0.5 rounded bg-titanium-elevated text-titanium-accent border border-titanium-border">⌘ + K</kbd>
              </div>

              <div className="p-3 rounded-xl bg-titanium-surface border border-titanium-border flex justify-between items-center">
                <span className="text-titanium-text-secondary">Quick Add Task</span>
                <kbd className="px-2 py-0.5 rounded bg-titanium-elevated text-titanium-accent border border-titanium-border">N</kbd>
              </div>

              <div className="p-3 rounded-xl bg-titanium-surface border border-titanium-border flex justify-between items-center">
                <span className="text-titanium-text-secondary">Toggle Sidebar</span>
                <kbd className="px-2 py-0.5 rounded bg-titanium-elevated text-titanium-accent border border-titanium-border">⌘ + B</kbd>
              </div>

              <div className="p-3 rounded-xl bg-titanium-surface border border-titanium-border flex justify-between items-center">
                <span className="text-titanium-text-secondary">Refresh C++ Engine</span>
                <kbd className="px-2 py-0.5 rounded bg-titanium-elevated text-titanium-accent border border-titanium-border">R</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database & Service Integrations */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Database className="w-4 h-4 text-titanium-accent" /> Infrastructure & DB
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-titanium-surface border border-titanium-border space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-titanium-text">C++ Crow Engine</span>
                  <span className="text-[10px] font-mono font-bold text-semantic-success flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse" /> Active (Port 8081)
                  </span>
                </div>
                <p className="text-[11px] text-titanium-text-secondary">
                  Native zero-based vector Min-Heap scheduling server.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-titanium-surface border border-titanium-border space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-titanium-text">PostgreSQL / Supabase</span>
                  <span className="text-[10px] font-mono text-titanium-electric">
                    Schema Ready (DDL V1)
                  </span>
                </div>
                <p className="text-[11px] text-titanium-text-secondary">
                  Relational tables defined in <code className="text-titanium-accent">database/migrations/</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-titanium-surface border border-titanium-border space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-titanium-text">Visual Identity System</span>
                  <span className="text-[10px] font-mono text-titanium-accent font-bold">
                    Titanium Blue 2.0
                  </span>
                </div>
                <p className="text-[11px] text-titanium-text-secondary">
                  Deep obsidian-blue surfaces with metallic blue & electric highlight tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
