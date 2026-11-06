# NEXORA 2.0 — Intelligent Task Scheduler & Productivity Platform

> **Own Your Time.**  
> *Plan Smarter. Execute Better.*

NEXORA 2.0 is an enterprise-grade productivity management and scheduling platform engineered around a custom C++ Data Structures & Algorithms (DSA) Min-Heap engine, a directed acyclic graph (DAG) dependency solver with cycle detection, and a modern SaaS interface built with React 18, TypeScript, Tailwind CSS, Recharts, and Framer Motion adhering to the **Titanium Blue 2.0** design standard.

---

## 🌟 Key Features

1. **Custom Min-Heap Scheduling Engine (C++)**:
   - Zero-based vector heap with deterministic 4-tier tie-breaking:
     `Earliest Deadline` $\rightarrow$ `Highest Priority` $\rightarrow$ `Earlier Creation` $\rightarrow$ `Task ID`.
   - Dynamic scheduling modes: Deadline-First (EDF), Priority-First (HPF), Balanced, and Smart Urgency Scoring.
   - Algorithmic explanations: understand *why* each task is recommended next.
2. **Interactive 3D Animated Landing Page**:
   - Hardware-accelerated 60fps constellation particle canvas.
   - Interactive 3D metallic prism hero with mouse parallax tilt.
   - Live browser-based Min-Heap interactive tree simulator.
   - Syntax-highlighted C++ systems architecture code viewer with live invariant verification suite.
   - "Standard To-Do Lists vs NEXORA 2.0" comparison matrix.
3. **16 Dedicated Productivity Modules**:
   - **Command Center Dashboard**: 6 KPI cards, Next Move spotlight, Recharts weekly velocity, Today's Agenda, DSA preview.
   - **My Day**: Hourly time-blocked planning (08:00 to 20:00), daily workload capacity gauge, task allocation.
   - **All Tasks**: 4 views (List, Grid, Kanban, Table), multi-select bulk actions, filters, search, Task Details drawer.
   - **Smart Scheduler**: 4 algorithmic modes, weight sliders, live queue diffs, direct C++ mode switching.
   - **Min Heap Visualizer (DSA Lab)**: Interactive binary tree with SVG parent-child connections, zero-based array layout, step-by-step heapify operations.
   - **Interactive Calendar**: Month matrix, deadline markers, quick date task creation, date inspection panel.
   - **Timeline & Gantt Planner**: Sequential Gantt view, duration bars, concurrency planning, overdue warnings.
   - **Focus Studio**: Circular SVG countdown timer, Pomodoro (25m), short/long breaks, ambient sound toggle, session logging.
   - **Habits & Goals**: Daily habit streaks with 14-day activity micro-grids, quarterly goals with progress controls.
   - **Analytics Dashboard**: Recharts velocity charts, priority distribution donut, on-time completion index, JSON report export.
   - **Dependency Graph (DAG)**: Directed graph solver, cycle detection check, Kahn's topological sort sequence, task blockage tracking.
   - **Recurring Tasks**: Daily, weekly, monthly automated task templates with active/paused toggle.
   - **Inbox & Notifications**: Triage inbox, deadline alerts, algorithmic recommendations, unread badge counter.
   - **Activity History**: Immutable chronological audit trail of all task operations, mode changes, and focus sessions.
   - **Settings & Integrations**: Profile preferences, working hours, keyboard shortcuts cheat sheet, infrastructure specs.
   - **System Diagnostics**: Developer telemetry, latency ping benchmark, C++ socket memory model, heap queue metrics.

---

## 🏗️ Architecture

```
                                  +------------------------------------+
                                  |          USER INTERFACE            |
                                  |    React 18 + TS + Tailwind CSS    |
                                  |    Titanium Blue 2.0 Design System |
                                  +-----------------+------------------+
                                                    |
                                                    | HTTP / REST / JSON (Port 8081)
                                                    v
                                  +-----------------+------------------+
                                  |      C++17 CORE REST ENGINE        |
                                  |       POSIX / BSD Sockets          |
                                  +--------+------------------+--------+
                                           |                  |
                   +-----------------------+                  +----------------------+
                   v                                                                 v
+---------------------------------------+                             +---------------------------------------+
|             TASK MANAGER              |                             |           SCHEDULING ENGINE           |
|  - In-Memory Repository               |                             |  - Custom Zero-Based Min Heap         |
|  - Lifecycle Transitions              |                             |  - DAG Dependency Manager             |
|  - Validation & Serialization         |                             |  - 3-Color DFS Cycle Detector         |
+----------------------+----------------+                             +-------------------+-------------------+
                       |                                                                  |
                       +-----------------------+                  +-----------------------+
                                               v                  v
                                      +-----------------+------------------+
                                      |       DATABASE REPOSITORIES        |
                                      |      PostgreSQL / Supabase         |
                                      +------------------------------------+
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+ and npm
- C++17 compiler (`clang++` or `g++`)

### Starting Services
```bash
# 1. Compile and run C++ Backend (Port 8081)
cd backend
clang++ -std=c++17 -Iinclude src/main.cpp -o nexora_server
PORT=8081 ./nexora_server

# 2. Run React Frontend (Port 3000)
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** to explore the landing page and launch the workspace.

---

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShreyosi-Smita%2FNEXORA)

NEXORA 2.0 includes automated Vercel deployment presets (`vercel.json`) and an in-browser `ClientMinHeap` fallback engine that supports full interactive scheduling, heap rebalancing, task management, and data persistence out-of-the-box when deployed as a standalone web application.

---

## 📜 Design Standard: Titanium Blue 2.0
- **Main Background**: `#080D16`
- **Application Canvas**: `#0C1421`
- **Primary Surface**: `#131F30`
- **Elevated Surface**: `#1B2A3D`
- **Primary Accent**: `#6D9BCB`
- **Electric Highlight**: `#B5D7F5`
- **Success / Completed**: `#35D6A1`
- **Warning**: `#FFBC69`
- **Error / Overdue**: `#FF6B81`
