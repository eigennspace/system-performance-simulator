import { describe, expect, it } from "vitest";
import { calculateMetrics, runSimulation } from "./index";

describe("simulation-engine", () => {
  it("computes Little's Law derived concurrency", () => {
    const result = calculateMetrics({
      requestsPerSecond: 100,
      averageLatencyMs: 200,
      threadPoolSize: 40,
      queueSize: 500,
      targetUtilizationPct: 80,
      timeoutThresholdMs: 2000,
    });

    expect(result.concurrencyRequired).toBeCloseTo(20, 5);
    expect(result.throughputLimit).toBeCloseTo(200, 5);
  });

  it("flags overload and returns autoscaling advisor values", () => {
    const output = runSimulation({
      requestsPerSecond: 800,
      averageLatencyMs: 500,
      threadPoolSize: 100,
      queueSize: 50,
      targetUtilizationPct: 70,
      timeoutThresholdMs: 600,
    });

    expect(output.bottleneck).toBe("system_overload");
    expect(output.queueExplosionRisk).toBe("high");
    expect(output.autoscalingAdvisor.recommendedThreadPoolSize).toBeGreaterThan(100);
    expect(output.autoscalingAdvisor.estimatedQueueWaitMs).toBe(null);
  });
});
