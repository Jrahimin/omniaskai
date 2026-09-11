import { describe, expect, it } from "vitest";

import type { Topic } from "./topic";
import { getTopicPresentation } from "./topic-presentation";

const topic: Topic = {
  id: "topic_income_tax",
  slug: "income-tax",
  title: "Income Tax",
  landingDescription: "Landing",
  workspaceSubtitle: "Workspace",
  aboutDescription: "About",
  sourceDescription: "Sources",
  artworkAlt: "Alt",
  composerPlaceholder: "Ask…",
  starterQuestions: ["What is taxable?"],
  themeKey: "tax",
  objectPosition: "left center",
  sortOrder: 1,
};

describe("topic presentation", () => {
  it("projects the theme preset without a featured flag", () => {
    const presentation = getTopicPresentation({
      ...topic,
      artworkSrc: "/topics/topic-income-tax.png",
    });

    expect(presentation).toEqual({
      artworkSrc: "/topics/topic-income-tax.png",
      objectPosition: "left center",
      mood: "tax",
      scrimFrom: "rgba(10, 38, 34, 0.58)",
    });
    expect(presentation).not.toHaveProperty("featured");
  });

  it("omits artworkSrc so the UI can render a gradient fallback", () => {
    const presentation = getTopicPresentation(topic);

    expect(presentation.artworkSrc).toBeUndefined();
  });
});
