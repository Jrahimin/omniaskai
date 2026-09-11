import { and, desc, eq } from "drizzle-orm";

import {
  classifyApeProjectForPublish,
  getApeProject,
  type ApeProjectReadResult,
} from "@/features/conversations/server/ape-api-client.server";
import { getApeRuntimeConfig } from "@/features/conversations/server/ape-config.server";
import { getDatabase } from "@/lib/db/database";
import {
  topic,
  topicKnowledgeMapping,
  topicRevision,
  topicRevisionTranslation,
} from "@/lib/db/schema";
import type { TopicThemeKey } from "../topic-theme";
import {
  publishEnglishTranslationSchema,
  toPublishEnglishInput,
  topicSlugSchema,
  topicTranslationDraftSchema,
  type TopicTranslationDraft,
} from "../topic-validation-schema";
import { nextTopicSortOrder, newId } from "./topic-catalog-read";
import {
  TopicConcurrencyError,
  TopicConflictError,
  TopicNotFoundError,
  TopicValidationError,
} from "./topic-errors";

type Database = ReturnType<typeof getDatabase>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type TopicTranslationInput = TopicTranslationDraft;

export type CreateTopicInput = {
  id: string;
  slug: string;
  sortOrder?: number;
  themeKey: TopicThemeKey;
  focalPosition?: string;
  knowledgeReviewDate?: string;
  artworkAssetId?: string;
  apeProjectId?: string;
  translations: {
    en: TopicTranslationInput;
    bn?: TopicTranslationInput;
  };
};

export type SaveTopicDraftInput = {
  topicId: string;
  expectedVersion: number;
  slug?: string;
  themeKey?: TopicThemeKey;
  focalPosition?: string;
  knowledgeReviewDate?: string | null;
  artworkAssetId?: string | null;
  apeProjectId?: string | null;
  translations?: {
    en?: TopicTranslationInput;
    bn?: TopicTranslationInput | null;
  };
};

export type ApeProjectLookup = (
  projectId: string,
) => Promise<ApeProjectReadResult>;

export async function createTopic(input: CreateTopicInput): Promise<{
  topicId: string;
  revisionId: string;
  version: number;
}> {
  const slug = topicSlugSchema.parse(input.slug);
  const english = topicTranslationDraftSchema.parse(input.translations.en);
  const bangla = input.translations.bn
    ? topicTranslationDraftSchema.parse(input.translations.bn)
    : undefined;
  const db = getDatabase();
  const now = new Date();
  const revisionId = newId();
  const sortOrder = input.sortOrder ?? (await nextTopicSortOrder());

  try {
    return await db.transaction(async (tx) => {
      await tx.insert(topic).values({
        id: input.id,
        slug,
        sortOrder,
        draftRevisionId: null,
        liveRevisionId: null,
        firstPublishedAt: null,
        conversationEpoch: 0,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });

      await tx.insert(topicRevision).values({
        id: revisionId,
        topicId: input.id,
        revisionNumber: 1,
        themeKey: input.themeKey,
        artworkAssetId: input.artworkAssetId ?? null,
        focalPosition: input.focalPosition?.trim() || "center",
        knowledgeReviewDate: input.knowledgeReviewDate ?? null,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await insertTranslation(tx, revisionId, "en", english);

      if (bangla) {
        await insertTranslation(tx, revisionId, "bn", bangla);
      }

      if (input.apeProjectId) {
        await tx.insert(topicKnowledgeMapping).values({
          revisionId,
          apeProjectId: input.apeProjectId,
          lastValidationResult: null,
          lastValidatedAt: null,
        });
      }

      await tx
        .update(topic)
        .set({ draftRevisionId: revisionId, updatedAt: now })
        .where(eq(topic.id, input.id));

      return { topicId: input.id, revisionId, version: 1 };
    });
  } catch (error) {
    throw mapWriteError(error, "A topic with that id or slug already exists.");
  }
}

export async function saveTopicDraft(input: SaveTopicDraftInput): Promise<{
  revisionId: string;
  version: number;
}> {
  const db = getDatabase();
  const now = new Date();

  try {
    return await db.transaction(async (tx) => {
      const current = await lockTopic(tx, input.topicId);

      if (current.version !== input.expectedVersion) {
        throw new TopicConcurrencyError();
      }

      if (input.slug) {
        const nextSlug = topicSlugSchema.parse(input.slug);

        if (current.firstPublishedAt && nextSlug !== current.slug) {
          throw new TopicValidationError("Slug cannot change after first publication.");
        }

        if (nextSlug !== current.slug) {
          await tx
            .update(topic)
            .set({ slug: nextSlug })
            .where(eq(topic.id, current.id));
        }
      }

      let draftId = current.draftRevisionId;

      if (!draftId) {
        const sourceRevisionId =
          current.liveRevisionId ?? (await latestRevisionId(tx, current.id));

        if (sourceRevisionId) {
          draftId = await cloneRevisionAsDraft(tx, current.id, sourceRevisionId, now);
        }
      }

      if (!draftId) {
        throw new TopicValidationError("Topic has no draft revision to save.");
      }

      const draft = await loadRevision(tx, draftId);

      if (draft.publishedAt) {
        throw new TopicValidationError("Published revisions are immutable.");
      }

      await tx
        .update(topicRevision)
        .set({
          themeKey: input.themeKey ?? draft.themeKey,
          focalPosition: input.focalPosition?.trim() || draft.focalPosition,
          knowledgeReviewDate:
            input.knowledgeReviewDate === undefined
              ? draft.knowledgeReviewDate
              : input.knowledgeReviewDate,
          artworkAssetId:
            input.artworkAssetId === undefined
              ? draft.artworkAssetId
              : input.artworkAssetId,
          updatedAt: now,
        })
        .where(eq(topicRevision.id, draftId));

      if (input.translations?.en) {
        await upsertTranslation(
          tx,
          draftId,
          "en",
          topicTranslationDraftSchema.parse(input.translations.en),
        );
      }

      if (input.translations && Object.prototype.hasOwnProperty.call(input.translations, "bn")) {
        if (input.translations.bn === null) {
          await tx
            .delete(topicRevisionTranslation)
            .where(
              and(
                eq(topicRevisionTranslation.revisionId, draftId),
                eq(topicRevisionTranslation.locale, "bn"),
              ),
            );
        } else if (input.translations.bn) {
          await upsertTranslation(
            tx,
            draftId,
            "bn",
            topicTranslationDraftSchema.parse(input.translations.bn),
          );
        }
      }

      if (input.apeProjectId === null) {
        await tx
          .delete(topicKnowledgeMapping)
          .where(eq(topicKnowledgeMapping.revisionId, draftId));
      } else if (input.apeProjectId) {
        await tx
          .insert(topicKnowledgeMapping)
          .values({
            revisionId: draftId,
            apeProjectId: input.apeProjectId,
            lastValidationResult: null,
            lastValidatedAt: null,
          })
          .onConflictDoUpdate({
            target: topicKnowledgeMapping.revisionId,
            set: {
              apeProjectId: input.apeProjectId,
              lastValidationResult: null,
              lastValidatedAt: null,
            },
          });
      }

      const nextVersion = current.version + 1;
      const updated = await tx
        .update(topic)
        .set({
          draftRevisionId: draftId,
          version: nextVersion,
          updatedAt: now,
        })
        .where(and(eq(topic.id, current.id), eq(topic.version, current.version)))
        .returning({ id: topic.id });

      if (updated.length === 0) {
        throw new TopicConcurrencyError();
      }

      return { revisionId: draftId, version: nextVersion };
    });
  } catch (error) {
    if (
      error instanceof TopicConcurrencyError ||
      error instanceof TopicValidationError ||
      error instanceof TopicNotFoundError
    ) {
      throw error;
    }

    throw mapWriteError(error, "Could not save the topic draft.");
  }
}

export async function publishTopic(input: {
  topicId: string;
  expectedVersion: number;
  readProject?: ApeProjectLookup;
}): Promise<{ liveRevisionId: string; conversationEpoch: number; version: number }> {
  const db = getDatabase();
  const prepared = await db.transaction(async (tx) => {
    const current = await lockTopic(tx, input.topicId);

    if (current.version !== input.expectedVersion) {
      throw new TopicConcurrencyError();
    }

    if (!current.draftRevisionId) {
      throw new TopicValidationError("Publish requires a draft revision.");
    }

    const draft = await loadRevision(tx, current.draftRevisionId);
    const english = await loadTranslation(tx, draft.id, "en");
    const mapping = await loadMapping(tx, draft.id);

    if (!english) {
      throw new TopicValidationError("Publish requires an English translation.");
    }

    const parsedEnglish = publishEnglishTranslationSchema.safeParse(
      toPublishEnglishInput(english),
    );

    if (!parsedEnglish.success) {
      throw new TopicValidationError(
        "Publish requires English title, descriptions, and 1–10 starter questions.",
      );
    }

    if (!mapping) {
      throw new TopicValidationError("Publish requires an APE project mapping.");
    }

    return {
      current,
      draft,
      mapping,
    };
  });

  const readProject = input.readProject ?? defaultReadProject;
  const projectResult = await readProject(prepared.mapping.apeProjectId);
  const validation = classifyApeProjectForPublish(projectResult);
  const validatedAt = new Date();

  if (validation !== "valid") {
    await getDatabase()
      .update(topicKnowledgeMapping)
      .set({
        lastValidationResult: validation,
        lastValidatedAt: validatedAt,
      })
      .where(eq(topicKnowledgeMapping.revisionId, prepared.draft.id));
    throw new TopicValidationError(
      `APE project is ${validation} and cannot be published.`,
    );
  }

  const now = new Date();

  try {
    return await db.transaction(async (tx) => {
      const current = await lockTopic(tx, input.topicId);

      if (current.version !== input.expectedVersion || current.version !== prepared.current.version) {
        throw new TopicConcurrencyError();
      }

      if (current.draftRevisionId !== prepared.draft.id) {
        throw new TopicConcurrencyError();
      }

      const mapping = await loadMapping(tx, prepared.draft.id);

      if (!mapping || mapping.apeProjectId !== prepared.mapping.apeProjectId) {
        throw new TopicConcurrencyError();
      }

      let previousProjectId: string | undefined;

      if (current.liveRevisionId) {
        const previousMapping = await loadMapping(tx, current.liveRevisionId);
        previousProjectId = previousMapping?.apeProjectId;
      }

      const projectChanged =
        Boolean(current.liveRevisionId) && previousProjectId !== mapping.apeProjectId;
      const conversationEpoch = current.liveRevisionId
        ? projectChanged
          ? current.conversationEpoch + 1
          : current.conversationEpoch
        : current.conversationEpoch;

      await tx
        .update(topicKnowledgeMapping)
        .set({
          lastValidationResult: "valid",
          lastValidatedAt: validatedAt,
        })
        .where(eq(topicKnowledgeMapping.revisionId, prepared.draft.id));

      await tx
        .update(topicRevision)
        .set({ publishedAt: prepared.draft.publishedAt ?? now, updatedAt: now })
        .where(eq(topicRevision.id, prepared.draft.id));

      const nextVersion = current.version + 1;
      const updated = await tx
        .update(topic)
        .set({
          liveRevisionId: prepared.draft.id,
          draftRevisionId: null,
          firstPublishedAt: current.firstPublishedAt ?? now,
          conversationEpoch,
          version: nextVersion,
          updatedAt: now,
        })
        .where(and(eq(topic.id, current.id), eq(topic.version, current.version)))
        .returning({ id: topic.id });

      if (updated.length === 0) {
        throw new TopicConcurrencyError();
      }

      return {
        liveRevisionId: prepared.draft.id,
        conversationEpoch,
        version: nextVersion,
      };
    });
  } catch (error) {
    if (
      error instanceof TopicConcurrencyError ||
      error instanceof TopicValidationError ||
      error instanceof TopicNotFoundError
    ) {
      throw error;
    }

    throw mapWriteError(error, "Could not publish the topic.");
  }
}

export async function unpublishTopic(input: {
  topicId: string;
  expectedVersion: number;
}): Promise<{ version: number; conversationEpoch: number }> {
  const db = getDatabase();
  const now = new Date();

  return db.transaction(async (tx) => {
    const current = await lockTopic(tx, input.topicId);

    if (current.version !== input.expectedVersion) {
      throw new TopicConcurrencyError();
    }

    if (!current.liveRevisionId) {
      throw new TopicValidationError("Topic is not published.");
    }

    const nextVersion = current.version + 1;
    const conversationEpoch = current.conversationEpoch + 1;
    const updated = await tx
      .update(topic)
      .set({
        liveRevisionId: null,
        conversationEpoch,
        version: nextVersion,
        updatedAt: now,
      })
      .where(and(eq(topic.id, current.id), eq(topic.version, current.version)))
      .returning({ id: topic.id });

    if (updated.length === 0) {
      throw new TopicConcurrencyError();
    }

    return { version: nextVersion, conversationEpoch };
  });
}

export async function reorderTopics(input: {
  orderedIds: string[];
  expectedVersions: Record<string, number>;
}): Promise<{ versions: Record<string, number> }> {
  const uniqueIds = [...new Set(input.orderedIds)];

  if (uniqueIds.length !== input.orderedIds.length) {
    throw new TopicValidationError("Topic order cannot contain duplicates.");
  }

  const db = getDatabase();
  const now = new Date();
  const lockedIds = [...uniqueIds].sort();

  return db.transaction(async (tx) => {
    const locked = [];

    for (const id of lockedIds) {
      locked.push(await lockTopic(tx, id));
    }

    const byId = new Map(locked.map((row) => [row.id, row]));

    if (byId.size !== uniqueIds.length) {
      throw new TopicNotFoundError();
    }

    for (const id of uniqueIds) {
      const row = byId.get(id);

      if (!row || row.version !== input.expectedVersions[id]) {
        throw new TopicConcurrencyError();
      }
    }

    const versions: Record<string, number> = {};

    for (const [index, id] of input.orderedIds.entries()) {
      const current = byId.get(id);

      if (!current) {
        throw new TopicNotFoundError();
      }

      const nextVersion = current.version + 1;
      const updated = await tx
        .update(topic)
        .set({
          sortOrder: index + 1,
          version: nextVersion,
          updatedAt: now,
        })
        .where(and(eq(topic.id, id), eq(topic.version, current.version)))
        .returning({ id: topic.id });

      if (updated.length === 0) {
        throw new TopicConcurrencyError();
      }

      versions[id] = nextVersion;
    }

    return { versions };
  });
}

async function defaultReadProject(projectId: string): Promise<ApeProjectReadResult> {
  const config = getApeRuntimeConfig();

  if (!config) {
    return { status: "unreachable" };
  }

  return getApeProject(config, projectId);
}

async function lockTopic(tx: Transaction, topicId: string) {
  const rows = await tx
    .select()
    .from(topic)
    .where(eq(topic.id, topicId))
    .for("update");
  const row = rows[0];

  if (!row) {
    throw new TopicNotFoundError();
  }

  return row;
}

async function loadRevision(tx: Transaction, revisionId: string) {
  const rows = await tx
    .select()
    .from(topicRevision)
    .where(eq(topicRevision.id, revisionId))
    .limit(1);
  const row = rows[0];

  if (!row) {
    throw new TopicValidationError("Revision was not found.");
  }

  return row;
}

async function loadTranslation(
  tx: Transaction,
  revisionId: string,
  locale: "en" | "bn",
) {
  const rows = await tx
    .select()
    .from(topicRevisionTranslation)
    .where(
      and(
        eq(topicRevisionTranslation.revisionId, revisionId),
        eq(topicRevisionTranslation.locale, locale),
      ),
    )
    .limit(1);

  return rows[0];
}

async function loadMapping(tx: Transaction, revisionId: string) {
  const rows = await tx
    .select()
    .from(topicKnowledgeMapping)
    .where(eq(topicKnowledgeMapping.revisionId, revisionId))
    .limit(1);

  return rows[0];
}

async function latestRevisionId(
  tx: Transaction,
  topicId: string,
): Promise<string | undefined> {
  const rows = await tx
    .select({ id: topicRevision.id })
    .from(topicRevision)
    .where(eq(topicRevision.topicId, topicId))
    .orderBy(desc(topicRevision.revisionNumber))
    .limit(1);

  return rows[0]?.id;
}

async function cloneRevisionAsDraft(
  tx: Transaction,
  topicId: string,
  liveRevisionId: string,
  now: Date,
): Promise<string> {
  const live = await loadRevision(tx, liveRevisionId);
  const nextNumberRows = await tx
    .select({ revisionNumber: topicRevision.revisionNumber })
    .from(topicRevision)
    .where(eq(topicRevision.topicId, topicId))
    .orderBy(desc(topicRevision.revisionNumber))
    .limit(1);
  const revisionId = newId();

  await tx.insert(topicRevision).values({
    id: revisionId,
    topicId,
    revisionNumber: (nextNumberRows[0]?.revisionNumber ?? live.revisionNumber) + 1,
    themeKey: live.themeKey,
    artworkAssetId: live.artworkAssetId,
    focalPosition: live.focalPosition,
    knowledgeReviewDate: live.knowledgeReviewDate,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const translations = await tx
    .select()
    .from(topicRevisionTranslation)
    .where(eq(topicRevisionTranslation.revisionId, live.id));

  for (const translation of translations) {
    await tx.insert(topicRevisionTranslation).values({
      ...translation,
      revisionId,
    });
  }

  const mapping = await loadMapping(tx, live.id);

  if (mapping) {
    await tx.insert(topicKnowledgeMapping).values({
      revisionId,
      apeProjectId: mapping.apeProjectId,
      lastValidationResult: mapping.lastValidationResult,
      lastValidatedAt: mapping.lastValidatedAt,
    });
  }

  return revisionId;
}

async function insertTranslation(
  tx: Transaction,
  revisionId: string,
  locale: "en" | "bn",
  translation: TopicTranslationInput,
): Promise<void> {
  await tx.insert(topicRevisionTranslation).values({
    revisionId,
    locale,
    title: translation.title,
    landingDescription: translation.landingDescription,
    workspaceSubtitle: translation.workspaceSubtitle,
    aboutDescription: translation.aboutDescription,
    sourceDescription: translation.sourceDescription,
    badge: translation.badge ?? null,
    artworkAlt: translation.artworkAlt,
    composerPlaceholder: translation.composerPlaceholder,
    exploreLabel: translation.exploreLabel ?? null,
    preview: translation.preview ?? null,
    starterQuestions: translation.starterQuestions,
  });
}

async function upsertTranslation(
  tx: Transaction,
  revisionId: string,
  locale: "en" | "bn",
  translation: TopicTranslationInput,
): Promise<void> {
  await tx
    .insert(topicRevisionTranslation)
    .values({
      revisionId,
      locale,
      title: translation.title,
      landingDescription: translation.landingDescription,
      workspaceSubtitle: translation.workspaceSubtitle,
      aboutDescription: translation.aboutDescription,
      sourceDescription: translation.sourceDescription,
      badge: translation.badge ?? null,
      artworkAlt: translation.artworkAlt,
      composerPlaceholder: translation.composerPlaceholder,
      exploreLabel: translation.exploreLabel ?? null,
      preview: translation.preview ?? null,
      starterQuestions: translation.starterQuestions,
    })
    .onConflictDoUpdate({
      target: [topicRevisionTranslation.revisionId, topicRevisionTranslation.locale],
      set: {
        title: translation.title,
        landingDescription: translation.landingDescription,
        workspaceSubtitle: translation.workspaceSubtitle,
        aboutDescription: translation.aboutDescription,
        sourceDescription: translation.sourceDescription,
        badge: translation.badge ?? null,
        artworkAlt: translation.artworkAlt,
        composerPlaceholder: translation.composerPlaceholder,
        exploreLabel: translation.exploreLabel ?? null,
        preview: translation.preview ?? null,
        starterQuestions: translation.starterQuestions,
      },
    });
}

function mapWriteError(error: unknown, fallback: string): Error {
  const code = postgresErrorCode(error);

  if (code === "23505") {
    return new TopicConflictError("A topic with that id or slug already exists.");
  }

  if (code === "23503") {
    return new TopicValidationError("Revision does not belong to this topic.");
  }

  return error instanceof Error ? error : new Error(fallback);
}

function postgresErrorCode(error: unknown): string | undefined {
  let current: unknown = error;

  for (let depth = 0; current && depth < 6; depth += 1) {
    if (
      typeof current === "object" &&
      current !== null &&
      "code" in current &&
      typeof current.code === "string" &&
      /^\d{5}$/.test(current.code)
    ) {
      return current.code;
    }

    current =
      current instanceof Error
        ? current.cause
        : current && typeof current === "object" && "cause" in current
          ? current.cause
          : undefined;
  }

  return undefined;
}
