import { describe, expect, it } from "vitest";

import { projectPublishedTopic } from "./topic-locale-fallback";
import type { StoredTopicTranslation } from "./topic-locale-fallback";

const english: StoredTopicTranslation = {
  title: "Income Tax",
  landingDescription: "English landing",
  workspaceSubtitle: "English workspace",
  aboutDescription: "English about",
  sourceDescription: "English sources",
  badge: "Popular",
  artworkAlt: "English alt",
  composerPlaceholder: "Ask in English…",
  exploreLabel: "Explore Income Tax",
  preview: {
    youLabel: "You",
    assistantLabel: "OmniAskAI",
    question: "What is taxable?",
    answer: "Salary can be taxable.",
    sources: ["NBR Guide"],
  },
  starterQuestions: ["What is taxable?", "Salary-r upor tax kivabe count hoy?"],
};

const banglaPartial: StoredTopicTranslation = {
  title: "আয়কর",
  landingDescription: "বাংলা ল্যান্ডিং",
  workspaceSubtitle: "",
  aboutDescription: "বাংলা পরিচিতি",
  sourceDescription: "",
  badge: null,
  artworkAlt: "",
  composerPlaceholder: "",
  exploreLabel: null,
  preview: null,
  starterQuestions: [],
};

describe("topic locale fallback", () => {
  it("falls back missing Bangla strings to English", () => {
    const topic = projectPublishedTopic({
      id: "topic_income_tax",
      slug: "income-tax",
      sortOrder: 1,
      themeKey: "tax",
      objectPosition: "center",
      knowledgeReviewDate: "2025-05-12",
      artworkSrc: "/topics/topic-income-tax.png",
      english,
      localized: banglaPartial,
      locale: "bn",
    });

    expect(topic.title).toBe("আয়কর");
    expect(topic.landingDescription).toBe("বাংলা ল্যান্ডিং");
    expect(topic.workspaceSubtitle).toBe("English workspace");
    expect(topic.sourceDescription).toBe("English sources");
    expect(topic.badge).toBe("Popular");
    expect(topic.composerPlaceholder).toBe("Ask in English…");
  });

  it("falls back preview and starter questions as complete units", () => {
    const topic = projectPublishedTopic({
      id: "topic_income_tax",
      slug: "income-tax",
      sortOrder: 1,
      themeKey: "tax",
      objectPosition: "center",
      knowledgeReviewDate: null,
      english,
      localized: banglaPartial,
      locale: "bn",
    });

    expect(topic.preview).toEqual(english.preview);
    expect(topic.starterQuestions).toEqual(english.starterQuestions);
  });

  it("keeps a complete Bangla starter list instead of mixing with English", () => {
    const topic = projectPublishedTopic({
      id: "topic_income_tax",
      slug: "income-tax",
      sortOrder: 1,
      themeKey: "tax",
      objectPosition: "center",
      knowledgeReviewDate: null,
      english,
      localized: {
        ...banglaPartial,
        starterQuestions: ["আয়কর কী?"],
        preview: {
          youLabel: "আপনি",
          assistantLabel: "OmniAskAI",
          question: "আয়কর কী?",
          answer: "একটি কর।",
          sources: ["এনবিআর"],
        },
      },
      locale: "bn",
    });

    expect(topic.starterQuestions).toEqual(["আয়কর কী?"]);
    expect(topic.preview?.question).toBe("আয়কর কী?");
  });
});
