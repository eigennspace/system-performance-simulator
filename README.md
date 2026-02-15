# System Performance Simulator (Little's Law Tool)

Developer-focused capacity planning dashboard for backend systems.
It combines Little's Law with practical queueing heuristics to help engineers identify bottlenecks, estimate safe capacity, compare scenarios, and export analysis artifacts.

## Feature Highlights

- Real-time simulation from operational inputs (`RPS`, latency, thread pool, queue)
- Bottleneck classification and saturation risk heuristics
- Scenario persistence with SQLite (save, load, delete)
- Scenario comparison overlay (baseline vs candidate + metric deltas)
- Pinned comparison presets + favorites shown on dashboard
- Utilization Timeline with source toggle (`Snapshots` vs `Saved`) and mode toggle (`Absolute` vs `Normalized`)
- Export/download toolkit:
  - Current report JSON
  - Saved scenarios CSV
  - Full backup JSON
- Single-container Docker deployment serving both API and built frontend

## Documentation

- User Guide: `docs/USER_GUIDE.md`
- API Reference: `docs/API.md`
- Architecture: `docs/ARCHITECTURE.md`
- Simulation Model: `docs/SIMULATION_MODEL.md`
- Operations & Troubleshooting: `docs/OPERATIONS.md`
- Changelog: `docs/CHANGELOG.md`

## Quick Start

### Requirements

- Node.js 20+
- npm 10+

### Install and Run

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4300`

### Build and Test

```bash
npm run build
npm test
```

## Docker Deployment

Build and run with Docker Compose:

```bash
./scripts/docker-deploy.sh up
```

App URL:

- `http://localhost:4300`

Useful Docker commands:

```bash
./scripts/docker-deploy.sh status
./scripts/docker-deploy.sh logs
./scripts/docker-deploy.sh health
./scripts/docker-deploy.sh rebuild
./scripts/docker-deploy.sh down
```

## Monorepo Structure

- `app/shared-types`: shared contracts and models
- `app/simulation-engine`: pure simulation logic and heuristics
- `app/backend`: Express API + SQLite scenario persistence + static serving in production
- `app/frontend`: React + Vite dashboard UI
