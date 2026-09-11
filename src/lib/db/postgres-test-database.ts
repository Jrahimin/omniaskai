import { sql } from "drizzle-orm";

import { closeDatabasePool, getDatabase } from "./database";
import {
  assertIsolatedTestDatabaseUrl,
  resolveIntegrationTestDatabaseUrl,
} from "./database-env";
import { applyReviewedMigrations, loadLocalEnvFiles } from "./run-migrations";

let prepared = false;

export async function preparePostgresForIntegrationTests(): Promise<void> {
  loadLocalEnvFiles();
  const testUrl = resolveIntegrationTestDatabaseUrl();
  process.env.DATABASE_URL = testUrl;
  await closeDatabasePool();
  assertIsolatedTestDatabaseUrl(testUrl);

  if (prepared) {
    return;
  }

  await applyReviewedMigrations();
  prepared = true;
}

export async function resetProductTables(): Promise<void> {
  assertIsolatedTestDatabaseUrl(process.env.DATABASE_URL ?? "");
  await getDatabase().execute(sql`
    TRUNCATE TABLE
      answer_feedback,
      conversation_turn_operation,
      conversation_reference,
      topic_knowledge_mapping,
      topic_revision_translation,
      topic_revision,
      topic,
      media_asset,
      session,
      account,
      verification,
      rate_limit,
      "user"
    RESTART IDENTITY CASCADE
  `);
}

export async function closePostgresForIntegrationTests(): Promise<void> {
  await closeDatabasePool();
  prepared = false;
}
