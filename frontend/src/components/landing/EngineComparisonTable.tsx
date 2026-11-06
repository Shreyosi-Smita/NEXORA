import React from 'react';
import { Check, X, Sparkles, Cpu, Layers, ShieldCheck } from 'lucide-react';

export const EngineComparisonTable: React.FC = () => {
  const comparisons = [
    {
      feature: 'Core Scheduling Engine',
      traditional: 'Static flat array or un-indexed database query',
      nexora: 'Native C++17 Zero-Based Min Heap with O(1) root peek',
      advantage: true,
    },
    {
      feature: 'Tie-Breaking Strategy',
      traditional: 'Arbitrary insertion order or manual dragging',
      nexora: 'Deterministic 4-tier: Deadline → Priority → CreatedAt → ID',
      advantage: true,
    },
    {
      feature: 'Dependency Management',
      traditional: 'Blind to circular loops, causing deadlock states',
      nexora: 'DAG solver with 3-color DFS cycle shield & Kahn sort',
      advantage: true,
    },
    {
      feature: 'Urgency Evaluation',
      traditional: 'Single static priority tag (High / Med / Low)',
      nexora: 'Continuous dynamic polynomial urgency scoring',
      advantage: true,
    },
    {
      feature: 'Rebalance Overhead',
      traditional: 'O(n log n) full database sorting per reload',
      nexora: 'O(log n) incremental sift-up & sift-down heapify',
      advantage: true,
    },
    {
      feature: 'Deep Work Alignment',
      traditional: 'Detached timer widgets with no active task linking',
      nexora: 'Integrated Focus Studio directly binding heap root task',
      advantage: true,
    },
  ];

  return (
    <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-8 border border-titanium-border/80 shadow-titanium-lg">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-titanium-accent">
          Architectural Rigor
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-titanium-text">
          Standard To-Do Lists vs. <span className="text-titanium-gradient">NEXORA 2.0 C++ Engine</span>
        </h3>
        <p className="text-sm text-titanium-text-secondary">
          Why engineering leaders and deep workers choose algorithmic task scheduling over basic CRUD checklists.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-titanium-border text-titanium-text-muted font-mono uppercase text-xs">
              <th className="py-4 px-4">Capability</th>
              <th className="py-4 px-4 text-titanium-text-muted">Generic Checklist Apps</th>
              <th className="py-4 px-4 text-titanium-electric font-bold">NEXORA 2.0 (C++ Core)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-titanium-border/60">
            {comparisons.map((c, i) => (
              <tr key={i} className="hover:bg-titanium-surface/40 transition-colors">
                <td className="py-4 px-4 font-bold text-titanium-text">{c.feature}</td>
                <td className="py-4 px-4 text-titanium-text-muted flex items-center gap-2">
                  <X className="w-4 h-4 text-semantic-error flex-shrink-0" />
                  <span>{c.traditional}</span>
                </td>
                <td className="py-4 px-4 text-titanium-text font-semibold">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-semantic-success flex-shrink-0 stroke-[3]" />
                    <span className="text-titanium-electric">{c.nexora}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
