import type { TopicTranslationDraft } from "./topic-validation-schema";
import type { TopicThemeKey } from "./topic-theme";

export type AdminTopicSummary = {
  id: string;
  slug: string;
  sortOrder: number;
  version: number;
  title: string;
  hasDraft: boolean;
  isLive: boolean;
};

export type AdminTopicTranslation = TopicTranslationDraft;

export type AdminTopicRevision = {
  revisionId: string;
  revisionNumber: number;
  themeKey: TopicThemeKey;
  artworkAssetId: string | null;
  artworkSrc?: string;
  focalPosition: string;
  knowledgeReviewDate: string | null;
  apeProjectId: string | null;
  lastValidationResult:
    | "valid"
    | "inaccessible"
    | "inactive"
    | "deleted"
    | "missing"
    | null;
  translations: {
    en: AdminTopicTranslation;
    bn?: AdminTopicTranslation;
  };
};

export type AdminTopicEditor = {
  id: string;
  slug: string;
  slugLocked: boolean;
  version: number;
  conversationEpoch: number;
  isLive: boolean;
  draft: AdminTopicRevision | null;
  live: AdminTopicRevision | null;
  retained: AdminTopicRevision | null;
};

export type AdminArtworkOption = {
  id: string;
  storageKind: "bundled" | "uploaded";
  storageKey: string;
  artworkSrc?: string;
};
