import { closeDatabasePool } from "@/lib/db/database";
import {
  applyReviewedMigrations,
  loadLocalEnvFiles,
} from "@/lib/db/run-migrations";

async function main(): Promise<void> {
  loadLocalEnvFiles();

  try {
    await applyReviewedMigrations();
  } finally {
    await closeDatabasePool();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
