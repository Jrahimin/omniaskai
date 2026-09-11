import { asc, desc, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db/database";
import {
  mediaAsset,
  topic,
  topicKnowledgeMapping,
  topicRevision,
  topicRevisionTranslation,
} from "@/lib/db/schema";
import { asStoredTranslation } from "../topic-locale-fallback";
import { resolveArtworkSrc } from "../topic-presentation";
import { isTopicThemeKey } from "../topic-theme";
import { TopicCatalogUnavailableError, TopicNotFoundError } from "./topic-errors";
import type {
  AdminArtworkOption,
  AdminTopicEditor,
  AdminTopicRevision,
  AdminTopicSummary,
  AdminTopicTranslation,
} from "../admin-topic-types";

export type {
  AdminArtworkOption,
  AdminTopicEditor,
  AdminTopicRevision,
  AdminTopicSummary,
  AdminTopicTranslation,
};

export async function listAdminTopics(): Promise<AdminTopicSummary[]> {
  try {
    const db = getDatabase();
    const rows = await db
      .select({
        id: topic.id,
        slug: topic.slug,
        sortOrder: topic.sortOrder,
        version: topic.version,
        draftRevisionId: topic.draftRevisionId,
        liveRevisionId: topic.liveRevisionId,
        title: topicRevisionTranslation.title,
        translationLocale: topicRevisionTranslation.locale,
        translationRevisionId: topicRevisionTranslation.revisionId,
      })
      .from(topic)
      .leftJoin(
        topicRevisionTranslation,
        sql`${topicRevisionTranslation.revisionId} = coalesce(
          ${topic.draftRevisionId},
          ${topic.liveRevisionId},
          (
            SELECT ${topicRevision.id}
            FROM ${topicRevision}
            WHERE ${topicRevision.topicId} = ${topic.id}
            ORDER BY ${topicRevision.revisionNumber} DESC
            LIMIT 1
          )
        )`,
      )
      .orderBy(asc(topic.sortOrder), asc(topic.id));

    const grouped = new Map<string, AdminTopicSummary>();

    for (const row of rows) {
      const current = grouped.get(row.id) ?? {
        id: row.id,
        slug: row.slug,
        sortOrder: row.sortOrder,
        version: row.version,
        title: row.slug,
        hasDraft: Boolean(row.draftRevisionId),
        isLive: Boolean(row.liveRevisionId),
      };

      if (row.translationLocale === "en" && row.title) {
        current.title = row.title;
      }

      grouped.set(row.id, current);
    }

    return [...grouped.values()];
  } catch (error) {
    if (error instanceof TopicCatalogUnavailableError) {
      throw error;
    }

    throw new TopicCatalogUnavailableError();
  }
}

export async function getAdminTopicEditor(
  topicId: string,
): Promise<AdminTopicEditor> {
  try {
    const db = getDatabase();
    const rows = await db.select().from(topic).where(eq(topic.id, topicId)).limit(1);
    const current = rows[0];

    if (!current) {
      throw new TopicNotFoundError();
    }

    return {
      id: current.id,
      slug: current.slug,
      slugLocked: Boolean(current.firstPublishedAt),
      version: current.version,
      conversationEpoch: current.conversationEpoch,
      isLive: Boolean(current.liveRevisionId),
      draft: current.draftRevisionId
        ? await loadAdminRevision(current.draftRevisionId)
        : null,
      live: current.liveRevisionId
        ? await loadAdminRevision(current.liveRevisionId)
        : null,
      retained:
        !current.draftRevisionId && !current.liveRevisionId
          ? await loadLatestRevision(current.id)
          : null,
    };
  } catch (error) {
    if (error instanceof TopicNotFoundError) {
      throw error;
    }

    throw new TopicCatalogUnavailableError();
  }
}

export async function listAdminArtworkAssets(): Promise<AdminArtworkOption[]> {
  const db = getDatabase();
  const rows = await db
    .select({
      id: mediaAsset.id,
      storageKind: mediaAsset.storageKind,
      storageKey: mediaAsset.storageKey,
    })
    .from(mediaAsset)
    .orderBy(desc(mediaAsset.createdAt), asc(mediaAsset.id));

  return rows.map((row) => ({
    id: row.id,
    storageKind: row.storageKind,
    storageKey: row.storageKey,
    artworkSrc: resolveArtworkSrc({
      assetId: row.id,
      storageKind: row.storageKind,
      storageKey: row.storageKey,
    }),
  }));
}

async function loadLatestRevision(topicId: string): Promise<AdminTopicRevision | null> {
  const db = getDatabase();
  const rows = await db
    .select({ id: topicRevision.id })
    .from(topicRevision)
    .where(eq(topicRevision.topicId, topicId))
    .orderBy(desc(topicRevision.revisionNumber))
    .limit(1);

  if (!rows[0]) {
    return null;
  }

  return loadAdminRevision(rows[0].id);
}

async function loadAdminRevision(revisionId: string): Promise<AdminTopicRevision> {
  const db = getDatabase();
  const revisionRows = await db
    .select({
      id: topicRevision.id,
      revisionNumber: topicRevision.revisionNumber,
      themeKey: topicRevision.themeKey,
      artworkAssetId: topicRevision.artworkAssetId,
      focalPosition: topicRevision.focalPosition,
      knowledgeReviewDate: topicRevision.knowledgeReviewDate,
      storageKind: mediaAsset.storageKind,
      storageKey: mediaAsset.storageKey,
      apeProjectId: topicKnowledgeMapping.apeProjectId,
      lastValidationResult: topicKnowledgeMapping.lastValidationResult,
    })
    .from(topicRevision)
    .leftJoin(mediaAsset, eq(topicRevision.artworkAssetId, mediaAsset.id))
    .leftJoin(
      topicKnowledgeMapping,
      eq(topicKnowledgeMapping.revisionId, topicRevision.id),
    )
    .where(eq(topicRevision.id, revisionId))
    .limit(1);

  const revision = revisionRows[0];

  if (!revision || !isTopicThemeKey(revision.themeKey)) {
    throw new TopicCatalogUnavailableError();
  }

  const translations = await db
    .select()
    .from(topicRevisionTranslation)
    .where(eq(topicRevisionTranslation.revisionId, revisionId));

  const english = translations.find((row) => row.locale === "en");
  const bangla = translations.find((row) => row.locale === "bn");

  if (!english) {
    throw new TopicCatalogUnavailableError();
  }

  return {
    revisionId: revision.id,
    revisionNumber: revision.revisionNumber,
    themeKey: revision.themeKey,
    artworkAssetId: revision.artworkAssetId,
    artworkSrc: resolveArtworkSrc({
      assetId: revision.artworkAssetId,
      storageKind: revision.storageKind,
      storageKey: revision.storageKey,
    }),
    focalPosition: revision.focalPosition,
    knowledgeReviewDate: revision.knowledgeReviewDate,
    apeProjectId: revision.apeProjectId,
    lastValidationResult: revision.lastValidationResult ?? null,
    translations: {
      en: toDraftTranslation(english),
      bn: bangla ? toDraftTranslation(bangla) : undefined,
    },
  };
}

function toDraftTranslation(
  row: typeof topicRevisionTranslation.$inferSelect,
): AdminTopicTranslation {
  const stored = asStoredTranslation(row);

  return {
    title: stored.title,
    landingDescription: stored.landingDescription,
    workspaceSubtitle: stored.workspaceSubtitle,
    aboutDescription: stored.aboutDescription,
    sourceDescription: stored.sourceDescription,
    badge: stored.badge ?? undefined,
    artworkAlt: stored.artworkAlt,
    composerPlaceholder: stored.composerPlaceholder,
    exploreLabel: stored.exploreLabel ?? undefined,
    preview: stored.preview ?? undefined,
    starterQuestions: stored.starterQuestions,
  };
}
