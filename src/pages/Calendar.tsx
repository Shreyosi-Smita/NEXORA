import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types/task';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { tasks, setSelectedTask, setIsQuickAddOpen } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group tasks by day of current month
  const tasksByDay = useMemo(() => {
    const map: Record<number, Task[]> = {};
    for (let d = 1; d <= 31; d++) map[d] = [];

    tasks.forEach(task => {
      const d = new Date(task.deadline);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!map[dayNum]) map[dayNum] = [];
        map[dayNum].push(task);
      }
    });
    return map;
  }, [tasks, year, month]);

  const selectedDayTasks = tasksByDay[selectedDay] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-titanium-accent" /> Interactive Calendar
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Deterministic Deadlines
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Temporal distribution of deadlines mapped directly from the C++ Min-Heap engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-titanium-surface border border-titanium-border text-xs font-semibold">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-titanium-steel hover:text-titanium-text hover:bg-titanium-hover"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-titanium-text">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-titanium-steel hover:text-titanium-text hover:bg-titanium-hover"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main text-xs font-bold shadow-glow-accent hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Schedule Task
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Month Grid (Left) & Selected Day Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Month View Matrix (3 Cols on lg) */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-3xl space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold uppercase text-titanium-text-muted pb-2 border-b border-titanium-border">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset boxes */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-24 sm:h-28 rounded-2xl bg-titanium-main/30 opacity-40 border border-transparent" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayTasks = tasksByDay[day] || [];
              const isSelected = selectedDay === day;
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-24 sm:h-28 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-titanium-hover border-titanium-accent shadow-titanium'
                      : isToday
                      ? 'bg-titanium-surface border-titanium-accent/60'
                      : 'bg-titanium-surface/60 border-titanium-border hover:border-titanium-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                      isToday ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-text'
                    }`}>
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-titanium-main text-titanium-accent border border-titanium-border">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Micro task pills */}
                  <div className="space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className="truncate text-[10px] font-medium px-1.5 py-0.5 rounded bg-titanium-main/80 text-titanium-text border border-titanium-border/80"
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] font-mono text-titanium-text-muted px-1">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Panel (1 Col on lg) */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="pb-3 border-b border-titanium-border">
            <h3 className="text-sm font-bold text-titanium-text">
              {monthNames[month]} {selectedDay}, {year}
            </h3>
            <p className="text-xs text-titanium-text-muted mt-0.5">
              {selectedDayTasks.length} task(s) due on this date
            </p>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div className="py-16 text-center text-xs text-titanium-text-muted space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-titanium-steel opacity-50" />
              <p>No deadlines scheduled for this date.</p>
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="text-xs text-titanium-accent hover:underline font-semibold"
              >
                + Add task for {monthNames[month]} {selectedDay}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {selectedDayTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="p-3 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      t.priority === 1 ? 'bg-semantic-error/20 text-semantic-error' :
                      t.priority === 2 ? 'bg-semantic-warning/20 text-semantic-warning' : 'bg-titanium-accent/20 text-titanium-electric'
                    }`}>
                      P{t.priority}
                    </span>
                    <span className="text-[10px] font-mono text-titanium-text-muted">
                      {new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-titanium-text">{t.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
