import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { ApeProjectLookup } from "./topic-operations";
import {
  importCatalogTopics,
  seedCatalog,
} from "./catalog-import";
import { catalogSeedFixtureV1 } from "./catalog-seed-v1";
import { loadPublishedTopicBySlugFromDatabase, loadPublishedTopicsFromDatabase } from "./topic-catalog-read";
import {
  TopicConcurrencyError,
  TopicConflictError,
  TopicValidationError,
} from "./topic-errors";
import {
  createTopic,
  publishTopic,
  reorderTopics,
  saveTopicDraft,
  unpublishTopic,
} from "./topic-operations";
import { getAdminTopicEditor, listAdminTopics } from "./topic-admin-read";
import { recoveredEditorMetadata } from "@/features/admin/admin-topic-editor-state";
import { catalogFixtureSchema } from "../topic-validation-schema";
import { getDatabase } from "@/lib/db/database";
import {
  closePostgresForIntegrationTests,
  preparePostgresForIntegrationTests,
  resetProductTables,
} from "@/lib/db/postgres-test-database";
import { topic, topicRevision, topicRevisionTranslation } from "@/lib/db/schema";

const PROJECT_ONE = "660e8400-e29b-41d4-a716-446655440001";
const PROJECT_TWO = "660e8400-e29b-41d4-a716-446655440002";

const validReadProject: ApeProjectLookup = async (projectId) => ({
  status: "ok",
  project: {
    id: projectId,
    name: "Test project",
    description: null,
    isActive: true,
    deletedAt: null,
  },
});

function english(title: string) {
  return {
    title,
    landingDescription: `${title} landing`,
    workspaceSubtitle: `${title} workspace`,
    aboutDescription: `${title} about`,
    sourceDescription: `${title} sources`,
    artworkAlt: `${title} artwork`,
    composerPlaceholder: `Ask about ${title}…`,
    starterQuestions: [`What is ${title}?`],
  };
}

describe.sequential("topic catalog persistence", () => {
  beforeAll(async () => {
    await preparePostgresForIntegrationTests();
  });

  beforeEach(async () => {
    await resetProductTables();
  });

  afterAll(async () => {
    await closePostgresForIntegrationTests();
  });

  it("migrates, seeds, and does not overwrite edited records on a second seed", async () => {
    const fixture = {
      version: 1 as const,
      topics: catalogSeedFixtureV1.topics.map((item, index) => ({
        ...item,
        apeProjectId: `660e8400-e29b-41d4-a716-44665544000${index + 1}`,
      })),
    };

    const first = await seedCatalog({ fixture, readProject: validReadProject });
    expect(first.created).toHaveLength(4);
    expect(first.published).toHaveLength(4);

    const incomeTax = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_income_tax"))
      .limit(1);
    await saveTopicDraft({
      topicId: "topic_income_tax",
      expectedVersion: incomeTax[0]!.version,
      translations: {
        en: {
          ...english("Income Tax"),
          title: "Edited Income Tax",
          landingDescription: "Edited landing",
          workspaceSubtitle: "Edited workspace",
          aboutDescription: "Edited about",
          sourceDescription: "Edited sources",
          artworkAlt: "Edited alt",
          composerPlaceholder: "Edited ask…",
          starterQuestions: ["Edited question?"],
        },
      },
    });

    const second = await seedCatalog({ fixture, readProject: validReadProject });
    expect(second.created).toEqual([]);
    expect(second.skipped).toContain("topic_income_tax");

    const published = await loadPublishedTopicBySlugFromDatabase("income-tax", "en");
    expect(published?.title).toBe("Income Tax");

    const afterSkip = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_income_tax"))
      .limit(1);
    const draftTranslations = await getDatabase()
      .select({ title: topicRevisionTranslation.title })
      .from(topicRevisionTranslation)
      .where(eq(topicRevisionTranslation.revisionId, afterSkip[0]!.draftRevisionId!));

    expect(draftTranslations.map((row) => row.title)).toContain("Edited Income Tax");
  });

  it("imports a fifth topic from JSON and publishes it without a source rebuild", async () => {
    const fixture = catalogFixtureSchema.parse(
      JSON.parse(
        readFileSync(
          resolve(
            process.cwd(),
            "src/features/topics/server/fixtures/laws-and-regulations.v1.json",
          ),
          "utf8",
        ),
      ),
    );

    const report = await importCatalogTopics(
      fixture.topics.map((item) => ({ ...item, apeProjectId: PROJECT_TWO })),
      {
        overwrite: false,
        publish: true,
        readProject: validReadProject,
      },
    );

    expect(report.created).toEqual(["topic_laws_and_regulations"]);
    expect(report.published).toEqual(["topic_laws_and_regulations"]);

    const topics = await loadPublishedTopicsFromDatabase("en");
    expect(topics.map((item) => item.slug)).toEqual(["laws-and-regulations"]);

    const bangla = await loadPublishedTopicBySlugFromDatabase(
      "laws-and-regulations",
      "bn",
    );
    expect(bangla?.title).toBe("আইন ও বিধি");
    expect(bangla?.starterQuestions[0]).toBe("What is a statutory instrument?");
    expect(bangla?.preview?.question).toBe("What is a statutory instrument?");
  });

  it("keeps drafts private until publish, then unpublish and reorder atomically", async () => {
    await createTopic({
      id: "topic_alpha",
      slug: "alpha",
      themeKey: "tax",
      apeProjectId: PROJECT_ONE,
      translations: { en: english("Alpha") },
    });
    await createTopic({
      id: "topic_beta",
      slug: "beta",
      themeKey: "history",
      apeProjectId: PROJECT_TWO,
      translations: { en: english("Beta") },
    });

    expect(await loadPublishedTopicsFromDatabase("en")).toEqual([]);
    expect(await loadPublishedTopicBySlugFromDatabase("alpha", "en")).toBeUndefined();

    await publishTopic({
      topicId: "topic_alpha",
      expectedVersion: 1,
      readProject: validReadProject,
    });
    await publishTopic({
      topicId: "topic_beta",
      expectedVersion: 1,
      readProject: validReadProject,
    });

    const published = await loadPublishedTopicsFromDatabase("en");
    expect(published.map((item) => item.slug)).toEqual(["alpha", "beta"]);

    const alpha = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_alpha"))
      .limit(1);
    await unpublishTopic({
      topicId: "topic_alpha",
      expectedVersion: alpha[0]!.version,
    });
    expect(await loadPublishedTopicBySlugFromDatabase("alpha", "en")).toBeUndefined();

    const rows = await getDatabase().select().from(topic);
    const versions = Object.fromEntries(rows.map((row) => [row.id, row.version]));
    await reorderTopics({
      orderedIds: ["topic_beta", "topic_alpha"],
      expectedVersions: versions,
    });

    const ordered = await getDatabase()
      .select({ id: topic.id, sortOrder: topic.sortOrder })
      .from(topic);
    const byId = Object.fromEntries(ordered.map((row) => [row.id, row.sortOrder]));
    expect(byId.topic_beta).toBe(1);
    expect(byId.topic_alpha).toBe(2);
  });

  it("enforces slug uniqueness and rejects a live revision from another topic", async () => {
    await createTopic({
      id: "topic_one",
      slug: "shared-slug",
      themeKey: "tax",
      translations: { en: english("One") },
    });

    await expect(
      createTopic({
        id: "topic_two",
        slug: "shared-slug",
        themeKey: "history",
        translations: { en: english("Two") },
      }),
    ).rejects.toBeInstanceOf(TopicConflictError);

    await createTopic({
      id: "topic_two",
      slug: "other-slug",
      themeKey: "history",
      translations: { en: english("Two") },
    });

    const otherRevision = await getDatabase()
      .select({ id: topicRevision.id })
      .from(topicRevision)
      .where(eq(topicRevision.topicId, "topic_two"))
      .limit(1);

    await expect(
      getDatabase().execute(
        sql`UPDATE topic SET live_revision_id = ${otherRevision[0]!.id} WHERE id = ${"topic_one"}`,
      ),
    ).rejects.toMatchObject({ cause: { code: "23503" } });
  });

  it("rejects concurrent draft saves against the same version", async () => {
    await createTopic({
      id: "topic_race",
      slug: "race",
      themeKey: "tax",
      translations: { en: english("Race") },
    });

    const first = saveTopicDraft({
      topicId: "topic_race",
      expectedVersion: 1,
      translations: { en: english("First") },
    });
    const second = saveTopicDraft({
      topicId: "topic_race",
      expectedVersion: 1,
      translations: { en: english("Second") },
    });

    const results = await Promise.allSettled([first, second]);
    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.status === "rejected" && rejected[0].reason).toBeInstanceOf(
      TopicConcurrencyError,
    );
  });

  it("rejects publish when the APE project is inactive", async () => {
    await createTopic({
      id: "topic_inactive",
      slug: "inactive",
      themeKey: "tax",
      apeProjectId: PROJECT_ONE,
      translations: { en: english("Inactive") },
    });

    await expect(
      publishTopic({
        topicId: "topic_inactive",
        expectedVersion: 1,
        readProject: async () => ({
          status: "ok",
          project: {
            id: PROJECT_ONE,
            name: "Inactive",
            description: null,
            isActive: false,
            deletedAt: null,
          },
        }),
      }),
    ).rejects.toBeInstanceOf(TopicValidationError);

    expect(await loadPublishedTopicBySlugFromDatabase("inactive", "en")).toBeUndefined();
  });

  it("does not publish an existing unpublished topic during seed", async () => {
    const fixture = {
      version: 1 as const,
      topics: catalogSeedFixtureV1.topics.slice(0, 1).map((item) => ({
        ...item,
        apeProjectId: PROJECT_ONE,
      })),
    };

    const first = await seedCatalog({ fixture, readProject: validReadProject });
    expect(first.published).toContain("topic_income_tax");

    const current = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_income_tax"))
      .limit(1);
    await unpublishTopic({
      topicId: "topic_income_tax",
      expectedVersion: current[0]!.version,
    });

    const second = await seedCatalog({ fixture, readProject: validReadProject });
    expect(second.skipped).toContain("topic_income_tax");
    expect(second.published).not.toContain("topic_income_tax");
    expect(second.drafts).toContain("topic_income_tax");
    expect(await loadPublishedTopicBySlugFromDatabase("income-tax", "en")).toBeUndefined();
  });

  it("loads retained revision content after unpublish when no draft exists", async () => {
    await createTopic({
      id: "topic_alpha",
      slug: "alpha",
      themeKey: "tax",
      apeProjectId: PROJECT_ONE,
      translations: { en: english("Alpha") },
    });
    await publishTopic({
      topicId: "topic_alpha",
      expectedVersion: 1,
      readProject: validReadProject,
    });
    const current = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_alpha"))
      .limit(1);
    await unpublishTopic({
      topicId: "topic_alpha",
      expectedVersion: current[0]!.version,
    });

    const editor = await getAdminTopicEditor("topic_alpha");
    expect(editor.draft).toBeNull();
    expect(editor.live).toBeNull();
    expect(editor.retained?.translations.en.title).toBe("Alpha");

    const listed = await listAdminTopics();
    expect(listed.find((item) => item.id === "topic_alpha")?.title).toBe("Alpha");
  });

  it("recovers a draft save after another operator publishes", async () => {
    await createTopic({
      id: "topic_alpha",
      slug: "alpha",
      themeKey: "tax",
      apeProjectId: PROJECT_ONE,
      translations: { en: english("Alpha") },
    });

    await publishTopic({
      topicId: "topic_alpha",
      expectedVersion: 1,
      readProject: validReadProject,
    });

    await expect(
      saveTopicDraft({
        topicId: "topic_alpha",
        expectedVersion: 1,
        slug: "alpha-edited",
        translations: { en: english("Kept title") },
      }),
    ).rejects.toBeInstanceOf(TopicConcurrencyError);

    const editor = await getAdminTopicEditor("topic_alpha");
    expect(editor.slugLocked).toBe(true);
    expect(editor.slug).toBe("alpha");

    const recovered = recoveredEditorMetadata("alpha-edited", editor);
    expect(recovered.slug).toBe("alpha");
    expect(recovered.slugLocked).toBe(true);

    const saved = await saveTopicDraft({
      topicId: "topic_alpha",
      expectedVersion: editor.version,
      slug: recovered.slugLocked ? undefined : recovered.slug,
      translations: { en: english("Kept title") },
    });
    expect(saved.version).toBeGreaterThan(editor.version);

    const after = await getAdminTopicEditor("topic_alpha");
    expect(after.slug).toBe("alpha");
    expect(after.draft?.translations.en.title).toBe("Kept title");
  });

  it("seeds v1 topics as drafts without APE mapping even when env project ids are set", async () => {
    const previous = process.env.APE_PROJECT_INCOME_TAX;
    process.env.APE_PROJECT_INCOME_TAX = PROJECT_ONE;

    try {
      const report = await seedCatalog({
        fixture: {
          version: 1,
          topics: catalogSeedFixtureV1.topics.slice(0, 1),
        },
        readProject: validReadProject,
      });

      expect(report.created).toEqual(["topic_income_tax"]);
      expect(report.published).toEqual([]);
      expect(report.drafts).toContain("topic_income_tax");

      const editor = await getAdminTopicEditor("topic_income_tax");
      expect(editor.draft?.apeProjectId).toBeNull();
      expect(editor.isLive).toBe(false);
    } finally {
      if (previous === undefined) {
        delete process.env.APE_PROJECT_INCOME_TAX;
      } else {
        process.env.APE_PROJECT_INCOME_TAX = previous;
      }
    }
  });

  it("saves, updates, and clears the APE project mapping on the draft revision", async () => {
    await createTopic({
      id: "topic_alpha",
      slug: "alpha",
      themeKey: "tax",
      translations: { en: english("Alpha") },
    });

    const created = await getAdminTopicEditor("topic_alpha");
    expect(created.draft?.apeProjectId).toBeNull();

    await saveTopicDraft({
      topicId: "topic_alpha",
      expectedVersion: created.version,
      apeProjectId: PROJECT_ONE,
    });
    expect((await getAdminTopicEditor("topic_alpha")).draft?.apeProjectId).toBe(PROJECT_ONE);

    const afterSet = await getAdminTopicEditor("topic_alpha");
    await saveTopicDraft({
      topicId: "topic_alpha",
      expectedVersion: afterSet.version,
      apeProjectId: PROJECT_TWO,
    });
    expect((await getAdminTopicEditor("topic_alpha")).draft?.apeProjectId).toBe(PROJECT_TWO);

    const afterUpdate = await getAdminTopicEditor("topic_alpha");
    await saveTopicDraft({
      topicId: "topic_alpha",
      expectedVersion: afterUpdate.version,
      apeProjectId: null,
    });
    expect((await getAdminTopicEditor("topic_alpha")).draft?.apeProjectId).toBeNull();
  });

  it("rejects an invalid APE project UUID on draft save", async () => {
    await createTopic({
      id: "topic_alpha",
      slug: "alpha",
      themeKey: "tax",
      translations: { en: english("Alpha") },
    });

    await expect(
      saveTopicDraft({
        topicId: "topic_alpha",
        expectedVersion: 1,
        apeProjectId: "not-a-project-id",
      }),
    ).rejects.toBeInstanceOf(TopicValidationError);
  });
});
