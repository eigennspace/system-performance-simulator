export type BottleneckClassification =
  | "healthy"
  | "thread_pool_saturation"
  | "queue_saturation"
  | "timeout_risk"
  | "system_overload";

export type QueueExplosionRisk = "low" | "medium" | "high";

export interface SimulationInput {
  requestsPerSecond: number;
  averageLatencyMs: number;
  threadPoolSize: number;
  queueSize: number;
  cpuCores?: number;
  targetUtilizationPct: number;
  timeoutThresholdMs: number;
}

export interface SimulationMetrics {
  concurrencyRequired: number;
  utilizationRatio: number;
  utilizationPct: number;
  queuePressure: number;
  throughputLimit: number;
  saturationProbability: number;
}

export interface AutoscalingAdvisor {
  currentServiceRateRps: number;
  trafficIntensity: number;
  estimatedQueueWaitMs: number | null;
  recommendedThreadPoolSize: number;
  estimatedMinInstances: number;
}

export interface SimulationOutput {
  input: SimulationInput;
  metrics: SimulationMetrics;
  bottleneck: BottleneckClassification;
  queueExplosionRisk: QueueExplosionRisk;
  autoscalingAdvisor: AutoscalingAdvisor;
  scalingRecommendation: string;
  warnings: string[];
}

export interface SimulationScenarioRecord {
  id: number;
  name: string;
  createdAt: string;
  input: SimulationInput;
  output: SimulationOutput;
}

export interface ApiError {
  error: string;
  details?: string[];
}
