import { z } from "zod";

import type { TopicPreview } from "./topic";
import { topicThemeKeys } from "./topic-theme";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const topicSlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const topicPreviewSchema = z.object({
  youLabel: z.string().trim().min(1).max(80),
  assistantLabel: z.string().trim().min(1).max(80),
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(2000),
  sources: z.array(z.string().trim().min(1).max(80)).min(1).max(8),
});

export const starterQuestionsSchema = z
  .array(z.string().trim().min(1).max(240))
  .max(10);

export const topicTranslationDraftSchema = z.object({
  title: z.string().max(160),
  landingDescription: z.string().max(500),
  workspaceSubtitle: z.string().max(240),
  aboutDescription: z.string().max(4000),
  sourceDescription: z.string().max(240),
  badge: z.string().trim().max(40).optional(),
  artworkAlt: z.string().max(240),
  composerPlaceholder: z.string().max(240),
  exploreLabel: z.string().trim().max(80).optional(),
  preview: topicPreviewSchema.optional(),
  starterQuestions: starterQuestionsSchema,
});

export const publishEnglishTranslationSchema = z.object({
  title: z.string().trim().min(1).max(160),
  landingDescription: z.string().trim().min(1).max(500),
  workspaceSubtitle: z.string().trim().min(1).max(240),
  aboutDescription: z.string().trim().min(1).max(4000),
  sourceDescription: z.string().trim().min(1).max(240),
  badge: z.string().trim().max(40).optional(),
  artworkAlt: z.string().max(240),
  composerPlaceholder: z.string().max(240),
  exploreLabel: z.string().trim().max(80).optional(),
  preview: topicPreviewSchema.optional(),
  starterQuestions: starterQuestionsSchema.min(1).max(10),
});

export const catalogTopicSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z][a-z0-9_]*$/),
  slug: topicSlugSchema,
  sortOrder: z.number().int().min(1).max(10_000),
  themeKey: z.enum(topicThemeKeys),
  focalPosition: z.string().trim().min(1).max(80),
  knowledgeReviewDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  artwork: z
    .object({
      storageKey: z.string().min(1).max(240),
      mimeType: z.string().min(1).max(80),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      byteSize: z.number().int().nonnegative(),
    })
    .optional(),
  apeProjectId: z.string().regex(UUID_PATTERN).optional(),
  translations: z.object({
    en: topicTranslationDraftSchema,
    bn: topicTranslationDraftSchema.optional(),
  }),
});

export const catalogFixtureSchema = z.object({
  version: z.literal(1),
  topics: z.array(catalogTopicSchema).min(1),
});

export type CatalogTopicInput = z.infer<typeof catalogTopicSchema>;
export type CatalogFixture = z.infer<typeof catalogFixtureSchema>;
export type TopicTranslationDraft = z.infer<typeof topicTranslationDraftSchema>;

export function parseTopicPreview(value: unknown): TopicPreview | undefined {
  const parsed = topicPreviewSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function toPublishEnglishInput(row: {
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
}) {
  return {
    title: row.title,
    landingDescription: row.landingDescription,
    workspaceSubtitle: row.workspaceSubtitle,
    aboutDescription: row.aboutDescription,
    sourceDescription: row.sourceDescription,
    badge: row.badge ?? undefined,
    artworkAlt: row.artworkAlt,
    composerPlaceholder: row.composerPlaceholder,
    exploreLabel: row.exploreLabel ?? undefined,
    preview: parseTopicPreview(row.preview),
    starterQuestions: Array.isArray(row.starterQuestions)
      ? row.starterQuestions.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
  };
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
