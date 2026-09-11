import type { Topic } from "./topic";
import {
  asStoredTranslation,
  projectPublishedTopic,
} from "./topic-locale-fallback";
import type { TopicThemeKey } from "./topic-theme";
import type { TopicTranslationDraft } from "./topic-validation-schema";

export function projectAdminPreviewTopic(input: {
  id: string;
  slug: string;
  sortOrder: number;
  themeKey: TopicThemeKey;
  focalPosition: string;
  knowledgeReviewDate: string | null;
  artworkSrc?: string;
  translations: {
    en: TopicTranslationDraft;
    bn?: TopicTranslationDraft;
  };
  locale: "en" | "bn";
}): Topic {
  const english = asStoredTranslation({
    title: input.translations.en.title,
    landingDescription: input.translations.en.landingDescription,
    workspaceSubtitle: input.translations.en.workspaceSubtitle,
    aboutDescription: input.translations.en.aboutDescription,
    sourceDescription: input.translations.en.sourceDescription,
    badge: input.translations.en.badge ?? null,
    artworkAlt: input.translations.en.artworkAlt,
    composerPlaceholder: input.translations.en.composerPlaceholder,
    exploreLabel: input.translations.en.exploreLabel ?? null,
    preview: input.translations.en.preview ?? null,
    starterQuestions: input.translations.en.starterQuestions,
  });
  const bangla = input.translations.bn
    ? asStoredTranslation({
        title: input.translations.bn.title,
        landingDescription: input.translations.bn.landingDescription,
        workspaceSubtitle: input.translations.bn.workspaceSubtitle,
        aboutDescription: input.translations.bn.aboutDescription,
        sourceDescription: input.translations.bn.sourceDescription,
        badge: input.translations.bn.badge ?? null,
        artworkAlt: input.translations.bn.artworkAlt,
        composerPlaceholder: input.translations.bn.composerPlaceholder,
        exploreLabel: input.translations.bn.exploreLabel ?? null,
        preview: input.translations.bn.preview ?? null,
        starterQuestions: input.translations.bn.starterQuestions,
      })
    : undefined;

  return projectPublishedTopic({
    id: input.id,
    slug: input.slug,
    sortOrder: input.sortOrder,
    themeKey: input.themeKey,
    objectPosition: input.focalPosition,
    knowledgeReviewDate: input.knowledgeReviewDate,
    artworkSrc: input.artworkSrc,
    english,
    localized: bangla,
    locale: input.locale,
  });
}
