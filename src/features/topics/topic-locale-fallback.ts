import type { Locale } from "@/lib/locale/locale";

import type { Topic, TopicPreview } from "./topic";
import { parseTopicPreview } from "./topic-validation-schema";
import type { TopicThemeKey } from "./topic-theme";

export type StoredTopicTranslation = {
  title: string;
  landingDescription: string;
  workspaceSubtitle: string;
  aboutDescription: string;
  sourceDescription: string;
  badge: string | null;
  artworkAlt: string;
  composerPlaceholder: string;
  exploreLabel: string | null;
  preview: TopicPreview | null;
  starterQuestions: string[];
};

export function resolveTopicTranslation(
  english: StoredTopicTranslation,
  localized: StoredTopicTranslation | undefined,
  locale: Locale,
): Omit<
  Topic,
  "id" | "slug" | "themeKey" | "artworkSrc" | "objectPosition" | "knowledgeReviewDate" | "sortOrder"
> {
  const source = locale === "bn" ? localized : undefined;

  return {
    title: fallbackText(source?.title, english.title),
    landingDescription: fallbackText(
      source?.landingDescription,
      english.landingDescription,
    ),
    workspaceSubtitle: fallbackText(
      source?.workspaceSubtitle,
      english.workspaceSubtitle,
    ),
    aboutDescription: fallbackText(
      source?.aboutDescription,
      english.aboutDescription,
    ),
    sourceDescription: fallbackText(
      source?.sourceDescription,
      english.sourceDescription,
    ),
    badge: fallbackOptional(source?.badge, english.badge),
    artworkAlt: fallbackText(source?.artworkAlt, english.artworkAlt) || english.title,
    composerPlaceholder: fallbackText(
      source?.composerPlaceholder,
      english.composerPlaceholder,
    ),
    exploreLabel: fallbackOptional(source?.exploreLabel, english.exploreLabel),
    preview: fallbackUnit(source?.preview, english.preview) ?? undefined,
    starterQuestions: fallbackUnit(
      source?.starterQuestions,
      english.starterQuestions,
    ),
  };
}

export function projectPublishedTopic(input: {
  id: string;
  slug: string;
  sortOrder: number;
  themeKey: TopicThemeKey;
  objectPosition: string;
  knowledgeReviewDate: string | null;
  artworkSrc?: string;
  english: StoredTopicTranslation;
  localized?: StoredTopicTranslation;
  locale: Locale;
}): Topic {
  const resolved = resolveTopicTranslation(
    input.english,
    input.localized,
    input.locale,
  );

  return {
    id: input.id,
    slug: input.slug,
    sortOrder: input.sortOrder,
    themeKey: input.themeKey,
    objectPosition: input.objectPosition,
    knowledgeReviewDate: input.knowledgeReviewDate ?? undefined,
    artworkSrc: input.artworkSrc,
    ...resolved,
  };
}

export function asStoredTranslation(row: {
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
}): StoredTopicTranslation {
  return {
    title: row.title,
    landingDescription: row.landingDescription,
    workspaceSubtitle: row.workspaceSubtitle,
    aboutDescription: row.aboutDescription,
    sourceDescription: row.sourceDescription,
    badge: row.badge,
    artworkAlt: row.artworkAlt,
    composerPlaceholder: row.composerPlaceholder,
    exploreLabel: row.exploreLabel,
    preview: parseTopicPreview(row.preview) ?? null,
    starterQuestions: Array.isArray(row.starterQuestions)
      ? row.starterQuestions.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0,
        )
      : [],
  };
}

function fallbackText(
  localized: string | null | undefined,
  english: string,
): string {
  const value = localized?.trim();
  return value ? value : english;
}

function fallbackOptional(
  localized: string | null | undefined,
  english: string | null | undefined,
): string | undefined {
  const value = localized?.trim();

  if (value) {
    return value;
  }

  const fallback = english?.trim();
  return fallback || undefined;
}

function fallbackUnit<T>(localized: T | null | undefined, english: T): T {
  if (localized == null) {
    return english;
  }

  if (Array.isArray(localized) && localized.length === 0) {
    return english;
  }

  return localized;
}
