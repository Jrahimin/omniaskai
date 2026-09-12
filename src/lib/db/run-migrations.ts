import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { sql } from "drizzle-orm";

import { getDatabase } from "./database";
import { getDatabaseUrl } from "./database-env";
import { schemaMigration } from "./schema";

export const MIGRATION_FILES = [
  "0001_phase2_product_foundation.sql",
  "0002_phase2_admin_feedback.sql",
] as const;

export function loadLocalEnvFiles(): void {
  for (const filename of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), filename);

    if (existsSync(path)) {
      process.loadEnvFile(path);
    }
  }
}

export async function applyReviewedMigrations(): Promise<void> {
  getDatabaseUrl();
  const db = getDatabase();

  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS schema_migration (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL
      )
    `));
  } catch (error) {
    const detail =
      error instanceof Error && "cause" in error && error.cause instanceof Error
        ? error.cause.message
        : error instanceof Error
          ? error.message
          : "unknown database error";
    throw new Error(`Could not apply schema_migration table: ${detail}`);
  }

  const applied = new Set(
    (await db.select({ id: schemaMigration.id }).from(schemaMigration)).map(
      (row) => row.id,
    ),
  );

  for (const filename of MIGRATION_FILES) {
    if (applied.has(filename)) {
      continue;
    }

    const sqlPath = resolve(process.cwd(), "drizzle", filename);
    const body = readFileSync(sqlPath, "utf8");

    await db.transaction(async (tx) => {
      await tx.execute(sql.raw(body));
      await tx.insert(schemaMigration).values({
        id: filename,
        appliedAt: new Date(),
      });
    });
  }
}
