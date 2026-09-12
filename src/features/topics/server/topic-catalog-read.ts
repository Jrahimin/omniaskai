import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db/database";
import {
  mediaAsset,
  topic,
  topicKnowledgeMapping,
  topicRevision,
  topicRevisionTranslation,
} from "@/lib/db/schema";
import type { Locale } from "@/lib/locale/locale";

import type { Topic } from "../topic";
import {
  asStoredTranslation,
  projectPublishedTopic,
} from "../topic-locale-fallback";
import { resolveArtworkSrc } from "../topic-presentation";
import { isTopicThemeKey } from "../topic-theme";
import { TopicCatalogUnavailableError } from "./topic-errors";

export async function loadPublishedTopicsFromDatabase(
  locale: Locale,
): Promise<Topic[]> {
  try {
    const db = getDatabase();
    const rows = await db
      .select({
        id: topic.id,
        slug: topic.slug,
        sortOrder: topic.sortOrder,
        themeKey: topicRevision.themeKey,
        objectPosition: topicRevision.focalPosition,
        knowledgeReviewDate: topicRevision.knowledgeReviewDate,
        artworkAssetId: topicRevision.artworkAssetId,
        storageKind: mediaAsset.storageKind,
        storageKey: mediaAsset.storageKey,
        translationLocale: topicRevisionTranslation.locale,
        title: topicRevisionTranslation.title,
        landingDescription: topicRevisionTranslation.landingDescription,
        workspaceSubtitle: topicRevisionTranslation.workspaceSubtitle,
        aboutDescription: topicRevisionTranslation.aboutDescription,
        sourceDescription: topicRevisionTranslation.sourceDescription,
        badge: topicRevisionTranslation.badge,
        artworkAlt: topicRevisionTranslation.artworkAlt,
        composerPlaceholder: topicRevisionTranslation.composerPlaceholder,
        exploreLabel: topicRevisionTranslation.exploreLabel,
        preview: topicRevisionTranslation.preview,
        starterQuestions: topicRevisionTranslation.starterQuestions,
      })
      .from(topic)
      .innerJoin(topicRevision, eq(topic.liveRevisionId, topicRevision.id))
      .innerJoin(
        topicRevisionTranslation,
        eq(topicRevisionTranslation.revisionId, topicRevision.id),
      )
      .leftJoin(mediaAsset, eq(topicRevision.artworkAssetId, mediaAsset.id))
      .where(sql`${topic.liveRevisionId} IS NOT NULL`)
      .orderBy(asc(topic.sortOrder), asc(topic.id));

    return groupPublishedTopicRows(rows, locale);
  } catch (error) {
    if (error instanceof TopicCatalogUnavailableError) {
      throw error;
    }

    throw new TopicCatalogUnavailableError();
  }
}

export async function loadPublishedTopicBySlugFromDatabase(
  slug: string,
  locale: Locale,
): Promise<Topic | undefined> {
  try {
    const db = getDatabase();
    const rows = await db
      .select({
        id: topic.id,
        slug: topic.slug,
        sortOrder: topic.sortOrder,
        themeKey: topicRevision.themeKey,
        objectPosition: topicRevision.focalPosition,
        knowledgeReviewDate: topicRevision.knowledgeReviewDate,
        artworkAssetId: topicRevision.artworkAssetId,
        storageKind: mediaAsset.storageKind,
        storageKey: mediaAsset.storageKey,
        translationLocale: topicRevisionTranslation.locale,
        title: topicRevisionTranslation.title,
        landingDescription: topicRevisionTranslation.landingDescription,
        workspaceSubtitle: topicRevisionTranslation.workspaceSubtitle,
        aboutDescription: topicRevisionTranslation.aboutDescription,
        sourceDescription: topicRevisionTranslation.sourceDescription,
        badge: topicRevisionTranslation.badge,
        artworkAlt: topicRevisionTranslation.artworkAlt,
        composerPlaceholder: topicRevisionTranslation.composerPlaceholder,
        exploreLabel: topicRevisionTranslation.exploreLabel,
        preview: topicRevisionTranslation.preview,
        starterQuestions: topicRevisionTranslation.starterQuestions,
      })
      .from(topic)
      .innerJoin(topicRevision, eq(topic.liveRevisionId, topicRevision.id))
      .innerJoin(
        topicRevisionTranslation,
        eq(topicRevisionTranslation.revisionId, topicRevision.id),
      )
      .leftJoin(mediaAsset, eq(topicRevision.artworkAssetId, mediaAsset.id))
      .where(and(eq(topic.slug, slug), sql`${topic.liveRevisionId} IS NOT NULL`));

    return groupPublishedTopicRows(rows, locale)[0];
  } catch (error) {
    if (error instanceof TopicCatalogUnavailableError) {
      throw error;
    }

    throw new TopicCatalogUnavailableError();
  }
}

export type PublishedTopicExecution = {
  topicId: string;
  slug: string;
  conversationEpoch: number;
  liveRevisionId: string;
  apeProjectId: string;
};

export async function loadPublishedTopicExecution(
  slug: string,
): Promise<PublishedTopicExecution | undefined> {
  try {
    const db = getDatabase();
    const rows = await db
      .select({
        topicId: topic.id,
        slug: topic.slug,
        conversationEpoch: topic.conversationEpoch,
        liveRevisionId: topic.liveRevisionId,
        apeProjectId: topicKnowledgeMapping.apeProjectId,
      })
      .from(topic)
      .innerJoin(topicRevision, eq(topic.liveRevisionId, topicRevision.id))
      .innerJoin(
        topicKnowledgeMapping,
        eq(topicKnowledgeMapping.revisionId, topicRevision.id),
      )
      .where(and(eq(topic.slug, slug), sql`${topic.liveRevisionId} IS NOT NULL`))
      .limit(1);

    const row = rows[0];

    if (!row?.liveRevisionId) {
      return undefined;
    }

    return {
      topicId: row.topicId,
      slug: row.slug,
      conversationEpoch: row.conversationEpoch,
      liveRevisionId: row.liveRevisionId,
      apeProjectId: row.apeProjectId,
    };
  } catch (error) {
    if (error instanceof TopicCatalogUnavailableError) {
      throw error;
    }

    throw new TopicCatalogUnavailableError();
  }
}

type PublishedRow = {
  id: string;
  slug: string;
  sortOrder: number;
  themeKey: string;
  objectPosition: string;
  knowledgeReviewDate: string | null;
  artworkAssetId: string | null;
  storageKind: "bundled" | "uploaded" | null;
  storageKey: string | null;
  translationLocale: "en" | "bn";
  title: string;
  landingDescription: string;
  workspaceSubtitle: string;
  aboutDescription: string;
  sourceDescription: string;
  badge: string | null;
  artworkAlt: string;
  composerPlaceholder: string;
  exploreLabel: string | null;
  preview: unknown;
  starterQuestions: unknown;
};

function groupPublishedTopicRows(rows: PublishedRow[], locale: Locale): Topic[] {
  const grouped = new Map<string, PublishedRow[]>();

  for (const row of rows) {
    const current = grouped.get(row.id) ?? [];
    current.push(row);
    grouped.set(row.id, current);
  }

  const topics: Topic[] = [];

  for (const topicRows of grouped.values()) {
    const englishRow = topicRows.find((row) => row.translationLocale === "en");

    if (!englishRow || !isTopicThemeKey(englishRow.themeKey)) {
      continue;
    }

    const localizedRow = topicRows.find((row) => row.translationLocale === locale);
    const artworkSrc = resolveArtworkSrc({
      assetId: englishRow.artworkAssetId,
      storageKind: englishRow.storageKind,
      storageKey: englishRow.storageKey,
    });

    topics.push(
      projectPublishedTopic({
        id: englishRow.id,
        slug: englishRow.slug,
        sortOrder: englishRow.sortOrder,
        themeKey: englishRow.themeKey,
        objectPosition: englishRow.objectPosition,
        knowledgeReviewDate: englishRow.knowledgeReviewDate,
        artworkSrc,
        english: asStoredTranslation(englishRow),
        localized: localizedRow ? asStoredTranslation(localizedRow) : undefined,
        locale,
      }),
    );
  }

  return topics;
}

export async function nextTopicSortOrder(): Promise<number> {
  const db = getDatabase();
  const rows = await db
    .select({ sortOrder: topic.sortOrder })
    .from(topic)
    .orderBy(desc(topic.sortOrder))
    .limit(1);

  return (rows[0]?.sortOrder ?? 0) + 1;
}

export function newId(): string {
  return randomUUID();
}
