import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Activity,
  Server,
  Cpu,
  Layers,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal
} from 'lucide-react';

export const SystemDiagnostics: React.FC = () => {
  const { diagnostics, loadAllData, tasks } = useApp();
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const measureLatency = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await api.getHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
    } catch {
      setLatency(null);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    measureLatency();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-semantic-success" /> System Diagnostics & C++ Core Health
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-semantic-success/20 text-semantic-success border border-semantic-success/30">
              Live Engine Connected
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Real-time telemetry, heap memory layout, latency benchmark, and native process diagnostics.
          </p>
        </div>

        <button
          onClick={() => {
            loadAllData();
            measureLatency();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-xs font-semibold text-titanium-text transition-colors self-start"
        >
          <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin text-titanium-accent' : ''}`} />
          Run Ping & Sync Benchmark
        </button>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-titanium-text-muted flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-titanium-accent" /> API Port
          </span>
          <h3 className="text-2xl font-extrabold text-titanium-text">
            {diagnostics?.port || 8081}
          </h3>
          <p className="text-[11px] text-titanium-text-muted">POSIX / BSD Socket Layer</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-titanium-text-muted flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-semantic-success" /> API Latency
          </span>
          <h3 className="text-2xl font-extrabold text-semantic-success font-mono">
            {latency !== null ? `${latency} ms` : 'Measuring...'}
          </h3>
          <p className="text-[11px] text-titanium-text-muted">Round-trip HTTP benchmark</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-titanium-text-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-titanium-electric" /> Min-Heap Elements
          </span>
          <h3 className="text-2xl font-extrabold text-titanium-electric font-mono">
            {diagnostics?.activeHeapQueueSize || 0}
          </h3>
          <p className="text-[11px] text-titanium-text-muted">Nodes in priority tree</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-titanium-text-muted flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-titanium-accent" /> Cycle Detector
          </span>
          <h3 className="text-base font-extrabold text-titanium-text font-mono truncate">
            {diagnostics?.cycleDetector || '3-Color DFS Machine'}
          </h3>
          <p className="text-[11px] text-semantic-success">State: 0=White, 1=Gray, 2=Black</p>
        </div>
      </div>

      {/* Detailed Technical Specs Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
          <Terminal className="w-4 h-4 text-titanium-accent" /> Engine Specifications & Invariants
        </h3>

        <div className="divide-y divide-titanium-border/60 text-xs font-mono">
          <div className="py-3 flex justify-between">
            <span className="text-titanium-text-muted">Core Language & Standard</span>
            <span className="text-titanium-text font-bold">C++17 (Clang Target arm64-apple-darwin)</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-titanium-text-muted">Memory Allocation</span>
            <span className="text-titanium-text font-bold">std::vector&lt;nexora::Task&gt; Contiguous Buffer</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-titanium-text-muted">Root Peek Complexity</span>
            <span className="text-semantic-success font-bold">O(1) Direct Index [0]</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-titanium-text-muted">Insertion / Sift-Up Complexity</span>
            <span className="text-titanium-accent font-bold">O(log n)</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-titanium-text-muted">Extract Min / Sift-Down Complexity</span>
            <span className="text-titanium-accent font-bold">O(log n)</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-titanium-text-muted">Total Ingested Tasks in Memory</span>
            <span className="text-titanium-electric font-bold">{tasks.length} tasks</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-titanium-text-muted">Server Timestamp</span>
            <span className="text-titanium-text font-bold">
              {diagnostics?.currentTimeMs ? new Date(diagnostics.currentTimeMs).toISOString() : 'Synchronized'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
