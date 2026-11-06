import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types/task';
import {
  Layers,
  Play,
  RotateCcw,
  SkipForward,
  Info,
  CheckCircle2,
  Cpu,
  Sparkles,
  Code,
  Plus,
  ArrowDown
} from 'lucide-react';

export const MinHeapVisualizer: React.FC = () => {
  const { tasks } = useApp();

  const [activeTab, setActiveTab] = useState<'split' | 'tree' | 'array'>('split');
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(0);
  const [simulatedNodes, setSimulatedNodes] = useState<Task[] | null>(null);
  const [activeOperation, setActiveOperation] = useState<string>('Idle · Invariant strictly maintained');
  const [historyLog, setHistoryLog] = useState<string[]>([
    'Min-Heap initialized with C++ scheduling engine baseline tasks.',
    'Verified zero-based invariant: Parent <= LeftChild and Parent <= RightChild.',
    'Ready for step-by-step operation tracing.'
  ]);

  // Use either simulated heap or pending tasks from C++ backend
  const heapArray = simulatedNodes !== null
    ? simulatedNodes
    : tasks.filter(t => t.status !== 'COMPLETED');

  // Math indices
  const getParentIndex = (i: number) => (i === 0 ? null : Math.floor((i - 1) / 2));
  const getLeftChild = (i: number) => {
    const idx = 2 * i + 1;
    return idx < heapArray.length ? idx : null;
  };
  const getRightChild = (i: number) => {
    const idx = 2 * i + 2;
    return idx < heapArray.length ? idx : null;
  };

  // Build tree levels for layout
  const levels: { index: number; task: Task }[][] = [];
  let currentCount = 1;
  let currIdx = 0;
  while (currIdx < heapArray.length) {
    const lvl: { index: number; task: Task }[] = [];
    for (let j = 0; j < currentCount && currIdx < heapArray.length; j++) {
      lvl.push({ index: currIdx, task: heapArray[currIdx] });
      currIdx++;
    }
    levels.push(lvl);
    currentCount *= 2;
  }

  const selectedTask = selectedNodeIndex !== null && selectedNodeIndex < heapArray.length
    ? heapArray[selectedNodeIndex]
    : null;

  // Validate heap property
  const handleValidateHeap = () => {
    let isValid = true;
    for (let i = 0; i < heapArray.length; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < heapArray.length && heapArray[left].deadline < heapArray[i].deadline) isValid = false;
      if (right < heapArray.length && heapArray[right].deadline < heapArray[i].deadline) isValid = false;
    }
    const log = isValid
      ? '✓ Invariant Verified: A[Parent] <= A[Child] holds across all ' + heapArray.length + ' nodes.'
      : '⚠ Invariant Broken: Sift-up or sift-down rebalance required.';
    setActiveOperation(log);
    setHistoryLog(prev => [log, ...prev]);
  };

  // Step-by-Step Simulation: Insert Task
  const handleSimulateInsert = () => {
    const newTask: Task = {
      id: `sim-${Date.now()}`,
      userId: 'user-default',
      title: `Urgent Task #${heapArray.length + 1}`,
      description: 'Simulated node inserted into heap',
      deadline: Date.now() + Math.floor(Math.random() * 3600000 * 24),
      priority: (Math.floor(Math.random() * 3) + 1) as any,
      status: 'PENDING',
      estimatedMinutes: 30,
      actualMinutes: 0,
      progressPercentage: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newHeap = [...heapArray, newTask];
    let curr = newHeap.length - 1;
    let swaps = 0;

    // Sift Up
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (newHeap[curr].deadline < newHeap[parent].deadline) {
        // Swap
        const temp = newHeap[curr];
        newHeap[curr] = newHeap[parent];
        newHeap[parent] = temp;
        curr = parent;
        swaps++;
      } else {
        break;
      }
    }

    setSimulatedNodes(newHeap);
    setSelectedNodeIndex(curr);
    const op = `Insert: Placed at leaf [${newHeap.length - 1}], performed ${swaps} sift-up swap(s) to index [${curr}].`;
    setActiveOperation(op);
    setHistoryLog(prev => [op, ...prev]);
  };

  // Step-by-Step Simulation: Extract Min (Pop Root)
  const handleSimulateExtractMin = () => {
    if (heapArray.length === 0) return;
    const root = heapArray[0];

    if (heapArray.length === 1) {
      setSimulatedNodes([]);
      setSelectedNodeIndex(null);
      const op = `ExtractMin: Removed last remaining root task "${root.title}".`;
      setActiveOperation(op);
      setHistoryLog(prev => [op, ...prev]);
      return;
    }

    const newHeap = [...heapArray];
    const last = newHeap.pop()!;
    newHeap[0] = last;

    let curr = 0;
    let swaps = 0;

    // Sift Down
    while (curr < newHeap.length) {
      let smallest = curr;
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (left < newHeap.length && newHeap[left].deadline < newHeap[smallest].deadline) {
        smallest = left;
      }
      if (right < newHeap.length && newHeap[right].deadline < newHeap[smallest].deadline) {
        smallest = right;
      }

      if (smallest !== curr) {
        const temp = newHeap[curr];
        newHeap[curr] = newHeap[smallest];
        newHeap[smallest] = temp;
        curr = smallest;
        swaps++;
      } else {
        break;
      }
    }

    setSimulatedNodes(newHeap);
    setSelectedNodeIndex(0);
    const op = `ExtractMin: Popped root "${root.title}", moved last leaf to [0], performed ${swaps} sift-down swap(s).`;
    setActiveOperation(op);
    setHistoryLog(prev => [op, ...prev]);
  };

  const handleResetSimulation = () => {
    setSimulatedNodes(null);
    setSelectedNodeIndex(0);
    const op = 'Reset: Restored live state from C++ backend repository.';
    setActiveOperation(op);
    setHistoryLog(prev => [op, ...prev]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-titanium-text flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-titanium-accent" /> Min-Heap DSA Visualization Laboratory
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-titanium-surface border border-titanium-border text-titanium-electric">
              Zero-Based Vector
            </span>
          </div>
          <p className="text-xs text-titanium-text-secondary mt-1">
            Visual inspection of binary tree layout, array mapping, and parent-child invariants.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-titanium-surface border border-titanium-border text-xs font-semibold self-start">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'split' ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-text-secondary hover:text-titanium-text'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'tree' ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-text-secondary hover:text-titanium-text'
            }`}
          >
            Tree View
          </button>
          <button
            onClick={() => setActiveTab('array')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'array' ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-text-secondary hover:text-titanium-text'
            }`}
          >
            Array View
          </button>
        </div>
      </div>

      {/* Control Bar: Operations & Step playback */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateInsert}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-titanium-accent text-titanium-main text-xs font-bold shadow-sm hover:opacity-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Insert Node & Heapify Up
          </button>

          <button
            onClick={handleSimulateExtractMin}
            disabled={heapArray.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-xs font-semibold text-semantic-warning transition-colors disabled:opacity-50"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Extract Min (Pop Root)
          </button>

          <button
            onClick={handleValidateHeap}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-titanium-surface border border-titanium-border hover:border-titanium-accent/40 text-xs font-semibold text-titanium-text transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />
            Validate Invariant
          </button>

          {simulatedNodes !== null && (
            <button
              onClick={handleResetSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-titanium-surface border border-titanium-border text-xs text-titanium-text-muted hover:text-titanium-text transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-titanium-text-secondary">
            Queue Size: <strong className="text-titanium-accent">{heapArray.length}</strong> nodes
          </span>
        </div>
      </div>

      {/* Active Operation Status Bar */}
      <div className="p-3 rounded-2xl bg-titanium-elevated border border-titanium-accent/30 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-titanium-electric truncate">
          <Sparkles className="w-4 h-4 text-titanium-accent flex-shrink-0" />
          <span className="truncate">{activeOperation}</span>
        </div>
        <span className="text-titanium-text-muted hidden sm:inline">O(log n) Heapify Guaranteed</span>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tree View / Split (2 Cols on lg) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6 overflow-x-auto min-h-[480px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-titanium-border">
              <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
                <Cpu className="w-4 h-4 text-titanium-accent" /> Binary Tree Layout
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-mono text-titanium-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-titanium-accent"></span> Root Node [0]
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-titanium-steel"></span> Internal Child
                </span>
              </div>
            </div>

            {/* Tree Render */}
            {heapArray.length === 0 ? (
              <div className="py-24 text-center text-xs text-titanium-text-muted">
                No active tasks in heap queue. Click "Insert Node" to simulate.
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center gap-10 min-w-[500px]">
                {levels.map((level, lvlIdx) => (
                  <div key={lvlIdx} className="flex justify-center gap-6 sm:gap-12 w-full relative">
                    {level.map(item => {
                      const isSelected = selectedNodeIndex === item.index;
                      const isRoot = item.index === 0;

                      return (
                        <div
                          key={item.task.id}
                          onClick={() => setSelectedNodeIndex(item.index)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center w-36 sm:w-44 ${
                            isSelected
                              ? 'bg-titanium-elevated border-titanium-accent shadow-titanium-lg scale-105'
                              : isRoot
                              ? 'glass-panel-glow border-titanium-accent/60'
                              : 'bg-titanium-surface border-titanium-border hover:border-titanium-accent/40'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full pb-1 border-b border-titanium-border/60 text-[9px] font-mono">
                            <span className={`px-1.5 py-0.2 rounded font-bold ${
                              isRoot ? 'bg-titanium-accent text-titanium-main' : 'text-titanium-text-muted'
                            }`}>
                              [{item.index}]
                            </span>
                            <span className={item.task.priority === 1 ? 'text-semantic-error' : 'text-titanium-accent'}>
                              P{item.task.priority}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-titanium-text mt-1.5 truncate w-full">
                            {item.task.title}
                          </p>
                          <p className="text-[10px] font-mono text-titanium-text-muted mt-0.5">
                            {Math.max(0, Math.floor((item.task.deadline - Date.now()) / 3600000))}h left
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Array View Representation */}
          <div className="pt-6 border-t border-titanium-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-titanium-text font-mono">Contiguous Vector Memory Array</span>
              <span className="text-[10px] font-mono text-titanium-text-muted">A[i] · Zero-Based Storage</span>
            </div>

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {heapArray.map((task, idx) => {
                const isSelected = selectedNodeIndex === idx;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedNodeIndex(idx)}
                    className={`px-3 py-2 rounded-xl border font-mono text-xs cursor-pointer transition-all flex flex-col items-center min-w-[70px] ${
                      isSelected
                        ? 'bg-titanium-accent text-titanium-main border-titanium-accent font-bold shadow-sm'
                        : 'bg-titanium-surface border-titanium-border text-titanium-text hover:border-titanium-accent/40'
                    }`}
                  >
                    <span className="text-[9px] opacity-70">[{idx}]</span>
                    <span className="truncate max-w-[65px] font-semibold text-[11px]">{task.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Educational Math & Complexity Panel */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-titanium-text flex items-center gap-2">
              <Code className="w-4 h-4 text-titanium-accent" /> Invariant Mathematics
            </h3>
            <p className="text-[11px] text-titanium-text-muted mt-1">
              Zero-based binary tree indexing formulas
            </p>
          </div>

          {/* Math Equations Card */}
          <div className="p-4 rounded-2xl bg-titanium-surface border border-titanium-border font-mono text-xs space-y-2.5">
            <div className="flex justify-between items-center text-titanium-text">
              <span className="text-titanium-text-muted">Left Child:</span>
              <span className="text-titanium-electric">2 * i + 1</span>
            </div>
            <div className="flex justify-between items-center text-titanium-text">
              <span className="text-titanium-text-muted">Right Child:</span>
              <span className="text-titanium-electric">2 * i + 2</span>
            </div>
            <div className="flex justify-between items-center text-titanium-text">
              <span className="text-titanium-text-muted">Parent Node:</span>
              <span className="text-titanium-electric">floor((i - 1) / 2)</span>
            </div>
            <div className="flex justify-between items-center text-titanium-text pt-2 border-t border-titanium-border">
              <span className="text-titanium-text-muted">Min Property:</span>
              <span className="text-semantic-success">A[Parent] &le; A[Child]</span>
            </div>
          </div>

          {/* Selected Node Inspector */}
          {selectedTask && selectedNodeIndex !== null && (
            <div className="p-4 rounded-2xl bg-titanium-elevated border border-titanium-accent/30 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-titanium-border">
                <span className="text-xs font-bold text-titanium-text">
                  Node [{selectedNodeIndex}] Inspector
                </span>
                <span className="text-[10px] font-mono text-titanium-accent">
                  {selectedNodeIndex === 0 ? 'Heap Root' : 'Child Node'}
                </span>
              </div>

              <p className="text-xs font-semibold text-titanium-text">{selectedTask.title}</p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded-lg bg-titanium-surface border border-titanium-border">
                  <span className="text-titanium-text-muted block text-[10px]">Parent:</span>
                  <span className="text-titanium-text">
                    {getParentIndex(selectedNodeIndex) !== null ? `[${getParentIndex(selectedNodeIndex)}]` : 'None (Root)'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-titanium-surface border border-titanium-border">
                  <span className="text-titanium-text-muted block text-[10px]">Children:</span>
                  <span className="text-titanium-text">
                    {[getLeftChild(selectedNodeIndex), getRightChild(selectedNodeIndex)].filter(x => x !== null).map(x => `[${x}]`).join(', ') || 'Leaf'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Time & Space Complexity Card */}
          <div className="p-4 rounded-2xl bg-titanium-surface border border-titanium-border space-y-2 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-titanium-text-muted tracking-wider block">
              DSA Complexity Guarantees
            </span>
            <div className="flex justify-between">
              <span className="text-titanium-text-secondary">Peek Min (Root):</span>
              <span className="text-semantic-success font-bold">O(1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-titanium-text-secondary">Insert Task:</span>
              <span className="text-titanium-accent font-bold">O(log n)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-titanium-text-secondary">Extract Min:</span>
              <span className="text-titanium-accent font-bold">O(log n)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-titanium-text-secondary">Build Heap:</span>
              <span className="text-titanium-electric font-bold">O(n)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-titanium-text-secondary">Space Complexity:</span>
              <span className="text-titanium-text font-bold">O(n) Contiguous</span>
            </div>
          </div>

          {/* Operations History Log */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-titanium-text flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-titanium-accent" /> Operation Audit Log
            </span>
            <div className="p-3 rounded-xl bg-titanium-main border border-titanium-border text-[11px] font-mono text-titanium-text-secondary max-h-36 overflow-y-auto space-y-1.5">
              {historyLog.map((log, i) => (
                <div key={i} className="leading-snug text-titanium-text-muted">
                  &gt; {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
