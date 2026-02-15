# Operations and Troubleshooting

## 1. Development Commands

Install dependencies:

```bash
npm install
```

Run frontend + backend:

```bash
npm run dev
```

Build all workspaces:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## 2. Ports

- Frontend dev server: `5173`
- Backend API server: `4300`

If a port is occupied, stop conflicting processes or update local config.

## 3. Data Locations

- SQLite DB: `app/backend/data/simulations.db`
- Browser localStorage:
  - `simulator.comparison-presets.v1`
  - `simulator.timeline-mode.v1`
  - `simulator.timeline-source.v1`

## 4. Docker Operations

Start app with build:

```bash
./scripts/docker-deploy.sh up
```

Force clean rebuild:

```bash
./scripts/docker-deploy.sh rebuild
```

Other commands:

```bash
./scripts/docker-deploy.sh status
./scripts/docker-deploy.sh logs
./scripts/docker-deploy.sh health
./scripts/docker-deploy.sh restart
./scripts/docker-deploy.sh down
```

App endpoint in container mode:

- `http://localhost:4300`

## 5. Common Issues

### Frontend shows API request failures

Checks:

- Backend running on `4300`
- `GET /health` returns `{ "status": "ok" }`
- Vite proxy is configured (`/api -> backend`)

### Scenario save or delete fails

Checks:

- Input payload and scenario name pass validation
- SQLite file is writable (`app/backend/data`)
- Backend logs for route-level errors

### Timeline appears empty

Checks:

- Source is `Snapshots`: click `Run`/`Save` or click a saved scenario to append points
- Source is `Saved`: ensure at least two scenarios are saved

### Export buttons disabled

Expected behavior:

- `Report JSON` requires an available simulation output
- `Scenarios CSV` requires at least one saved scenario
- `Full Backup JSON` always available

### Build fails in one workspace

Run each workspace build to isolate:

```bash
npm run build:shared
npm run build:engine
npm run build:backend
npm run build:frontend
```

### Tests failing at root

Isolate by workspace:

```bash
npm run test:engine
npm run test:backend
```

## 6. Safe Local Reset

1. Stop running processes.
2. Reinstall dependencies (`npm install`).
3. Optionally remove DB (`app/backend/data/simulations.db`) to reset scenarios.
4. Optionally clear browser localStorage keys listed above to reset presets/timeline UI state.

## 7. Recommended Change Workflow

1. Update model logic in `app/simulation-engine`.
2. Keep contracts synced in `app/shared-types`.
3. Integrate/validate routes in `app/backend`.
4. Wire UI behavior in `app/frontend`.
5. Run `npm run build` and `npm test` before release.
