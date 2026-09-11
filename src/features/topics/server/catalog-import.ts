import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db/database";
import { mediaAsset, topic } from "@/lib/db/schema";
import { isUuid } from "../topic-validation-schema";
import {
  catalogFixtureSchema,
  type CatalogFixture,
  type CatalogTopicInput,
} from "../topic-validation-schema";
import { newId } from "./topic-catalog-read";
import {
  catalogSeedFixtureV1,
  seedApeProjectEnvByTopicId,
} from "./catalog-seed-v1";
import {
  TopicConflictError,
  TopicNotFoundError,
  TopicValidationError,
} from "./topic-errors";
import {
  createTopic,
  publishTopic,
  unpublishTopic,
  type ApeProjectLookup,
} from "./topic-operations";

export type CatalogImportReport = {
  created: string[];
  skipped: string[];
  conflicts: string[];
  published: string[];
  drafts: string[];
  errors: string[];
};

const emptyReport = (): CatalogImportReport => ({
  created: [],
  skipped: [],
  conflicts: [],
  published: [],
  drafts: [],
  errors: [],
});

export function readCatalogFixtureFile(path: string): CatalogFixture {
  const raw = JSON.parse(readFileSync(resolve(path), "utf8")) as unknown;
  return catalogFixtureSchema.parse(raw);
}

export async function seedCatalog(options: {
  readProject?: ApeProjectLookup;
  fixture?: CatalogFixture;
} = {}): Promise<CatalogImportReport> {
  const fixture = options.fixture ?? catalogSeedFixtureV1;
  const topics = fixture.topics.map((item) => ({
    ...item,
    apeProjectId: item.apeProjectId ?? envProjectId(item.id),
  }));

  return importCatalogTopics(topics, {
    overwrite: false,
    publish: true,
    readProject: options.readProject,
  });
}

export async function importCatalogTopics(
  topics: CatalogTopicInput[],
  options: {
    overwrite: boolean;
    publish: boolean;
    readProject?: ApeProjectLookup;
  },
): Promise<CatalogImportReport> {
  const report = emptyReport();
  const db = getDatabase();

  for (const item of topics) {
    const existingById = await db
      .select({ id: topic.id, slug: topic.slug, version: topic.version, liveRevisionId: topic.liveRevisionId })
      .from(topic)
      .where(eq(topic.id, item.id))
      .limit(1);
    const existingBySlug = await db
      .select({ id: topic.id, slug: topic.slug })
      .from(topic)
      .where(eq(topic.slug, item.slug))
      .limit(1);

    if (existingBySlug[0] && existingBySlug[0].id !== item.id) {
      report.conflicts.push(
        `${item.id}: slug "${item.slug}" already belongs to ${existingBySlug[0].id}`,
      );
      continue;
    }

    if (existingById[0]) {
      if (!options.overwrite) {
        report.skipped.push(item.id);

        if (existingById[0].liveRevisionId) {
          report.published.push(item.id);
        } else {
          report.drafts.push(item.id);
        }

        continue;
      }

      report.conflicts.push(`${item.id}: already exists and overwrite is not used`);
      continue;
    }

    try {
      const artworkAssetId = item.artwork
        ? await insertBundledArtwork(item.artwork)
        : undefined;
      await createTopic({
        id: item.id,
        slug: item.slug,
        sortOrder: item.sortOrder,
        themeKey: item.themeKey,
        focalPosition: item.focalPosition,
        knowledgeReviewDate: item.knowledgeReviewDate,
        artworkAssetId,
        apeProjectId: item.apeProjectId,
        translations: item.translations,
      });
      report.created.push(item.id);

      if (options.publish && item.apeProjectId) {
        await tryPublish(item.id, 1, options.readProject, report);
      } else {
        report.drafts.push(item.id);
      }
    } catch (error) {
      if (error instanceof TopicConflictError) {
        report.conflicts.push(`${item.id}: ${error.message}`);
        continue;
      }

      report.errors.push(`${item.id}: ${errorMessage(error)}`);
    }
  }

  return report;
}

export async function publishTopicBySlug(
  slug: string,
  readProject?: ApeProjectLookup,
): Promise<void> {
  const current = await getTopicBySlugOrId(slug);
  await publishTopic({
    topicId: current.id,
    expectedVersion: current.version,
    readProject,
  });
}

export async function unpublishTopicBySlug(slug: string): Promise<void> {
  const current = await getTopicBySlugOrId(slug);
  await unpublishTopic({
    topicId: current.id,
    expectedVersion: current.version,
  });
}

async function tryPublish(
  topicId: string,
  expectedVersion: number,
  readProject: ApeProjectLookup | undefined,
  report: CatalogImportReport,
): Promise<void> {
  try {
    await publishTopic({ topicId, expectedVersion, readProject });
    report.published.push(topicId);
  } catch (error) {
    report.drafts.push(topicId);
    report.errors.push(`${topicId}: left as draft (${errorMessage(error)})`);
  }
}

async function insertBundledArtwork(artwork: {
  storageKey: string;
  mimeType: string;
  width: number;
  height: number;
  byteSize: number;
}): Promise<string> {
  const db = getDatabase();
  const existing = await db
    .select({ id: mediaAsset.id })
    .from(mediaAsset)
    .where(eq(mediaAsset.storageKey, artwork.storageKey))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const id = newId();

  try {
    await db.insert(mediaAsset).values({
      id,
      storageKind: "bundled",
      storageKey: artwork.storageKey,
      mimeType: artwork.mimeType,
      width: artwork.width,
      height: artwork.height,
      byteSize: artwork.byteSize,
      createdAt: new Date(),
    });
    return id;
  } catch (error) {
    if (error instanceof TopicConflictError) {
      throw error;
    }

    const raced = await db
      .select({ id: mediaAsset.id })
      .from(mediaAsset)
      .where(eq(mediaAsset.storageKey, artwork.storageKey))
      .limit(1);

    if (raced[0]) {
      return raced[0].id;
    }

    throw error;
  }
}

async function getTopicBySlugOrId(slugOrId: string): Promise<{
  id: string;
  version: number;
}> {
  const db = getDatabase();
  const bySlug = await db
    .select({ id: topic.id, version: topic.version })
    .from(topic)
    .where(eq(topic.slug, slugOrId))
    .limit(1);

  if (bySlug[0]) {
    return bySlug[0];
  }

  const byId = await db
    .select({ id: topic.id, version: topic.version })
    .from(topic)
    .where(eq(topic.id, slugOrId))
    .limit(1);

  if (byId[0]) {
    return byId[0];
  }

  throw new TopicNotFoundError();
}

function envProjectId(topicId: string): string | undefined {
  const envName = seedApeProjectEnvByTopicId[topicId];
  const value = envName ? process.env[envName]?.trim() : undefined;
  return value && isUuid(value) ? value : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export function printCatalogReport(report: CatalogImportReport): void {
  const lines = [
    `created: ${report.created.join(", ") || "none"}`,
    `skipped: ${report.skipped.join(", ") || "none"}`,
    `published: ${report.published.join(", ") || "none"}`,
    `drafts: ${report.drafts.join(", ") || "none"}`,
  ];

  if (report.conflicts.length > 0) {
    lines.push(`conflicts: ${report.conflicts.join("; ")}`);
  }

  if (report.errors.length > 0) {
    lines.push(`notes: ${report.errors.join("; ")}`);
  }

  console.log(lines.join("\n"));
}

export { TopicValidationError };
