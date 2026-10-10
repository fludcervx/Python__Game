# System Codex: Python Operations — Revised MVP Implementation Plan

Implementation plan for the System Codex MVP focusing on a CodeMirror 6 editor, Pyodide Web Worker execution with a `sys.settrace()` visual stepper, four foundational beginner missions, and dual progression modes.

## User Review & Critical Decisions

> [!IMPORTANT]
> The implementation priorities have been updated according to the approved directive:
> - **Priority 1 (Workstation)**: Integrate CodeMirror 6 with Python language support and an industrial dark theme. Execute actual Python in a dedicated Web Worker using a pinned stable Pyodide release.
> - **Priority 2 (Visual Stepper)**: Build an execution trace recorder using Python's `sys.settrace()` inside the worker, capturing bounded snapshots of local variables, execution location, and console output for step forward/back replay, with worker termination safety.
> - **Priority 3 (4 Beginner Missions)**: Implement Missions 1–4 (First Instructions, Stored Values, Automated Decisions, Repeated Operations) with concise lessons, working tests, hints, and explanations of errors and correct logic.
> - **Priority 4 (Progression & Storage)**: Dual-mode progression (Structured with prerequisite locks vs. Free Exploration) persisted in `localStorage`.
> - **Deferred**: Specialization certifications, advanced skill analytics, and external AI/Gemini integrations are deferred to keep the product self-contained and offline-capable.

---

## 1. Overview & Core Concept

- **What It Does**: A standalone, industrial-themed Python learning workstation that teaches programming from scratch. Learners write code in CodeMirror 6, run real Python via Pyodide in a dedicated worker, and visually step through code execution line-by-line to see variable mutations and loop iterations.
- **Target Audience**: Curious learners aged 10 and older, teenagers, and adult career switchers seeking an authentic, mature engineering environment without childish gamification.
- **Key Value**: Replaces black-box execution with visual step-by-step telemetry, bridging the gap between abstract code and concrete execution mechanics.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Mission Briefing & Instruction**: Learner reads concise concepts and operational dispatch, with starter code and test harness vectors displayed.
2. **CodeMirror 6 Workstation**: Learner writes code with syntax highlighting, 4-space tab indentation, line numbers, and keyboard shortcuts (`Ctrl+Enter` to run).
3. **Execution & Behavioral Evaluation**: Pyodide runs in a background Web Worker, returning stdout, stderr, and test assertion results. If execution hangs or enters an infinite loop, the user can click Stop to terminate and reboot the worker.
4. **Visual Execution Stepper**: Stepping mode records execution events via `sys.settrace()`, allowing the learner to step forward/backward through lines, watch variable changes, and observe loop iterations without reversing actual Python state.
5. **Adaptive Assistance**: Escalating hints (Nudge, Rule, Diagnosis, Micro-example, Worked solution) help unstuck learners without spoiling solutions.
6. **Navigation & Persistence**: Toggle between Structured Progression (unlocking nodes as prerequisites are satisfied) and Free Exploration (inspecting any mission). All progress and drafts persist locally.

### Visual Identity
- **Palette**: Dark slate chassis (`#070B14`, `#0F172A`, `#1E293B`), warm terminal phosphor (`#10B981`), amber cathode accents (`#F59E0B`), cyber cyan (`#06B6D4`), and alert red (`#EF4444`).
- **Typography**: Clean monospace font stack (`Fira Code`, `JetBrains Mono`) with readable technical display typography (`Orbitron`, `Rajdhani`).

---

## 3. Key Product Decisions & Trade-Offs

- **CodeMirror 6 Integration**:
  - *Chosen Approach*: Modern CodeMirror 6 (`@codemirror/view`, `@codemirror/state`, `@codemirror/lang-python`, `@codemirror/theme-one-dark`) customized for the retro-futuristic dark chassis.
  - *Why*: Superior performance, mobile/tablet support, native Python syntax tree awareness, and accessibility.
- **Dedicated Pyodide Web Worker with `sys.settrace()`**:
  - *Chosen Approach*: Offload all Python execution to a dedicated Web Worker with a timeout watchdog and a manual Stop button that invokes `worker.terminate()`.
  - *Why*: Prevents infinite loops or intensive iterations from freezing the browser UI thread; `sys.settrace()` safely samples local variables and line events up to a bounded cap (e.g., max 500 trace events, 50KB payload).
- **Dual-Mode Progression**:
  - *Chosen Approach*: Separate completed node tracking from exploratory viewing so learners can browse without corrupting linear progression prerequisites.

---

## 4. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SYSTEM CODEX WORKSTATION                          │
├────────────────────────────────────────────────────────────────────────┤
│  NAVBAR: Mission Selector | Mode (Structured/Free) | Audio | Controls │
├───────────────────────────────────┬────────────────────────────────────┤
│ BRIEFING & INSTRUCTION PANE       │ CODEMIRROR 6 EDITOR CANVAS         │
│  - Concept & Narrative Brief      │  - Syntax highlighting (Python)    │
│  - Test Harness Vectors Table     │  - Active execution line gutter    │
│  - 5-Stage Assistance Ladder      │  - Stepper Controls (Next/Prev/Play│
├───────────────────────────────────┼────────────────────────────────────┤
│ VARIABLE & LOOP INSPECTOR         │ TELEMETRY TERMINAL DOCK            │
│  - Current scope variables        │  - Real STDOUT & Stderr Traceback  │
│  - Mutation delta indicators      │  - Test suite assertion reports    │
│  - Loop iteration count display   │  - Engine health & Worker status   │
└───────────────────────────────────┴────────────────────────────────────┘
                                     │ (postMessage / Web Worker)
                                     ▼
                      ┌─────────────────────────────┐
                      │    DEDICATED WEB WORKER     │
                      │  - Pyodide WASM Runtime     │
                      │  - sys.settrace() Recorder  │
                      │  - Safe variable serializer │
                      │  - Test harness runner      │
                      └─────────────────────────────┘
```

### Missions 1–4 Scope
1. **Mission 1: First Instructions** — `print()`, string literals, terminal output, execution mechanics.
2. **Mission 2: Stored Values** — Variables, assignment, arithmetic operators, mutable values over time.
3. **Mission 3: Automated Decisions** — Comparisons (`<`, `>`, `==`), `if/else` logic, boundary validation.
4. **Mission 4: Repeated Operations** — `for` loops, `range()`, accumulator patterns across iterations (demonstrating the visual stepper).
