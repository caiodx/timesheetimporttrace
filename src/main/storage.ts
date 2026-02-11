import { app } from "electron";
import Database from "better-sqlite3";
import * as path from "path";

export interface EnvironmentSettings {
  current: string;
  customHost: string;
}

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath("userData"), "settings.db");
    db = new Database(dbPath);
    db.prepare(
      "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
    ).run();
  }
  return db;
}

export function getEnvironmentSettings(): EnvironmentSettings | null {
  const database = getDb();
  const row = database
    .prepare("SELECT value FROM app_settings WHERE key = ?")
    .get("environment") as { value: string } | undefined;

  if (!row) return null;

  try {
    return JSON.parse(row.value) as EnvironmentSettings;
  } catch {
    return null;
  }
}

export function saveEnvironmentSettings(settings: EnvironmentSettings): void {
  const database = getDb();
  const value = JSON.stringify(settings);

  database
    .prepare(
      "INSERT INTO app_settings (key, value) VALUES (@key, @value) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run({ key: "environment", value });
}

