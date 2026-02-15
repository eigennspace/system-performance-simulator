# API Reference

Base URL (local dev): `http://localhost:4300`

## Health

### GET `/health`

Returns service status.

Response (`200`):

```json
{ "status": "ok" }
```

## Run Simulation

### POST `/api/simulate`

Runs simulation for an input payload.

Request body:

```json
{
  "requestsPerSecond": 220,
  "averageLatencyMs": 180,
  "threadPoolSize": 64,
  "queueSize": 500,
  "cpuCores": 8,
  "targetUtilizationPct": 72,
  "timeoutThresholdMs": 1200
}
```

Validation rules:

- `requestsPerSecond`: number `> 0`, max `1,000,000`
- `averageLatencyMs`: number `> 0`, max `120,000`
- `threadPoolSize`: integer `> 0`, max `100,000`
- `queueSize`: integer `>= 0`, max `1,000,000`
- `cpuCores`: optional integer `> 0`, max `2,048`
- `targetUtilizationPct`: number `1..99`
- `timeoutThresholdMs`: number `> 0`, max `300,000`

Success response (`200`): `SimulationOutput`

```json
{
  "input": {
    "requestsPerSecond": 220,
    "averageLatencyMs": 180,
    "threadPoolSize": 64,
    "queueSize": 500,
    "cpuCores": 8,
    "targetUtilizationPct": 72,
    "timeoutThresholdMs": 1200
  },
  "metrics": {
    "concurrencyRequired": 39.6,
    "utilizationRatio": 0.86,
    "utilizationPct": 86,
    "queuePressure": 0,
    "throughputLimit": 355.55,
    "saturationProbability": 0.53
  },
  "bottleneck": "healthy",
  "queueExplosionRisk": "low",
  "autoscalingAdvisor": {
    "currentServiceRateRps": 355.55,
    "trafficIntensity": 0.62,
    "estimatedQueueWaitMs": 4.6,
    "recommendedThreadPoolSize": 55,
    "estimatedMinInstances": 1
  },
  "scalingRecommendation": "...",
  "warnings": ["..."]
}
```

Error response (`400`):

```json
{
  "error": "Invalid input",
  "details": ["Number must be greater than 0"]
}
```

## List Scenarios

### GET `/api/scenarios`

Returns latest saved scenarios (up to 100), sorted by newest first.

Response (`200`): array of `SimulationScenarioRecord`.

## Save Scenario

### POST `/api/scenarios`

Creates and stores a scenario.

Request body:

```json
{
  "name": "Peak Traffic Baseline",
  "input": {
    "requestsPerSecond": 220,
    "averageLatencyMs": 180,
    "threadPoolSize": 64,
    "queueSize": 500,
    "cpuCores": 8,
    "targetUtilizationPct": 72,
    "timeoutThresholdMs": 1200
  }
}
```

Validation rules:

- `name`: trimmed string length `2..120`
- `input`: same rules as `/api/simulate`

Success response (`201`): saved `SimulationScenarioRecord`.

Error response (`400`):

```json
{
  "error": "Invalid scenario payload",
  "details": ["String must contain at least 2 character(s)"]
}
```

## Delete Scenario

### DELETE `/api/scenarios/:id`

Deletes one saved scenario by numeric id.

Success response (`204`): no body.

Error responses:

- `400` when id is invalid

```json
{ "error": "Invalid scenario id" }
```

- `404` when id does not exist

```json
{ "error": "Scenario not found" }
```

## Error Envelope

Most API errors follow:

```json
{
  "error": "message",
  "details": ["optional detail lines"]
}
```
