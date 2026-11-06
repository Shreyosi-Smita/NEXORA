import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Inbox,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Check,
  Trash2
} from 'lucide-react';

export const InboxNotifications: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    clearNotifications,
    tasks,
    setSelectedTask
  } = useApp();

  const unread = notifications.filter(n => !n.isRead);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Inbox className="w-6 h-6 text-titanium-accent" /> Triage Inbox & Notification Center
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              {unread.length} Unread
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Incoming action items, scheduler alerts, and deadline proximity notices.
          </p>
        </div>

        {unread.length > 0 && (
          <button
            onClick={clearNotifications}
            className="px-4 py-2 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-xs font-semibold text-titanium-text transition-colors self-start"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-titanium-border/60">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-xs text-titanium-text-muted space-y-2">
            <Bell className="w-8 h-8 mx-auto text-titanium-steel opacity-40 mb-2" />
            <p>Your inbox is pristine. No pending alerts or notifications.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                n.isRead ? 'bg-titanium-main/20 hover:bg-titanium-surface/20' : 'bg-titanium-surface/60 hover:bg-titanium-hover/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                  n.type === 'deadline' ? 'bg-semantic-error/15 text-semantic-error' :
                  n.type === 'recommendation' ? 'bg-titanium-accent/15 text-titanium-electric' :
                  'bg-titanium-surface text-titanium-accent'
                }`}>
                  {n.type === 'deadline' ? <Clock className="w-4 h-4" /> :
                   n.type === 'recommendation' ? <Sparkles className="w-4 h-4" /> :
                   <Bell className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-titanium-text">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-titanium-accent animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-titanium-text-secondary leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] font-mono text-titanium-text-muted pt-1">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(n.id);
                    }}
                    className="p-1.5 rounded-lg text-titanium-steel hover:text-titanium-text transition-colors"
                    title="Mark Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
