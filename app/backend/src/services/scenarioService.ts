import type { SimulationInput, SimulationOutput } from "@sim/shared-types";
import { getDb } from "../db/sqlite.js";
import type { ScenarioResponse, ScenarioRow } from "../types.js";

function mapRow(row: ScenarioRow): ScenarioResponse {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    input: JSON.parse(row.input_json) as SimulationInput,
    output: JSON.parse(row.output_json) as SimulationOutput,
  };
}

export async function listScenarios(): Promise<ScenarioResponse[]> {
  const db = await getDb();
  const rows = (await db.all<ScenarioRow[]>(
    `SELECT id, name, created_at, input_json, output_json
     FROM scenarios
     ORDER BY id DESC
     LIMIT 100`
  )) as ScenarioRow[];

  return rows.map(mapRow);
}

export async function createScenario(
  name: string,
  input: SimulationInput,
  output: SimulationOutput,
): Promise<ScenarioResponse> {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  const result = await db.run(
    `INSERT INTO scenarios (name, created_at, input_json, output_json)
     VALUES (?, ?, ?, ?)`,
    [name, createdAt, JSON.stringify(input), JSON.stringify(output)],
  );

  const id = result.lastID;
  const row = (await db.get<ScenarioRow>(
    `SELECT id, name, created_at, input_json, output_json FROM scenarios WHERE id = ?`,
    [id],
  )) as ScenarioRow | undefined;

  if (!row) {
    throw new Error("Failed to fetch saved scenario");
  }

  return mapRow(row);
}

export async function deleteScenarioById(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.run(`DELETE FROM scenarios WHERE id = ?`, [id]);
  return (result.changes ?? 0) > 0;
}
