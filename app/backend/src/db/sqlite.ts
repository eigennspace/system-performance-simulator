import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = resolve(process.cwd(), "app/backend/data/simulations.db");
  await mkdir(dirname(dbPath), { recursive: true });

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      input_json TEXT NOT NULL,
      output_json TEXT NOT NULL
    );
  `);

  return dbInstance;
}
