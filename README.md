# NEXORA — Intelligent Task Scheduler & Productivity Platform

> **Own Your Time.**  
> *Plan Smarter. Execute Better.*

NEXORA is a high-performance productivity management platform engineered around deadlines, priorities, and custom Data Structures and Algorithms (DSA). Rather than relying on simple to-do lists, NEXORA continuously computes optimal task scheduling using a custom C++ Min Heap engine and directed acyclic graph (DAG) dependency solver.

---

## 🌟 Key Features

1. **Custom Min-Heap Scheduling Engine (C++)**:
   - Zero-based vector heap with deterministic tie-breaking:
     `Earliest Deadline` $\rightarrow$ `Highest Priority` $\rightarrow$ `Earlier Creation` $\rightarrow$ `Task ID`.
   - Dynamic scheduling modes: Deadline-First, Priority-First, Balanced, and Smart Urgency Scoring.
   - Transparent algorithmic explanations: understand *why* each task is recommended next.
2. **Interactive Min-Heap Visualization**:
   - Visual inspection of the live binary tree structure, animated heapify operations, and raw array representations.
3. **Graph-Based Dependency Management**:
   - Directed acyclic graph (DAG) model with cycle detection via Depth First Search (DFS) and topological sorting.
   - Dependency-blocked tasks are automatically shielded from immediate execution.
4. **Deep Productivity Analytics**:
   - On-time completion rates, weekly velocity, focus session statistics, and category breakdown powered by Recharts.
5. **Integrated Focus Mode**:
   - Pomodoro and custom timers linked directly to active tasks with estimated vs. actual duration auditing.
6. **Enterprise Architecture**:
   - Modular C++ backend using Crow REST framework.
   - Robust PostgreSQL schema with relational integrity and cascade policies.
   - React 18 + TypeScript + Vite frontend with Tailwind CSS dark-first glassmorphism design.

---

## 🏗️ Project Architecture

```
                                      +------------------------------------+
                                      |          USER INTERFACE            |
                                      |    React 18 + TS + Tailwind CSS    |
                                      +-----------------+------------------+
                                                        |
                                                        | HTTPS / REST / JSON
                                                        v
                                      +-----------------+------------------+
                                      |         C++ CROW BACKEND           |
                                      |          REST API Engine           |
                                      +--------+------------------+--------+
                                               |                  |
                       +-----------------------+                  +----------------------+
                       v                                                                 v
+---------------------------------------+                             +---------------------------------------+
|             TASK MANAGER              |                             |           SCHEDULING ENGINE           |
|  - CRUD & Status Lifecycle            |                             |  - Custom Min Heap                    |
|  - Validation & Isolation             |                             |  - DAG Dependency Manager             |
|  - Repository Orchestrator            |                             |  - 5 Urgency Evaluation Algorithms    |
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

## 📁 Repository Structure

```
project/
├── backend/
│   ├── CMakeLists.txt              # C++ CMake project definition
│   ├── Dockerfile                  # Multi-stage container for deployment
│   ├── include/
│   │   ├── dsa/                    # Custom MinHeap, Graph, Comparators
│   │   ├── managers/               # TaskManager, DependencyManager, Analytics
│   │   ├── middleware/             # Auth, CORS, Logger
│   │   ├── models/                 # Task, User, FocusSession, Category
│   │   ├── repositories/           # Database repositories
│   │   ├── routes/                 # Crow REST API endpoints
│   │   └── utils/                  # Date/time, JSON helpers, Enums
│   ├── src/                        # Implementations and main entry point
│   └── tests/                      # DSA unit tests & invariant checks
├── database/
│   ├── migrations/                 # PostgreSQL schema DDL
│   └── seeds/                      # Initial seed and sample datasets
├── frontend/
│   ├── src/
│   │   ├── assets/                 # Icons and media
│   │   ├── components/             # Reusable UI widgets & Heap Visualizer
│   │   ├── layouts/                # App layout, Navbar, Sidebar
│   │   ├── pages/                  # Dashboard, Scheduler, Tasks, Focus, Analytics
│   │   ├── services/               # API client and backend connectors
│   │   └── types/                  # TypeScript data interfaces
│   ├── package.json
│   └── vite.config.ts
├── docs/                           # Comprehensive DSA, API, and Architecture docs
├── PROJECT_STATUS.md               # Continuous project progress tracker
└── README.md
```

---

## 🚀 Getting Started

### Backend Prerequisites
- CMake 3.16+
- C++17 compatible compiler (`g++` or `clang++` or MSVC)
- PostgreSQL client libraries or Supabase instance

### Frontend Prerequisites
- Node.js 18+
- npm or pnpm

### Quick Build
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
mkdir build && cd build
cmake ..
cmake --build .
```

---

## 📜 Brand Guidelines
NEXORA enforces a strict brand guideline:
- Dark-first aesthetic featuring deep obsidian surfaces (`#0B0F17`, `#111827`) with emerald (`#10B981`) and mint (`#34D399`) accents.
- Modern typography with clean geometric visual cues.

