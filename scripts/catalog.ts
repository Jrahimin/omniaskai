import { closeDatabasePool } from "@/lib/db/database";
import { loadLocalEnvFiles } from "@/lib/db/run-migrations";
import {
  importCatalogTopics,
  printCatalogReport,
  publishTopicBySlug,
  readCatalogFixtureFile,
  unpublishTopicBySlug,
} from "@/features/topics/server/catalog-import";

loadLocalEnvFiles();

const [command, ...rest] = process.argv.slice(2);

async function main(): Promise<void> {
  try {
    if (command === "import") {
      const path = rest.find((arg) => !arg.startsWith("--"));
      const publish = rest.includes("--publish");

      if (!path) {
        throw new Error("Usage: npm run catalog -- import <file.json> [--publish]");
      }

      const fixture = readCatalogFixtureFile(path);
      const report = await importCatalogTopics(fixture.topics, {
        overwrite: false,
        publish,
      });
      printCatalogReport(report);

      if (report.conflicts.length > 0) {
        process.exitCode = 1;
      }
    } else if (command === "publish") {
      const slug = rest[0];

      if (!slug) {
        throw new Error("Usage: npm run catalog -- publish <slug>");
      }

      await publishTopicBySlug(slug);
      console.log(`Published ${slug}`);
    } else if (command === "unpublish") {
      const slug = rest[0];

      if (!slug) {
        throw new Error("Usage: npm run catalog -- unpublish <slug>");
      }

      await unpublishTopicBySlug(slug);
      console.log(`Unpublished ${slug}`);
    } else {
      throw new Error(
        "Usage: npm run catalog -- <import <file.json> [--publish]|publish <slug>|unpublish <slug>>",
      );
    }
  } finally {
    await closeDatabasePool();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
