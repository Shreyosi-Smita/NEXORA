import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Layers, Cpu, Clock, CheckCircle2, ShieldCheck, Play } from 'lucide-react';

export const Interactive3DHero: React.FC<{ onLaunchApp: () => void }> = ({ onLaunchApp }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle smooth mouse tilt for 3D depth
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-5xl mx-auto h-[480px] sm:h-[540px] flex items-center justify-center perspective-[1200px]"
    >
      {/* 3D Transform Stage */}
      <motion.div
        animate={{
          rotateY: mousePos.x * 24,
          rotateX: -mousePos.y * 24,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Soft Ambient Radial Light Fields */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-titanium-accent/25 via-titanium-electric/15 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-titanium-surface/60 blur-2xl -z-10 pointer-events-none" />

        {/* Central 3D Metallic Prism Crystal (The C++ Core Engine) */}
        <div
          style={{ transform: 'translateZ(60px)' }}
          className="relative w-72 sm:w-84 h-72 sm:h-84 rounded-3xl p-6 glass-panel-glow border-2 border-titanium-accent/50 shadow-titanium-lg flex flex-col justify-between backdrop-blur-2xl"
        >
          {/* Inner Header */}
          <div className="flex items-center justify-between pb-3 border-b border-titanium-border/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-titanium-electric animate-ping" />
              <span className="text-xs font-mono font-bold text-titanium-electric tracking-wide">
                NEXORA C++ CORE
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface text-semantic-success border border-semantic-success/30 font-semibold">
              O(1) PEEK
            </span>
          </div>

          {/* Central Heap Visual Hologram */}
          <div className="my-auto py-4 text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-titanium-accent via-titanium-electric to-titanium-surface p-0.5 shadow-glow-electric">
              <div className="w-full h-full bg-titanium-main rounded-[14px] flex items-center justify-center">
                <Cpu className="w-8 h-8 text-titanium-electric animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-sm font-extrabold text-titanium-text">Deterministic Min-Heap</p>
              <p className="text-[11px] font-mono text-titanium-accent">A[Parent] &le; A[Child] Verified</p>
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="pt-3 border-t border-titanium-border/80 grid grid-cols-2 gap-2 text-center font-mono text-[11px]">
            <div className="p-2 rounded-xl bg-titanium-surface/70 border border-titanium-border">
              <span className="text-titanium-text-muted block text-[9px] uppercase">Cycle Detector</span>
              <span className="font-bold text-semantic-success">3-Color DFS</span>
            </div>
            <div className="p-2 rounded-xl bg-titanium-surface/70 border border-titanium-border">
              <span className="text-titanium-text-muted block text-[9px] uppercase">Heapify Time</span>
              <span className="font-bold text-titanium-electric">&lt; 0.02 ms</span>
            </div>
          </div>
        </div>

        {/* Orbiting Satellite Card 1: Top-Right Root Task Card */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translateZ(100px)' }}
          className="absolute -top-4 sm:top-6 right-2 sm:right-8 w-60 sm:w-68 p-4 rounded-2xl glass-panel-elevated border border-titanium-accent/40 shadow-titanium-lg space-y-2"
        >
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-titanium-accent/20 text-titanium-electric font-bold">
              Root [0] (Next Recommended)
            </span>
            <span className="text-semantic-error font-bold">P1 HIGH</span>
          </div>
          <p className="text-xs font-bold text-titanium-text">Deploy Production Hotfix</p>
          <div className="flex items-center justify-between text-[10px] font-mono text-titanium-text-muted pt-1 border-t border-titanium-border/60">
            <span>Countdown: 2h 14m</span>
            <span className="text-titanium-accent font-semibold">Priority Tie-Break</span>
          </div>
        </motion.div>

        {/* Orbiting Satellite Card 2: Bottom-Left Topological Sort Card */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ transform: 'translateZ(90px)' }}
          className="absolute -bottom-4 sm:bottom-6 left-2 sm:left-8 w-64 sm:w-72 p-4 rounded-2xl glass-panel-elevated border border-titanium-accent/40 shadow-titanium-lg space-y-2"
        >
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-semantic-success/20 text-semantic-success font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> DAG Topological Solver
            </span>
            <span className="text-titanium-text-muted">Kahn's Algo</span>
          </div>
          <p className="text-xs font-semibold text-titanium-text">
            Dependencies Resolved: Prerequisites completed before child unshielding.
          </p>
          <div className="w-full bg-titanium-main h-1.5 rounded-full overflow-hidden border border-titanium-border">
            <div className="bg-gradient-to-r from-titanium-accent to-semantic-success h-full w-[85%]" />
          </div>
        </motion.div>

        {/* Orbiting Satellite Card 3: Bottom-Right Focus Card */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ transform: 'translateZ(110px)' }}
          className="hidden md:flex absolute bottom-12 right-12 p-3.5 rounded-2xl glass-panel border border-titanium-accent/30 shadow-titanium items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-titanium-surface border border-titanium-border flex items-center justify-center text-titanium-accent">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-titanium-text-muted">Focus Studio</p>
            <p className="text-xs font-bold text-titanium-text">25:00 Pomodoro Ready</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
