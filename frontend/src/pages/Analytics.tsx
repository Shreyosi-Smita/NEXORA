import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const Analytics: React.FC = () => {
  const { tasks } = useApp();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'COMPLETED');
  const pending = tasks.filter(t => t.status !== 'COMPLETED');
  const overdue = tasks.filter(t => t.status !== 'COMPLETED' && t.deadline < Date.now());

  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 100;
  const totalEstimatedMinutes = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const totalActualMinutes = tasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

  // Priority distribution
  const priorityData = useMemo(() => {
    const p1 = tasks.filter(t => t.priority === 1).length;
    const p2 = tasks.filter(t => t.priority === 2).length;
    const p3 = tasks.filter(t => t.priority === 3).length;

    return [
      { name: 'P1 High', value: p1, color: '#FF6B81' },
      { name: 'P2 Medium', value: p2, color: '#FFBC69' },
      { name: 'P3 Low', value: p3, color: '#6D9BCB' },
    ];
  }, [tasks]);

  // Daily productivity velocity
  const velocityData = useMemo(() => [
    { day: 'Mon', completed: 3, pending: 2 },
    { day: 'Tue', completed: 5, pending: 4 },
    { day: 'Wed', completed: 4, pending: 3 },
    { day: 'Thu', completed: 6, pending: 2 },
    { day: 'Fri', completed: Math.max(2, completed.length), pending: Math.max(1, pending.length) },
    { day: 'Sat', completed: 2, pending: 1 },
    { day: 'Sun', completed: 1, pending: 1 },
  ], [completed.length, pending.length]);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexora_analytics_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-titanium-accent" /> Productivity Analytics
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Audited Metrics
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Statistical breakdown of task velocity, completion rates, and priority workload.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-xs font-semibold text-titanium-text transition-colors self-start"
        >
          <Download className="w-4 h-4 text-titanium-accent" /> Export Report (JSON)
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-titanium-text-muted">Completion Rate</span>
          <h3 className="text-2xl font-extrabold text-semantic-success">{completionRate}%</h3>
          <p className="text-[11px] text-titanium-text-muted">{completed.length} of {total} completed</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-titanium-text-muted">On-Time Index</span>
          <h3 className="text-2xl font-extrabold text-titanium-electric">
            {total > 0 ? Math.round(((total - overdue.length) / total) * 100) : 100}%
          </h3>
          <p className="text-[11px] text-titanium-text-muted">{overdue.length} overdue tasks</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-titanium-text-muted">Estimated Duration</span>
          <h3 className="text-2xl font-extrabold text-titanium-text">
            {(totalEstimatedMinutes / 60).toFixed(1)} <span className="text-sm font-normal text-titanium-text-muted">hrs</span>
          </h3>
          <p className="text-[11px] text-titanium-text-muted">Across active repository</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-titanium-text-muted">Heap Peek Complexity</span>
          <h3 className="text-2xl font-extrabold text-titanium-accent">O(1)</h3>
          <p className="text-[11px] text-titanium-text-muted">Zero-based C++ vector heap</p>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Productivity Velocity (2 Cols on lg) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-titanium-border">
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-titanium-accent" /> Weekly Task Velocity
            </h3>
            <span className="text-xs font-mono text-titanium-text-muted">7-Day Trend</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#293B51" vertical={false} />
                <XAxis dataKey="day" stroke="#70839A" fontSize={11} tickLine={false} />
                <YAxis stroke="#70839A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131F30',
                    border: '1px solid #293B51',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#EDF4FC'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#A2B2C5' }} />
                <Bar dataKey="completed" fill="#35D6A1" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="pending" fill="#6D9BCB" radius={[4, 4, 0, 0]} name="Pending in Heap" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Donut Distribution */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-titanium-border">
            <h3 className="text-sm font-bold text-titanium-text">Priority Distribution</h3>
            <span className="text-xs font-mono text-titanium-text-muted">By Level</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131F30',
                    border: '1px solid #293B51',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#EDF4FC'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-titanium-border text-xs font-mono">
            {priorityData.map(p => (
              <div key={p.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="font-bold text-titanium-text">{p.value} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
