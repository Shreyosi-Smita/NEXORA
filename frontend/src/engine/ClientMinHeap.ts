import { Task, SchedulingMode } from '../types/task';

/**
 * Client-Side Min-Heap Model matching C++ DSA Engine specifications.
 * Guarantees zero frontend desync during offline/client-side navigation.
 */
export class ClientMinHeap {
  private heap: Task[] = [];
  private mode: SchedulingMode = 'DEADLINE_FIRST';

  constructor(mode: SchedulingMode = 'DEADLINE_FIRST') {
    this.mode = mode;
  }

  setMode(mode: SchedulingMode) {
    this.mode = mode;
    this.rebuild();
  }

  getMode(): SchedulingMode {
    return this.mode;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  getHeapArray(): Task[] {
    return [...this.heap];
  }

  insert(task: Task) {
    const evaluated = this.evaluateTask(task);
    const existingIdx = this.heap.findIndex(t => t.id === evaluated.id);
    if (existingIdx !== -1) {
      this.heap[existingIdx] = evaluated;
      this.heapifyUp(existingIdx);
      this.heapifyDown(existingIdx);
      return;
    }

    this.heap.push(evaluated);
    this.heapifyUp(this.heap.length - 1);
  }

  getMin(): Task | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  extractMin(): Task | null {
    if (this.heap.length === 0) return null;
    const root = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    return root;
  }

  removeById(taskId: string): boolean {
    const idx = this.heap.findIndex(t => t.id === taskId);
    if (idx === -1) return false;

    const last = this.heap.pop()!;
    if (idx < this.heap.length) {
      this.heap[idx] = last;
      this.heapifyDown(idx);
      this.heapifyUp(idx);
    }
    return true;
  }

  buildHeap(tasks: Task[]) {
    this.heap = tasks.map(t => this.evaluateTask(t));
    const start = Math.floor(this.heap.length / 2) - 1;
    for (let i = start; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  rebuild() {
    this.buildHeap(this.heap);
  }

  private compare(a: Task, b: Task): boolean {
    if (this.mode === 'PRIORITY_FIRST') {
      if (a.priority !== b.priority) return a.priority < b.priority;
      if (a.deadline !== b.deadline) return a.deadline < b.deadline;
      return a.id < b.id;
    }

    if (this.mode === 'SMART_URGENCY') {
      const scoreA = a.calculatedUrgencyScore ?? 0;
      const scoreB = b.calculatedUrgencyScore ?? 0;
      if (Math.abs(scoreA - scoreB) > 0.01) return scoreA > scoreB; // Higher urgency score first
      return a.deadline < b.deadline;
    }

    if (this.mode === 'BALANCED') {
      const scoreA = (a.deadline / 3600000) + (a.priority * 12);
      const scoreB = (b.deadline / 3600000) + (b.priority * 12);
      if (Math.abs(scoreA - scoreB) > 0.01) return scoreA < scoreB;
      return a.id < b.id;
    }

    // Default: DEADLINE_FIRST
    if (a.deadline !== b.deadline) return a.deadline < b.deadline;
    if (a.priority !== b.priority) return a.priority < b.priority;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt;
    return a.id < b.id;
  }

  private heapifyUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parent])) {
        [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
        index = parent;
      } else {
        break;
      }
    }
  }

  private heapifyDown(index: number) {
    const size = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < size && this.compare(this.heap[left], this.heap[smallest])) {
        smallest = left;
      }
      if (right < size && this.compare(this.heap[right], this.heap[smallest])) {
        smallest = right;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }

  evaluateTask(task: Task): Task {
    const now = Date.now();
    const diffHours = (task.deadline - now) / (1000 * 60 * 60);

    let score = 0;
    if (task.priority === 1) score += 30;
    else if (task.priority === 2) score += 20;
    else score += 10;

    let reason = '';
    const prioLabel = task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low';

    if (diffHours < 0) {
      score += 50;
      reason = `Overdue task (${Math.abs(Math.round(diffHours))}h ago) with ${prioLabel} priority.`;
    } else if (diffHours <= 24) {
      score += 40;
      reason = `Due today with ${prioLabel} priority. Complete urgently.`;
    } else if (diffHours <= 48) {
      score += 30;
      reason = `Due tomorrow with ${prioLabel} priority.`;
    } else if (diffHours <= 72) {
      score += 20;
      reason = `Approaching deadline within 3 days (${prioLabel} priority).`;
    } else {
      score += 10;
      reason = `Scheduled based on standard ${prioLabel} priority and deadline queue.`;
    }

    return {
      ...task,
      calculatedUrgencyScore: score,
      schedulingReason: reason
    };
  }
}

