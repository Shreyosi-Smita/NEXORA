import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';

export const FocusStudio: React.FC = () => {
  const {
    tasks,
    recommendedTask,
    completeTask,
    addFocusSession,
    focusSessions
  } = useApp();

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    recommendedTask ? recommendedTask.id : (pendingTasks[0]?.id || '')
  );

  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const activeTask = tasks.find(t => t.id === selectedTaskId) || recommendedTask;

  // Change mode durations
  const handleModeChange = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'pomodoro') setSecondsLeft(25 * 60);
    else if (newMode === 'shortBreak') setSecondsLeft(5 * 60);
    else setSecondsLeft(15 * 60);
  };

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      // Log session
      if (mode === 'pomodoro') {
        addFocusSession({
          taskId: activeTask?.id,
          taskTitle: activeTask?.title || 'General Focus Session',
          durationMinutes: 25,
          startedAt: Date.now() - 25 * 60 * 1000,
          isCompleted: true
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, mode, activeTask, addFocusSession]);

  const totalSeconds = mode === 'pomodoro' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-titanium-accent" /> Focus Studio & Pomodoro
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Deep Work Engine
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Distraction-free focus environment linked directly to your active C++ prioritized task.
          </p>
        </div>

        {/* Ambient Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(prev => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors self-start ${
            soundEnabled
              ? 'bg-titanium-accent/20 border-titanium-accent text-titanium-electric'
              : 'bg-titanium-surface border-titanium-border text-titanium-text-muted hover:text-titanium-text'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundEnabled ? 'Brown Noise Active' : 'Mute Ambient'}</span>
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="max-w-2xl mx-auto glass-panel-glow p-8 sm:p-12 rounded-3xl text-center space-y-8 relative overflow-hidden">
        {/* Soft background blue ambient spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-titanium-accent/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Mode Selector */}
        <div className="inline-flex p-1 rounded-2xl bg-titanium-main/80 border border-titanium-border text-xs font-semibold">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              mode === 'pomodoro'
                ? 'bg-titanium-accent text-titanium-main font-bold shadow-sm'
                : 'text-titanium-text-secondary hover:text-titanium-text'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              mode === 'shortBreak'
                ? 'bg-titanium-accent text-titanium-main font-bold shadow-sm'
                : 'text-titanium-text-secondary hover:text-titanium-text'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              mode === 'longBreak'
                ? 'bg-titanium-accent text-titanium-main font-bold shadow-sm'
                : 'text-titanium-text-secondary hover:text-titanium-text'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Circular SVG Timer Display */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#131F30]"
              strokeWidth="6"
              fill="none"
            />
            {/* Animated progress ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#6D9BCB] transition-all duration-500 ease-linear"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl font-extrabold font-mono text-titanium-text tracking-tighter">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-titanium-accent">
              {isActive ? 'Session In Progress' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Associated Task Pill */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-titanium-main/80 border border-titanium-border space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-titanium-text-muted">
            Target Focus Task
          </span>

          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="w-full bg-titanium-surface border border-titanium-border rounded-xl px-3 py-2 text-xs font-semibold text-titanium-text outline-none truncate"
          >
            {pendingTasks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} (Priority {t.priority})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsActive(prev => !prev)}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-titanium-accent to-titanium-accent-light text-titanium-main font-extrabold text-sm shadow-glow-accent hover:opacity-95 transition-all flex items-center gap-2.5"
          >
            {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? 'Pause Timer' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(totalSeconds);
            }}
            title="Reset Timer"
            className="p-3.5 rounded-2xl bg-titanium-surface border border-titanium-border text-titanium-text-secondary hover:text-titanium-text hover:bg-titanium-hover transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {activeTask && (
            <button
              onClick={() => completeTask(activeTask.id)}
              title="Complete Task"
              className="p-3.5 rounded-2xl bg-semantic-success/20 border border-semantic-success/40 text-semantic-success hover:bg-semantic-success/30 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Session Log */}
      <div className="max-w-2xl mx-auto glass-panel p-6 rounded-3xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-titanium-text-muted">
          Recent Focus Sessions ({focusSessions.length})
        </h3>

        {focusSessions.length === 0 ? (
          <p className="text-xs text-titanium-text-muted text-center py-4">No completed sessions logged yet today</p>
        ) : (
          <div className="space-y-2">
            {focusSessions.slice(0, 3).map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-titanium-surface border border-titanium-border flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-titanium-text">{s.taskTitle || 'Focus Session'}</p>
                  <p className="text-[10px] text-titanium-text-muted font-mono">
                    {new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="font-mono text-titanium-accent font-bold">+{s.durationMinutes}m logged</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
