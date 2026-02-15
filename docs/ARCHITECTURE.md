# Architecture

## 1. System Overview

TypeScript monorepo with clear boundaries:

- `app/frontend`: React + Vite dashboard
- `app/backend`: Express API + SQLite persistence + static hosting in production
- `app/simulation-engine`: pure simulation logic and heuristics
- `app/shared-types`: shared interfaces/contracts

## 2. Design Principles

- Keep simulation math pure and testable.
- Validate all API inputs at boundaries (`zod`).
- Share strict contracts across workspaces.
- Keep UI-focused state in frontend; keep durability concerns in backend.
- Prefer simple persistence (SQLite + browser localStorage) for local engineering workflows.

## 3. Backend Layers

- `api/simulationRoutes.ts`
  - `POST /api/simulate`
  - `GET /api/scenarios`
  - `POST /api/scenarios`
  - `DELETE /api/scenarios/:id`
- `services/validation.ts`: input payload schemas
- `services/scenarioService.ts`: scenario DB orchestration
- `db/sqlite.ts`: connection + schema setup
- `middleware/errorHandler.ts`: not-found and error handling

## 4. Frontend Composition

`App.tsx` orchestrates:

- simulation inputs and output state
- save/load/delete scenario flows
- snapshot history collection
- comparison overlay state
- preset/favorite state
- export/download actions

Key components:

- `MetricCard`: KPI cards with tooltip help
- `UtilizationGauge`: utilization health view
- `TrendGraph`: queueing-style RPS vs latency curve
- `WarningList`: warnings and recommendation
- `HistoryChart`: utilization + latency timeline with source/mode toggles
- `AutoscalingPanel`: scaling guidance summary
- `ScenarioComparisonOverlay`: baseline/candidate diff and preset management

## 5. Data Flow

### Live Simulation

1. User edits input.
2. Frontend posts payload to `POST /api/simulate`.
3. Backend validates input and runs engine.
4. Output returns to UI.
5. Panels re-render from typed output.

### Scenario Save

1. User clicks `Save`.
2. Frontend posts `{ name, input }` to `POST /api/scenarios`.
3. Backend validates, computes output, persists record.
4. Frontend refreshes scenario list.

### Scenario Load

1. User clicks a saved scenario.
2. Frontend loads scenario input/output into dashboard.
3. Frontend appends timeline snapshot point.

### Scenario Delete

1. User clicks `Del` on a scenario.
2. Frontend calls `DELETE /api/scenarios/:id`.
3. Backend deletes row and returns `204`.
4. Frontend refreshes scenario list.

## 6. Persistence

### SQLite

- File: `app/backend/data/simulations.db`
- Table: `scenarios(id, name, created_at, input_json, output_json)`
- Read pattern: latest 100 scenarios (`ORDER BY id DESC`)

### Browser localStorage

- `simulator.comparison-presets.v1`
  - pinned baseline/candidate presets and favorite state
- `simulator.timeline-mode.v1`
  - timeline display mode (`absolute` or `normalized`)
- `simulator.timeline-source.v1`
  - timeline data source (`snapshots` or `saved`)

## 7. Deployment Model

- Dev mode: separate frontend (`5173`) and backend (`4300`).
- Docker mode: backend serves compiled frontend (`FRONTEND_DIST`) on port `4300`.

## 8. Testing Strategy

- `app/simulation-engine`: formula/classification tests
- `app/backend`: validation and API/service behavior tests

Workspace commands:

- `npm run build`
- `npm test`
