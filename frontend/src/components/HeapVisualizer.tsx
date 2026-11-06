import React from 'react';
import { Task } from '../types/task';
import { motion } from 'framer-motion';

interface HeapVisualizerProps {
  heapArray: Task[];
  onSelectTask?: (task: Task) => void;
}

export const HeapVisualizer: React.FC<HeapVisualizerProps> = ({ heapArray, onSelectTask }) => {
  if (heapArray.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 rounded-xl border border-dashed border-slate-800">
        Heap is empty. Add tasks to see the live Min-Heap binary tree visualizer.
      </div>
    );
  }

  // Calculate levels: level 0 = 1 node, level 1 = 2 nodes, level 2 = 4 nodes, etc.
  const levels: Task[][] = [];
  let currentLevel = 0;
  let count = 1;
  let index = 0;

  while (index < heapArray.length) {
    const levelSlice: Task[] = [];
    for (let i = 0; i < count && index < heapArray.length; i++) {
      levelSlice.push(heapArray[index]);
      index++;
    }
    levels.push(levelSlice);
    currentLevel++;
    count *= 2;
  }

  return (
    <div className="p-6 rounded-2xl glass-panel relative overflow-x-auto">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-400">
            Live Min-Heap Binary Tree (DSA Invariant)
          </h3>
          <p className="text-xs text-slate-400">
            Visualizes actual zero-based priority queue memory. Root always contains highest priority task.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Root Node [0]
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span> Child Node
          </span>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="flex flex-col items-center gap-8 min-w-[600px] py-4">
        {levels.map((level, lvlIdx) => (
          <div key={lvlIdx} className="flex justify-center gap-4 sm:gap-8 w-full">
            {level.map((task, nodeIdx) => {
              const globalIdx = Math.pow(2, lvlIdx) - 1 + nodeIdx;
              const isRoot = globalIdx === 0;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => onSelectTask && onSelectTask(task)}
                  className={`relative cursor-pointer group flex flex-col items-center p-3 rounded-xl border transition-all ${
                    isRoot
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50 hover:border-emerald-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                  style={{ minWidth: '130px', maxWidth: '170px' }}
                >
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md mb-1.5 ${
                    isRoot ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    index [{globalIdx}]
                  </span>

                  <span className="text-xs font-semibold text-slate-200 text-center truncate w-full group-hover:text-emerald-300">
                    {task.title}
                  </span>

                  <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${
                      task.priority === 1 ? 'bg-rose-500/20 text-rose-300' :
                      task.priority === 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {task.priority === 1 ? 'P1' : task.priority === 2 ? 'P2' : 'P3'}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Raw Heap Array representation */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
          Underlying Contiguous Vector Buffer:
        </span>
        <div className="flex flex-wrap gap-2 mt-2 font-mono text-xs">
          {heapArray.map((task, idx) => (
            <div key={task.id} className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 flex items-center gap-1.5">
              <span className="text-emerald-500 font-semibold">{idx}:</span>
              <span className="text-slate-300 truncate max-w-[100px]">{task.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

