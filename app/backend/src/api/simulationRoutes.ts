import { Router } from "express";
import { runSimulation } from "@sim/simulation-engine";
import {
  createScenario,
  deleteScenarioById,
  listScenarios,
} from "../services/scenarioService.js";
import {
  createScenarioSchema,
  simulationInputSchema,
} from "../services/validation.js";

const router = Router();

router.post("/simulate", (req, res) => {
  const parsed = simulationInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid input",
      details: parsed.error.errors.map((issue) => issue.message),
    });
    return;
  }

  const output = runSimulation(parsed.data);
  res.json(output);
});

router.get("/scenarios", async (_req, res, next) => {
  try {
    const scenarios = await listScenarios();
    res.json(scenarios);
  } catch (error) {
    next(error);
  }
});

router.post("/scenarios", async (req, res, next) => {
  const parsed = createScenarioSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid scenario payload",
      details: parsed.error.errors.map((issue) => issue.message),
    });
    return;
  }

  try {
    const output = runSimulation(parsed.data.input);
    const saved = await createScenario(parsed.data.name, parsed.data.input, output);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

router.delete("/scenarios/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid scenario id" });
    return;
  }

  try {
    const deleted = await deleteScenarioById(id);
    if (!deleted) {
      res.status(404).json({ error: "Scenario not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
