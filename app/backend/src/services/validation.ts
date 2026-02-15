import { z } from "zod";

export const simulationInputSchema = z.object({
  requestsPerSecond: z.number().positive().max(1_000_000),
  averageLatencyMs: z.number().positive().max(120_000),
  threadPoolSize: z.number().int().positive().max(100_000),
  queueSize: z.number().int().nonnegative().max(1_000_000),
  cpuCores: z.number().int().positive().max(2048).optional(),
  targetUtilizationPct: z.number().min(1).max(99),
  timeoutThresholdMs: z.number().positive().max(300_000),
});

export const createScenarioSchema = z.object({
  name: z.string().trim().min(2).max(120),
  input: simulationInputSchema,
});
