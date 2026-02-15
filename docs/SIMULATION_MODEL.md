# Simulation Model

## 1. Core Law

Little's Law:

- `L = λ × W`
- `L`: required concurrency
- `λ`: incoming request rate (`requestsPerSecond`)
- `W`: average latency in seconds (`averageLatencyMs / 1000`)

Computed as:

- `concurrencyRequired = requestsPerSecond * latencySec`

## 2. Derived Metrics

### Utilization

- `safeThreadCapacity = threadPoolSize * (targetUtilizationPct / 100)`
- `utilizationRatio = concurrencyRequired / safeThreadCapacity`
- `utilizationPct = utilizationRatio * 100`

### Queue Pressure

- `queueDepthNeeded = max(0, concurrencyRequired - threadPoolSize)`
- `queuePressure = queueDepthNeeded / queueSize` (or raw `queueDepthNeeded` when `queueSize == 0`)

### Throughput Limit

- `throughputLimit = threadPoolSize / latencySec`

### Saturation Probability (Heuristic)

- `timeoutProximity = averageLatencyMs / timeoutThresholdMs`
- `saturationProbability = clamp(0.55*utilizationRatio + 0.3*queuePressure + 0.15*clamp(timeoutProximity, 0, 2), 0, 1)`

## 3. Classification Rules

### Bottleneck (order-sensitive)

1. `system_overload` when `utilizationRatio > 1.15` and `queuePressure > 1`
2. `queue_saturation` when `queuePressure > 0.8`
3. `thread_pool_saturation` when `utilizationRatio > 1`
4. `timeout_risk` when `timeoutProximity >= 0.85`
5. `healthy` otherwise

### Queue Explosion Risk

- `high` when `queuePressure > 1` OR `saturationProbability > 0.85`
- `medium` when `queuePressure > 0.5` OR `saturationProbability > 0.6`
- `low` otherwise

## 4. Warning Rules

Warnings are emitted when thresholds are crossed:

- utilization ratio `> 1.0`: thread pool saturation warning
- utilization ratio `> 1.2`: system beyond safe utilization warning
- queue pressure `> 0.7`: queue growth warning
- timeout proximity `> 0.9`: latency timeout proximity warning
- bottleneck `system_overload`: horizontal scaling warning

## 5. Autoscaling Advisor (Heuristic)

### Service and Intensity

- `currentServiceRateRps = throughputLimit`
- `trafficIntensity (ρ) = λ / μ`

### Estimated Queue Wait (M/M/1 intuition)

- `Wq = ρ / (μ - λ)` only when `λ < μ`
- Output in ms
- If `λ >= μ`, queue wait is `null` and UI shows `Unbounded`

### Capacity Recommendation

- `recommendedThreadPoolSize = ceil(concurrencyRequired / targetUtilizationRatio)`
- `estimatedMinInstances = ceil(recommendedThreadPoolSize / currentThreadPoolSize)`

## 6. RPS vs Latency Curve Rendering

UI curve behavior is derived from queueing shape assumptions (not from historical trace replay):

- Calibrates service time from current operating point
- Samples increasing utilization ratio (`ρ`) toward saturation knee
- Uses logarithmic normalization so curve remains visible across wide value ranges
- Applies top/bottom vertical padding for readability
- Displays start, end, and current operating markers

## 7. Scope and Limitations

- Model is a first-order capacity heuristic, not a full discrete-event simulator.
- Does not model percentile latency, burst distributions, I/O contention, retries, or circuit-breaker dynamics.
- Use with production telemetry, load tests, and SLO objectives before operational changes.
