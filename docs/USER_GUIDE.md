# User Guide

## 1. What This App Does

System Performance Simulator helps you reason about backend capacity using a first-order queueing model:

- Little's Law (`L = λ × W`)
- Utilization and queue pressure thresholds
- Bottleneck and saturation heuristics
- Autoscaling guidance based on current operating point

Use it for:

- capacity planning before launches
- production risk assessment
- scenario what-if reviews
- scaling decision support

## 2. Main Workflow

1. Set simulation inputs in the left panel.
2. Click `Run` to append a timeline snapshot, or let live dashboard auto-refresh from input edits.
3. Review cards, graphs, and operational insights.
4. Click `Save` to persist a scenario in SQLite.
5. Compare scenarios, pin presets, and favorite important pairs.
6. Export your analysis (`Report JSON`, `Scenarios CSV`, `Full Backup JSON`).

## 3. Simulation Inputs

- `RPS`: incoming requests per second (`λ`)
- `Avg Latency (ms)`: observed average latency (`W`)
- `Thread Pool Size`: available concurrent workers
- `Queue Size`: maximum buffered requests beyond workers
- `CPU Cores (optional)`: currently informational only
- `Target Utilization (%)`: desired safe utilization target
- `Timeout Threshold (ms)`: threshold for timeout-risk signals

## 4. Dashboard Panels

### Metric Cards

- Required Concurrency
- Thread Utilization
- Queue Pressure
- Throughput Limit
- Saturation Probability
- Bottleneck

Each card has a `?` tooltip explaining metric meaning.

### Utilization Gauge

Quick visual status for utilization health.

### RPS vs Latency Curve

Queueing-style nonlinear curve calibrated to your current operating point.

- Always visible across input ranges
- Dynamic normalization with top/bottom padding
- Start/end markers plus operating-point marker for readability

### Operational Insights

Shows warning list and recommendation text produced by model heuristics.

### Utilization Timeline

Tracks utilization and latency over captured points.

Controls:

- Source toggle:
  - `Snapshots`: points captured on `Run`, `Save`, and clicking a saved scenario
  - `Saved`: points derived from persisted saved scenarios
- Mode toggle:
  - `Absolute`: shows absolute thresholds
  - `Normalized`: shows relative movement/trend
- `Reset Timeline`: clears only snapshot timeline points

Persistence:

- Timeline mode and source selections are stored in browser localStorage and restored on refresh.

### Autoscaling Advisor

Shows:

- service rate estimate
- traffic intensity
- estimated queue wait (or `Unbounded` when λ >= μ)
- recommended thread pool size
- estimated minimum instance count

## 5. Saved Scenarios

### Save

- Enter scenario name
- Click `Save`

### Load

- Click any saved scenario row to load its input/output
- Loading a saved scenario also appends a snapshot point

### Delete

- Click `Del` on a scenario row to remove it from SQLite

## 6. Comparison Overlay

Open `Compare` (requires at least two saved scenarios).

Capabilities:

- Select `Baseline` and `Candidate`
- Side-by-side metric table with deltas
- Bottleneck and queue-risk transition summary
- Recommendation diff
- Warning diff (introduced vs resolved)
- `Load Candidate Into Simulator`

## 7. Presets and Favorites

### Pin comparison preset

In overlay:

1. Enter label
2. Click `Pin Preset`

Saved preset contains:

- baseline scenario id
- candidate scenario id
- name
- timestamp
- starred state

### Favorite preset

- Toggle `☆` / `★`

### Main dashboard shortcut

Favorited presets appear under `Favorite Comparisons` in sidebar:

- main button applies pair selection
- `Load` button loads candidate input directly

## 8. Export / Download

In sidebar `Export / Download`:

- `Report JSON`: current input/output + snapshot timeline
- `Scenarios CSV`: all saved scenarios and key metrics
- `Full Backup JSON`: current state + snapshots + saved scenarios + presets

## 9. Interpretation Tips

- High utilization with high queue pressure indicates overload risk.
- Saturation probability near 1.0 indicates low headroom.
- Queue pressure can be 0 while system is still constrained if concurrency has not exceeded thread pool yet.
- Treat all recommendations as heuristics; validate with production telemetry and load testing.
