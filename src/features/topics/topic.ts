import type { TopicThemeKey } from "./topic-theme";

export type TopicPreview = {
  youLabel: string;
  assistantLabel: string;
  question: string;
  answer: string;
  sources: string[];
};

export type Topic = {
  id: string;
  slug: string;
  title: string;
  landingDescription: string;
  workspaceSubtitle: string;
  aboutDescription: string;
  sourceDescription: string;
  badge?: string;
  artworkAlt: string;
  composerPlaceholder: string;
  exploreLabel?: string;
  preview?: TopicPreview;
  starterQuestions: string[];
  themeKey: TopicThemeKey;
  artworkSrc?: string;
  objectPosition: string;
  knowledgeReviewDate?: string;
  sortOrder: number;
};
