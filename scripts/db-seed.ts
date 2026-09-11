import { closeDatabasePool } from "@/lib/db/database";
import { loadLocalEnvFiles } from "@/lib/db/run-migrations";
import { printCatalogReport, seedCatalog } from "@/features/topics/server/catalog-import";

async function main(): Promise<void> {
  loadLocalEnvFiles();

  try {
    const report = await seedCatalog();
    printCatalogReport(report);
  } finally {
    await closeDatabasePool();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
