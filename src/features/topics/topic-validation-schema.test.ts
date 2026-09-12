import { describe, expect, it } from "vitest";

import {
  publishEnglishTranslationSchema,
  toPublishEnglishInput,
  topicSlugSchema,
  topicTranslationDraftSchema,
} from "./topic-validation-schema";

describe("topic validation", () => {
  it("accepts lowercase hyphenated slugs up to 80 characters", () => {
    expect(topicSlugSchema.parse("income-tax")).toBe("income-tax");
    expect(topicSlugSchema.parse("a")).toBe("a");
  });

  it("rejects invalid slugs", () => {
    expect(topicSlugSchema.safeParse("Income-Tax").success).toBe(false);
    expect(topicSlugSchema.safeParse("-tax").success).toBe(false);
    expect(topicSlugSchema.safeParse("tax-").success).toBe(false);
    expect(topicSlugSchema.safeParse("income--tax").success).toBe(false);
    expect(topicSlugSchema.safeParse("a".repeat(81)).success).toBe(false);
  });

  it("allows incomplete drafts and requires complete English to publish", () => {
    expect(
      topicTranslationDraftSchema.parse({
        title: "",
        landingDescription: "",
        workspaceSubtitle: "",
        aboutDescription: "",
        sourceDescription: "",
        artworkAlt: "",
        composerPlaceholder: "",
        starterQuestions: [],
      }).title,
    ).toBe("");

    expect(
      publishEnglishTranslationSchema.safeParse({
        title: "Income Tax",
        landingDescription: "Landing",
        workspaceSubtitle: "Workspace",
        aboutDescription: "About",
        sourceDescription: "Sources",
        artworkAlt: "Alt",
        composerPlaceholder: "Ask…",
        starterQuestions: [],
      }).success,
    ).toBe(false);

    expect(
      publishEnglishTranslationSchema.safeParse({
        title: "Income Tax",
        landingDescription: "Landing",
        workspaceSubtitle: "Workspace",
        aboutDescription: "About",
        sourceDescription: "Sources",
        artworkAlt: "Alt",
        composerPlaceholder: "Ask…",
        starterQuestions: ["What is taxable?"],
      }).success,
    ).toBe(true);
  });

  it("accepts stored null optional fields when checking publish completeness", () => {
    expect(
      publishEnglishTranslationSchema.safeParse(
        toPublishEnglishInput({
          title: "Literature",
          landingDescription: "Landing",
          workspaceSubtitle: "Workspace",
          aboutDescription: "About",
          sourceDescription: "Sources",
          badge: null,
          artworkAlt: "Alt",
          composerPlaceholder: "Ask…",
          exploreLabel: null,
          preview: {
            youLabel: "You",
            assistantLabel: "OmniAskAI",
            question: "What is the mood of Gitanjali?",
            answer: "A quiet, devotional mood.",
            sources: ["Gitanjali"],
          },
          starterQuestions: ["What is the mood of Gitanjali?"],
        }),
      ).success,
    ).toBe(true);
  });
});
