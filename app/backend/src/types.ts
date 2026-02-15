import type { SimulationInput, SimulationOutput } from "@sim/shared-types";

export interface CreateScenarioRequest {
  name: string;
  input: SimulationInput;
}

export interface ScenarioRow {
  id: number;
  name: string;
  created_at: string;
  input_json: string;
  output_json: string;
}

export interface ScenarioResponse {
  id: number;
  name: string;
  createdAt: string;
  input: SimulationInput;
  output: SimulationOutput;
}
