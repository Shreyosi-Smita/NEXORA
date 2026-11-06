import React, { useState } from 'react';
import { NexoraLogo } from '../components/common/NexoraLogo';
import { Interactive3DHero } from '../components/landing/Interactive3DHero';
import { HeroCanvasBackground } from '../components/landing/HeroCanvasBackground';
import { ArchitectureCodeViewer } from '../components/landing/ArchitectureCodeViewer';
import { InteractiveTreeLab } from '../components/landing/InteractiveTreeLab';
import { EngineComparisonTable } from '../components/landing/EngineComparisonTable';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Network,
  Clock,
  CheckCircle2,
  BarChart3,
  Flame,
  Calendar,
  GitBranch,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Plus,
  ArrowDown,
  Lock,
  Workflow,
  Target,
  Sliders,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  backendPort?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, backendPort = 8081 }) => {
  const [activeAlgo, setActiveAlgo] = useState<'EDF' | 'HPF' | 'URGENCY' | 'BALANCED'>('EDF');

  return (
    <div className="relative min-h-screen bg-titanium-main text-titanium-text font-sans selection:bg-titanium-accent/30 selection:text-titanium-electric overflow-x-hidden">
      {/* Dynamic 60fps Star/Particle Constellation Canvas */}
      <HeroCanvasBackground />

      {/* Isometric Grid Background Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#293b5118_1px,transparent_1px),linear-gradient(to_bottom,#293b5118_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Sticky High-End Top Navigation */}
      <header className="sticky top-0 z-50 h-20 px-6 md:px-12 backdrop-blur-xl bg-titanium-main/80 border-b border-titanium-border/80 flex items-center justify-between">
        <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <NexoraLogo size="md" />
        </div>

        {/* Center Nav Anchors */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-titanium-text-secondary">
          <a href="#core-engine" className="hover:text-titanium-text transition-colors">Core Engine</a>
          <a href="#dsa-lab" className="hover:text-titanium-text transition-colors">DSA Tree Lab</a>
          <a href="#product-suite" className="hover:text-titanium-text transition-colors">Product Suite</a>
          <a href="#code-specs" className="hover:text-titanium-text transition-colors">C++ Code Specs</a>
          <a href="#comparison" className="hover:text-titanium-text transition-colors">Comparison</a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-titanium-surface border border-titanium-border text-xs font-mono text-titanium-text-secondary shadow-inner">
            <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse" />
            <span>C++ Port {backendPort} Online</span>
          </div>

          <button
            onClick={onEnterApp}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-titanium-accent via-titanium-accent-light to-titanium-electric text-titanium-main font-extrabold text-sm shadow-glow-accent hover:opacity-95 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-16 md:pt-24 pb-16 max-w-7xl mx-auto text-center space-y-10">
        {/* Soft Background Auroras */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-r from-titanium-accent/15 via-titanium-electric/25 to-titanium-surface/20 rounded-full blur-[140px] -z-10 pointer-events-none" />

        {/* Hero Tagline Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel-elevated border border-titanium-accent/40 text-xs sm:text-sm font-mono text-titanium-electric shadow-titanium">
          <Sparkles className="w-4 h-4 text-titanium-accent" />
          <span>NEXORA 2.0 · C++17 Core Engine Online · Invariant Guaranteed</span>
        </div>

        {/* Main High-Impact Typography */}
        <div className="space-y-6 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-titanium-text">
            Own Your Time. <br />
            <span className="text-titanium-gradient">Plan Smarter. Execute Deterministically.</span>
          </h1>

          <p className="text-base sm:text-xl text-titanium-text-secondary max-w-3xl mx-auto font-normal leading-relaxed">
            The high-performance productivity platform engineered around a custom C++ Min-Heap engine and directed acyclic graph (DAG) dependency solver.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-titanium-accent to-titanium-electric text-titanium-main font-extrabold text-base shadow-glow-accent hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
          >
            <span>Enter Productivity Workspace</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <a
            href="#dsa-lab"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-panel-elevated border border-titanium-border hover:border-titanium-accent/50 text-titanium-text font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Cpu className="w-5 h-5 text-titanium-accent" />
            <span>Launch Live DSA Tree Lab</span>
          </a>
        </div>

        {/* 4 Stat Callout Metrics Floating under Hero */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
          <div className="p-4 rounded-2xl glass-panel border border-titanium-border/80">
            <span className="text-[10px] font-mono uppercase text-titanium-text-muted flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-titanium-accent" /> Latency
            </span>
            <p className="text-2xl font-black text-titanium-text mt-1">&lt; 20 &mu;s</p>
            <p className="text-[11px] text-titanium-text-muted">Heapify sift benchmark</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-titanium-border/80">
            <span className="text-[10px] font-mono uppercase text-titanium-text-muted flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-semantic-success" /> Complexity
            </span>
            <p className="text-2xl font-black text-semantic-success mt-1">O(1)</p>
            <p className="text-[11px] text-titanium-text-muted">Root peek access</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-titanium-border/80">
            <span className="text-[10px] font-mono uppercase text-titanium-text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-titanium-electric" /> DAG Safety
            </span>
            <p className="text-2xl font-black text-titanium-electric mt-1">3-Color</p>
            <p className="text-[11px] text-titanium-text-muted">DFS cycle detection</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-titanium-border/80">
            <span className="text-[10px] font-mono uppercase text-titanium-text-muted flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5 text-titanium-accent" /> Modules
            </span>
            <p className="text-2xl font-black text-titanium-text mt-1">16</p>
            <p className="text-[11px] text-titanium-text-muted">Unified workspace views</p>
          </div>
        </div>

        {/* 3D Interactive Hero Experience */}
        <div className="pt-8">
          <Interactive3DHero onLaunchApp={onEnterApp} />
        </div>
      </section>

      {/* Section 1: The 4 Algorithmic Modes in Action */}
      <section id="core-engine" className="px-6 md:px-12 py-24 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-titanium-accent">
            Continuous Computing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-titanium-text tracking-tight">
            Deterministic Decision Making. <br />
            <span className="text-accent-gradient">Not Basic To-Do Lists.</span>
          </h2>
          <p className="text-sm sm:text-base text-titanium-text-secondary leading-relaxed">
            Every task recommendation is continuously computed using deterministic tie-breaking:
            Earliest Deadline &rarr; Highest Priority &rarr; Earlier Creation &rarr; Task ID.
          </p>
        </div>

        {/* Algorithmic Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div
            onClick={() => setActiveAlgo('EDF')}
            className={`p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer space-y-3 ${
              activeAlgo === 'EDF'
                ? 'bg-titanium-elevated border-titanium-accent shadow-titanium-lg scale-[1.02]'
                : 'glass-panel border-titanium-border hover:border-titanium-accent/40'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-titanium-accent shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">Deadline-First (EDF)</h3>
            <p className="text-xs text-titanium-text-secondary leading-relaxed">
              Earliest deadline sits at the root of the zero-based Min Heap. Prevents missed deadlines with strict priority tie-breaking.
            </p>
            <span className="text-xs font-mono font-bold text-titanium-electric block pt-2">
              Complexity: O(1) Root Peek
            </span>
          </div>

          <div
            onClick={() => setActiveAlgo('HPF')}
            className={`p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer space-y-3 ${
              activeAlgo === 'HPF'
                ? 'bg-titanium-elevated border-titanium-accent shadow-titanium-lg scale-[1.02]'
                : 'glass-panel border-titanium-border hover:border-titanium-accent/40'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-semantic-error shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">Priority-First (HPF)</h3>
            <p className="text-xs text-titanium-text-secondary leading-relaxed">
              Highest urgency level (P1 High &gt; P2 Medium &gt; P3 Low) guarantees mission-critical production blockers are executed first.
            </p>
            <span className="text-xs font-mono font-bold text-titanium-electric block pt-2">
              Complexity: O(log n) Heapify
            </span>
          </div>

          <div
            onClick={() => setActiveAlgo('URGENCY')}
            className={`p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer space-y-3 ${
              activeAlgo === 'URGENCY'
                ? 'bg-titanium-elevated border-titanium-accent shadow-titanium-lg scale-[1.02]'
                : 'glass-panel border-titanium-border hover:border-titanium-accent/40'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-titanium-electric shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">Smart Urgency Scoring</h3>
            <p className="text-xs text-titanium-text-secondary leading-relaxed">
              Continuous polynomial urgency score evaluating time decay, priority weighting, and estimated minutes to completion.
            </p>
            <span className="text-xs font-mono font-bold text-titanium-electric block pt-2">
              Formula: Decay(t) + W(p)
            </span>
          </div>

          <div
            onClick={() => setActiveAlgo('BALANCED')}
            className={`p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer space-y-3 ${
              activeAlgo === 'BALANCED'
                ? 'bg-titanium-elevated border-titanium-accent shadow-titanium-lg scale-[1.02]'
                : 'glass-panel border-titanium-border hover:border-titanium-accent/40'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-semantic-success shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">Balanced Schedule</h3>
            <p className="text-xs text-titanium-text-secondary leading-relaxed">
              Prevents priority starvation. Allows approaching medium-priority deadlines to bubble up before they become overdue.
            </p>
            <span className="text-xs font-mono font-bold text-titanium-electric block pt-2">
              Starvation-Free Queue
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Live Interactive Binary Tree Laboratory */}
      <section id="dsa-lab" className="px-6 md:px-12 py-24 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-titanium-accent">
            Live DSA Playground
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-titanium-text tracking-tight">
            Interactive Min-Heap Binary Tree
          </h2>
          <p className="text-sm sm:text-base text-titanium-text-secondary">
            Test real heap operations right now: insert elements, watch sift-up swaps, and pop the root element.
          </p>
        </div>

        <InteractiveTreeLab />
      </section>

      {/* Section 3: Complete Product Suite Overview */}
      <section id="product-suite" className="px-6 md:px-12 py-24 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-titanium-accent">
            Complete Suite
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-titanium-text tracking-tight">
            Sixteen Dedicated Productivity Modules
          </h2>
          <p className="text-sm sm:text-base text-titanium-text-secondary">
            Engineered from the ground up for technology startups, senior architects, and focused engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-titanium-accent/40 transition-all group shadow-titanium">
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-titanium-accent group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">1. Smart Min-Heap Scheduler</h3>
            <p className="text-xs sm:text-sm text-titanium-text-secondary leading-relaxed">
              Continuously balances active tasks across 4 custom algorithms. Inspect root node explanations detailing why each task is next.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-titanium-accent/40 transition-all group shadow-titanium">
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-semantic-info group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">2. DAG Dependency Network</h3>
            <p className="text-xs sm:text-sm text-titanium-text-secondary leading-relaxed">
              Directed Acyclic Graph solver with 3-color DFS cycle detection and Kahn's topological sorting. Unshield tasks only when ready.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-titanium-accent/40 transition-all group shadow-titanium">
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-semantic-warning group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">3. Focus Studio & Pomodoro</h3>
            <p className="text-xs sm:text-sm text-titanium-text-secondary leading-relaxed">
              Immersive distraction-free countdown timer linked directly to your active root task with session history logging and ambient sounds.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-titanium-accent/40 transition-all group shadow-titanium">
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-titanium-electric group-hover:scale-110 transition-transform">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">4. Timeline & Gantt Planner</h3>
            <p className="text-xs sm:text-sm text-titanium-text-secondary leading-relaxed">
              Visual Gantt planning with duration windows, milestone markers, concurrency visualizers, and overdue deadline warnings.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-titanium-accent/40 transition-all group shadow-titanium">
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-semantic-success group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">5. Audited Analytics Engine</h3>
            <p className="text-xs sm:text-sm text-titanium-text-secondary leading-relaxed">
              Statistical velocity tracking with Recharts: weekly completion volume, on-time execution indices, and priority donut breakdowns.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-titanium-accent/40 transition-all group shadow-titanium">
            <div className="w-12 h-12 rounded-2xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-titanium-accent group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-titanium-text">6. Min-Heap DSA Laboratory</h3>
            <p className="text-xs sm:text-sm text-titanium-text-secondary leading-relaxed">
              Inspect the live binary tree structure, step-by-step heapify operations, parent-child index equations, and zero-based vector arrays.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: C++ Architecture & Syntax-Highlighted Terminal Viewer */}
      <section id="code-specs" className="px-6 md:px-12 py-24 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-titanium-accent">
            Source Inspection
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-titanium-text tracking-tight">
            Native C++17 Core Engine
          </h2>
          <p className="text-sm sm:text-base text-titanium-text-secondary">
            Inspect the underlying algorithms powering NEXORA. Zero mock simulations; real systems code.
          </p>
        </div>

        <ArchitectureCodeViewer />
      </section>

      {/* Section 5: Comparison Table */}
      <section id="comparison" className="px-6 md:px-12 py-24 max-w-7xl mx-auto space-y-12">
        <EngineComparisonTable />
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 md:px-12 py-24 max-w-5xl mx-auto text-center space-y-8">
        <div className="glass-panel-glow p-12 sm:p-16 rounded-3xl space-y-8 border border-titanium-accent/50 shadow-titanium-lg relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-titanium-accent/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-titanium-text tracking-tight">
            Ready to Take Control of Your Time?
          </h2>
          <p className="text-base sm:text-lg text-titanium-text-secondary max-w-2xl mx-auto leading-relaxed">
            Experience the synergy of high-performance C++ Data Structures and Algorithms with a modern productivity platform.
          </p>
          <button
            onClick={onEnterApp}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-titanium-accent via-titanium-accent-light to-titanium-electric text-titanium-main font-black text-base sm:text-lg shadow-glow-accent hover:opacity-95 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-3"
          >
            <span>Launch NEXORA 2.0 Workspace</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-titanium-border px-6 md:px-12 py-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-titanium-text-muted font-mono">
        <div className="flex items-center gap-3">
          <NexoraLogo size="sm" />
          <span>&copy; 2026 NEXORA. Own Your Time.</span>
        </div>
        <div className="flex items-center gap-6">
          <span>C++ Crow Engine (Port {backendPort})</span>
          <button onClick={onEnterApp} className="text-titanium-accent hover:underline font-bold">
            Open App &rarr;
          </button>
        </div>
      </footer>
    </div>
  );
};
