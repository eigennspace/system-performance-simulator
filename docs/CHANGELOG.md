# Changelog

All notable changes to this project and its documentation are tracked in this file.

This changelog follows a concise, human-first format inspired by Keep a Changelog and Semantic Versioning.

## [Unreleased]

### Added

- Placeholder for upcoming release notes.

## [0.2.0] - 2026-02-15

### Added

- Scenario management improvements:
  - Delete saved scenario from dashboard (`Del` action)
  - API support for scenario deletion (`DELETE /api/scenarios/:id`)
- Utilization Timeline enhancements:
  - Source toggle: `Snapshots` vs `Saved`
  - Mode toggle: `Absolute` vs `Normalized`
  - Persisted source/mode in localStorage
  - `Reset Timeline` for snapshot history
  - Snapshot append on `Run`, `Save`, and clicking a saved scenario
- Comparison workflow upgrades:
  - Side-by-side overlay with delta metrics and recommendation/warning diff
  - Pin comparison presets
  - Favorite/star presets and show them on main dashboard shortcuts
- Export/download toolkit in sidebar:
  - `Report JSON`
  - `Scenarios CSV`
  - `Full Backup JSON`
- Dockerized deployment assets:
  - `Dockerfile`
  - `docker-compose.yml`
  - `scripts/docker-deploy.sh`

### Changed

- RPS vs Latency curve rendering for readability and stability:
  - Dynamic normalization so line remains visible across wide value ranges
  - Top/bottom chart padding
  - Aggressive queueing-style knee behavior
  - Endpoint and operating-point markers
- Utilization Timeline control layout made responsive to prevent controls overflowing the panel.

### Documentation

- Rewrote and aligned all docs with implemented behavior:
  - `README.md`
  - `docs/USER_GUIDE.md`
  - `docs/API.md`
  - `docs/ARCHITECTURE.md`
  - `docs/SIMULATION_MODEL.md`
  - `docs/OPERATIONS.md`

## [0.1.0] - 2026-02-15

### Added

- Initial monorepo implementation:
  - React + Vite frontend dashboard
  - Express backend API
  - Shared typed contracts
  - Simulation engine module
- Core simulation model:
  - Little's Law calculations
  - Derived utilization, queue pressure, throughput, saturation probability
  - Bottleneck and queue-risk classifications
  - Heuristic autoscaling advisor
- Scenario persistence and workflows:
  - Save/load scenarios with SQLite
- Testing and quality baseline:
  - Engine and backend test suites
  - Workspace build/test scripts

### Documentation

- Added initial docs set in `docs/`:
  - `USER_GUIDE.md`
  - `API.md`
  - `ARCHITECTURE.md`
  - `SIMULATION_MODEL.md`
  - `OPERATIONS.md`
- Added changelog at `docs/CHANGELOG.md`.
