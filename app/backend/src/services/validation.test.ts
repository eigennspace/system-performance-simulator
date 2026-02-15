import { describe, expect, it } from "vitest";
import { runSimulation } from "@sim/simulation-engine";
import { createScenarioSchema, simulationInputSchema } from "./validation";

describe("backend validation", () => {
  it("accepts valid simulation input and runs simulation", () => {
    const input = {
      requestsPerSecond: 220,
      averageLatencyMs: 180,
      threadPoolSize: 64,
      queueSize: 500,
      cpuCores: 8,
      targetUtilizationPct: 72,
      timeoutThresholdMs: 1200,
    };

    const parsed = simulationInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      const output = runSimulation(parsed.data);
      expect(output.metrics.concurrencyRequired).toBeGreaterThan(0);
      expect(output.autoscalingAdvisor).toBeDefined();
    }
  });

  it("rejects invalid scenario payload", () => {
    const parsed = createScenarioSchema.safeParse({
      name: "a",
      input: {
        requestsPerSecond: -5,
      },
    });

    expect(parsed.success).toBe(false);
  });
});
