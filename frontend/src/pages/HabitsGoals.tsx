import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Target,
  Plus,
  Check,
  TrendingUp,
  Sparkles,
  Award,
  Calendar,
  Layers
} from 'lucide-react';

export const HabitsGoals: React.FC = () => {
  const {
    habits,
    toggleHabitToday,
    createHabit,
    goals,
    createGoal,
    updateGoalProgress
  } = useApp();

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCat, setNewHabitCat] = useState('Engineering');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCat, setNewGoalCat] = useState('Productivity');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    createHabit(newHabitTitle.trim(), newHabitCat);
    setNewHabitTitle('');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    createGoal(newGoalTitle.trim(), newGoalCat);
    setNewGoalTitle('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-semantic-warning" /> Habits & Strategic Goals
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-accent">
              Long-Term Velocity
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Build compounding momentum through daily streaks and milestone objectives.
          </p>
        </div>
      </div>

      {/* Habits Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-titanium-text flex items-center gap-2">
            <Flame className="w-4 h-4 text-semantic-warning" /> Daily Habit Streaks
          </h2>
          <span className="text-xs font-mono text-titanium-text-muted">{habits.length} habits tracked</span>
        </div>

        {/* Quick Add Habit Bar */}
        <form onSubmit={handleCreateHabit} className="glass-panel p-3 rounded-2xl flex gap-2">
          <input
            type="text"
            value={newHabitTitle}
            onChange={e => setNewHabitTitle(e.target.value)}
            placeholder="Add new daily habit (e.g. 45-min Deep Focus Block)..."
            className="flex-1 bg-titanium-surface border border-titanium-border rounded-xl px-3 py-1.5 text-xs text-titanium-text outline-none focus:border-titanium-accent"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-titanium-accent text-titanium-main font-bold text-xs shadow-sm hover:opacity-95"
          >
            Add Habit
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {habits.map(habit => {
            const isCompletedToday = habit.completedDates.includes(todayStr);

            return (
              <div
                key={habit.id}
                className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-titanium-surface text-titanium-text-muted border border-titanium-border">
                      {habit.category}
                    </span>

                    <span className="flex items-center gap-1 text-xs font-bold text-semantic-warning">
                      <Flame className="w-4 h-4 fill-current" /> {habit.streak} days
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-titanium-text">{habit.title}</h3>
                </div>

                {/* 14-Day Micro Grid Preview */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-titanium-text-muted">Recent Activity</span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const active = i < Math.min(14, habit.streak);
                      return (
                        <div
                          key={i}
                          className={`h-4 flex-1 rounded-sm ${
                            active ? 'bg-semantic-warning' : 'bg-titanium-surface border border-titanium-border/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => toggleHabitToday(habit.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isCompletedToday
                      ? 'bg-semantic-success text-titanium-main'
                      : 'bg-titanium-surface border border-titanium-border text-titanium-text hover:border-titanium-accent/40'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isCompletedToday ? 'Completed Today!' : 'Check In Today'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals Section */}
      <div className="space-y-4 pt-4 border-t border-titanium-border/80">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-titanium-text flex items-center gap-2">
            <Target className="w-4 h-4 text-titanium-accent" /> Strategic Goals & Sprints
          </h2>
          <span className="text-xs font-mono text-titanium-text-muted">{goals.length} active objectives</span>
        </div>

        {/* Quick Add Goal Bar */}
        <form onSubmit={handleCreateGoal} className="glass-panel p-3 rounded-2xl flex gap-2">
          <input
            type="text"
            value={newGoalTitle}
            onChange={e => setNewGoalTitle(e.target.value)}
            placeholder="Add new milestone goal (e.g. Master Min-Heap & Dijkstra in C++)..."
            className="flex-1 bg-titanium-surface border border-titanium-border rounded-xl px-3 py-1.5 text-xs text-titanium-text outline-none focus:border-titanium-accent"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-titanium-accent text-titanium-main font-bold text-xs shadow-sm hover:opacity-95"
          >
            Create Goal
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => (
            <div
              key={goal.id}
              className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-titanium-surface text-titanium-text-muted border border-titanium-border">
                    {goal.category}
                  </span>
                  <span className="text-titanium-accent font-bold">{goal.progress}%</span>
                </div>

                <h3 className="text-sm font-bold text-titanium-text">{goal.title}</h3>
                <p className="text-xs text-titanium-text-secondary leading-relaxed">
                  {goal.description || 'Target milestone aligned with system goals.'}
                </p>
              </div>

              {/* Progress Bar & Slider */}
              <div className="space-y-2">
                <div className="w-full h-2 rounded-full bg-titanium-main overflow-hidden border border-titanium-border">
                  <div
                    className="h-full bg-gradient-to-r from-titanium-accent to-titanium-electric transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-titanium-text-muted">
                  <span>Progress Slider</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={goal.progress}
                    onChange={e => updateGoalProgress(goal.id, parseInt(e.target.value, 10))}
                    className="w-24 accent-[#6D9BCB] h-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
