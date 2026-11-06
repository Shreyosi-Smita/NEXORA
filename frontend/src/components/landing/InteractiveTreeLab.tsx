import React, { useState } from 'react';
import { Layers, Plus, ArrowDown, Sparkles, CheckCircle2, RotateCcw, Cpu } from 'lucide-react';

interface TreeNode {
  id: string;
  title: string;
  priority: 1 | 2 | 3;
  hours: number;
}

export const InteractiveTreeLab: React.FC = () => {
  const initialNodes: TreeNode[] = [
    { id: '1', title: 'Deploy Hotfix', priority: 1, hours: 2 },
    { id: '2', title: 'Prepare Lecture', priority: 2, hours: 14 },
    { id: '3', title: 'Review Schema DDL', priority: 2, hours: 24 },
    { id: '4', title: 'Topological Sort', priority: 3, hours: 48 },
    { id: '5', title: 'Memory Audit', priority: 1, hours: 36 },
  ];

  const [nodes, setNodes] = useState<TreeNode[]>(initialNodes);
  const [activeLog, setActiveLog] = useState('Root [0] contains minimum element (2h deadline). All parent-child invariants satisfied.');

  const handleInsert = () => {
    const titles = [
      'Kernel Cache Tune',
      'Benchmark Socket API',
      'Audit Heap Bounds',
      'Cycle Guard DFS'
    ];
    const randTitle = titles[Math.floor(Math.random() * titles.length)];
    const randHours = Math.floor(Math.random() * 50) + 1;
    const newNode: TreeNode = {
      id: `node-${Date.now()}`,
      title: randTitle,
      priority: (Math.floor(Math.random() * 3) + 1) as any,
      hours: randHours,
    };

    const newNodes = [...nodes, newNode];
    let curr = newNodes.length - 1;
    let swaps = 0;

    // Sift Up
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (newNodes[curr].hours < newNodes[parent].hours) {
        const temp = newNodes[curr];
        newNodes[curr] = newNodes[parent];
        newNodes[parent] = temp;
        curr = parent;
        swaps++;
      } else {
        break;
      }
    }

    setNodes(newNodes);
    setActiveLog(`Inserted "${newNode.title}" at leaf [${newNodes.length - 1}], performed ${swaps} sift-up swap(s) to index [${curr}].`);
  };

  const handleExtractMin = () => {
    if (nodes.length <= 1) return;
    const rootTitle = nodes[0].title;
    const newNodes = [...nodes];
    const last = newNodes.pop()!;
    newNodes[0] = last;

    let curr = 0;
    let swaps = 0;

    // Sift Down
    while (curr < newNodes.length) {
      let smallest = curr;
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (left < newNodes.length && newNodes[left].hours < newNodes[smallest].hours) {
        smallest = left;
      }
      if (right < newNodes.length && newNodes[right].hours < newNodes[smallest].hours) {
        smallest = right;
      }

      if (smallest !== curr) {
        const temp = newNodes[curr];
        newNodes[curr] = newNodes[smallest];
        newNodes[smallest] = temp;
        curr = smallest;
        swaps++;
      } else {
        break;
      }
    }

    setNodes(newNodes);
    setActiveLog(`Popped root "${rootTitle}", moved leaf to root, performed ${swaps} sift-down swap(s) in O(log n).`);
  };

  const handleReset = () => {
    setNodes(initialNodes);
    setActiveLog('Reset tree to initial C++ heap state.');
  };

  return (
    <div className="glass-panel-glow p-6 sm:p-10 rounded-3xl space-y-8 border border-titanium-accent/40 shadow-titanium-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-titanium-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-titanium-electric animate-pulse" />
            <h3 className="text-xl font-extrabold text-titanium-text">
              Live Binary Tree Invariant Laboratory
            </h3>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Visual inspection of deterministic sift-up and sift-down heapify operations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleInsert}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-titanium-accent text-titanium-main text-xs font-bold shadow-sm hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Insert Node & Sift-Up
          </button>

          <button
            onClick={handleExtractMin}
            disabled={nodes.length <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-xs font-semibold text-semantic-warning transition-colors disabled:opacity-40"
          >
            <ArrowDown className="w-4 h-4" /> Pop Root Task
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-titanium-surface border border-titanium-border text-titanium-text-muted hover:text-titanium-text transition-colors"
            title="Reset Tree"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Binary Tree Node Graph */}
      <div className="relative py-6 min-h-[300px] flex flex-col items-center justify-center overflow-x-auto">
        {/* Level 0: Root */}
        {nodes[0] && (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 rounded-2xl glass-panel-glow border-2 border-titanium-accent shadow-titanium-lg w-48 text-center space-y-1 transform hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="px-1.5 py-0.2 rounded bg-titanium-accent text-titanium-main font-bold">[0] ROOT</span>
                <span className="text-semantic-error font-bold">P{nodes[0].priority}</span>
              </div>
              <p className="text-xs font-bold text-titanium-text truncate">{nodes[0].title}</p>
              <p className="text-[11px] font-mono text-titanium-electric">Due: {nodes[0].hours}h</p>
            </div>

            {/* Level 1: Left & Right Children */}
            <div className="flex justify-center gap-12 sm:gap-24">
              {nodes[1] && (
                <div className="p-3.5 rounded-2xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/50 shadow-titanium w-40 text-center space-y-1 transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-titanium-elevated text-titanium-text-muted">[1] LEFT</span>
                    <span className="text-titanium-accent font-bold">P{nodes[1].priority}</span>
                  </div>
                  <p className="text-xs font-bold text-titanium-text truncate">{nodes[1].title}</p>
                  <p className="text-[11px] font-mono text-titanium-text-muted">Due: {nodes[1].hours}h</p>
                </div>
              )}

              {nodes[2] && (
                <div className="p-3.5 rounded-2xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/50 shadow-titanium w-40 text-center space-y-1 transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-titanium-elevated text-titanium-text-muted">[2] RIGHT</span>
                    <span className="text-titanium-accent font-bold">P{nodes[2].priority}</span>
                  </div>
                  <p className="text-xs font-bold text-titanium-text truncate">{nodes[2].title}</p>
                  <p className="text-[11px] font-mono text-titanium-text-muted">Due: {nodes[2].hours}h</p>
                </div>
              )}
            </div>

            {/* Level 2: Grandchildren */}
            {(nodes[3] || nodes[4]) && (
              <div className="flex justify-center gap-6 sm:gap-12 pt-2">
                {nodes[3] && (
                  <div className="p-3 rounded-xl bg-titanium-main/80 border border-titanium-border/80 w-36 text-center space-y-0.5">
                    <span className="text-[9px] font-mono text-titanium-text-muted">[3] LEAF</span>
                    <p className="text-[11px] font-bold text-titanium-text truncate">{nodes[3].title}</p>
                    <p className="text-[10px] font-mono text-titanium-text-muted">{nodes[3].hours}h</p>
                  </div>
                )}
                {nodes[4] && (
                  <div className="p-3 rounded-xl bg-titanium-main/80 border border-titanium-border/80 w-36 text-center space-y-0.5">
                    <span className="text-[9px] font-mono text-titanium-text-muted">[4] LEAF</span>
                    <p className="text-[11px] font-bold text-titanium-text truncate">{nodes[4].title}</p>
                    <p className="text-[10px] font-mono text-titanium-text-muted">{nodes[4].hours}h</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Educational Operation Ticker */}
      <div className="p-4 rounded-2xl bg-titanium-main/90 border border-titanium-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 text-titanium-electric">
          <Sparkles className="w-4 h-4 text-titanium-accent flex-shrink-0" />
          <span>{activeLog}</span>
        </div>
        <span className="text-semantic-success flex items-center gap-1 font-bold flex-shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" /> Invariant Satisfied
        </span>
      </div>
    </div>
  );
};
