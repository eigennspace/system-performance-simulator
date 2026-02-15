import type {
  AutoscalingAdvisor,
  BottleneckClassification,
  QueueExplosionRisk,
  SimulationInput,
  SimulationMetrics,
  SimulationOutput,
} from "@sim/shared-types";

const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

export function calculateMetrics(input: SimulationInput): SimulationMetrics {
  const latencySec = input.averageLatencyMs / 1000;
  const concurrencyRequired = input.requestsPerSecond * latencySec;

  const safeThreadCapacity =
    input.threadPoolSize * (input.targetUtilizationPct / 100);
  const utilizationRatio =
    safeThreadCapacity > 0 ? concurrencyRequired / safeThreadCapacity : 1;

  const queueDepthNeeded = Math.max(0, concurrencyRequired - input.threadPoolSize);
  const queuePressure =
    input.queueSize > 0 ? queueDepthNeeded / input.queueSize : queueDepthNeeded;

  const throughputLimit = latencySec > 0 ? input.threadPoolSize / latencySec : 0;
  const timeoutProximity =
    input.timeoutThresholdMs > 0
      ? input.averageLatencyMs / input.timeoutThresholdMs
      : 1;

  const saturationProbability = clamp(
    0.55 * utilizationRatio +
      0.3 * queuePressure +
      0.15 * clamp(timeoutProximity, 0, 2),
  );

  return {
    concurrencyRequired,
    utilizationRatio,
    utilizationPct: utilizationRatio * 100,
    queuePressure,
    throughputLimit,
    saturationProbability,
  };
}

export function classifyBottleneck(
  input: SimulationInput,
  metrics: SimulationMetrics,
): BottleneckClassification {
  const timeoutProximity = input.averageLatencyMs / input.timeoutThresholdMs;

  if (metrics.utilizationRatio > 1.15 && metrics.queuePressure > 1) {
    return "system_overload";
  }

  if (metrics.queuePressure > 0.8) {
    return "queue_saturation";
  }

  if (metrics.utilizationRatio > 1) {
    return "thread_pool_saturation";
  }

  if (timeoutProximity >= 0.85) {
    return "timeout_risk";
  }

  return "healthy";
}

export function classifyQueueRisk(metrics: SimulationMetrics): QueueExplosionRisk {
  if (metrics.queuePressure > 1 || metrics.saturationProbability > 0.85) {
    return "high";
  }
  if (metrics.queuePressure > 0.5 || metrics.saturationProbability > 0.6) {
    return "medium";
  }
  return "low";
}

export function createScalingRecommendation(
  input: SimulationInput,
  metrics: SimulationMetrics,
  bottleneck: BottleneckClassification,
): string {
  switch (bottleneck) {
    case "healthy":
      return "System is within safe bounds. Track latency variance before increasing traffic.";
    case "thread_pool_saturation": {
      const suggestedThreads = Math.ceil(
        metrics.concurrencyRequired / (input.targetUtilizationPct / 100),
      );
      return `Thread pool saturation detected. Increase worker threads toward ${suggestedThreads} or reduce latency to reclaim concurrency.`;
    }
    case "queue_saturation":
      return "Queue saturation risk is elevated. Increase processing capacity first; queue growth without capacity can amplify tail latency.";
    case "timeout_risk":
      return "Latency is approaching timeout threshold. Optimize critical path latency or increase timeout only with downstream protections.";
    case "system_overload":
      return "System operating beyond safe utilization. Horizontal scaling recommended with immediate load shedding or rate limiting.";
    default:
      return "Review system tuning parameters.";
  }
}

export function buildWarnings(
  input: SimulationInput,
  metrics: SimulationMetrics,
  bottleneck: BottleneckClassification,
): string[] {
  const warnings: string[] = [];
  const timeoutProximity = input.averageLatencyMs / input.timeoutThresholdMs;

  if (metrics.utilizationRatio > 1) {
    warnings.push("Thread pool saturation detected");
  }
  if (metrics.utilizationRatio > 1.2) {
    warnings.push("System operating beyond safe utilization");
  }
  if (metrics.queuePressure > 0.7) {
    warnings.push("Queue growth may accelerate non-linearly under burst traffic");
  }
  if (timeoutProximity > 0.9) {
    warnings.push("Latency increase will exponentially increase queue wait");
  }
  if (bottleneck === "system_overload") {
    warnings.push("Horizontal scaling recommended");
  }

  return warnings;
}

export function buildAutoscalingAdvisor(
  input: SimulationInput,
  metrics: SimulationMetrics,
): AutoscalingAdvisor {
  const latencySec = input.averageLatencyMs / 1000;
  const serviceRateRps = metrics.throughputLimit;
  const lambda = input.requestsPerSecond;
  const trafficIntensity = serviceRateRps > 0 ? lambda / serviceRateRps : 1;

  // M/M/1 intuition: Wq = rho / (mu - lambda), only valid when lambda < mu.
  const estimatedQueueWaitMs =
    lambda < serviceRateRps && serviceRateRps > 0
      ? (trafficIntensity / (serviceRateRps - lambda)) * 1000
      : null;

  const targetRatio = input.targetUtilizationPct / 100;
  const recommendedThreadPoolSize = Math.max(
    1,
    Math.ceil(metrics.concurrencyRequired / targetRatio),
  );

  // M/M/c-style capacity suggestion using current thread pool as per-instance server count.
  const estimatedMinInstances = Math.max(
    1,
    Math.ceil(recommendedThreadPoolSize / input.threadPoolSize),
  );

  return {
    currentServiceRateRps: serviceRateRps,
    trafficIntensity,
    estimatedQueueWaitMs,
    recommendedThreadPoolSize,
    estimatedMinInstances,
  };
}

export function runSimulation(input: SimulationInput): SimulationOutput {
  const metrics = calculateMetrics(input);
  const bottleneck = classifyBottleneck(input, metrics);
  const queueExplosionRisk = classifyQueueRisk(metrics);
  const autoscalingAdvisor = buildAutoscalingAdvisor(input, metrics);
  const scalingRecommendation = createScalingRecommendation(
    input,
    metrics,
    bottleneck,
  );
  const warnings = buildWarnings(input, metrics, bottleneck);

  return {
    input,
    metrics,
    bottleneck,
    queueExplosionRisk,
    autoscalingAdvisor,
    scalingRecommendation,
    warnings,
  };
}
