import { describe, expect, it } from "vitest";

import type { AdminTopicRevision } from "@/features/topics/admin-topic-types";

import {
  adminEditorSource,
  editorSaveFingerprint,
  normalizeMultilineList,
  recoveredEditorMetadata,
  toEditorTranslation,
  translationForSave,
} from "./admin-topic-editor-state";

describe("admin topic editor state", () => {
  it("keeps blank lines until save, then normalizes list fields", () => {
    const translation = toEditorTranslation({
      title: "Income Tax",
      landingDescription: "",
      workspaceSubtitle: "",
      aboutDescription: "",
      sourceDescription: "",
      artworkAlt: "",
      composerPlaceholder: "",
      starterQuestions: ["What is taxable?"],
      preview: {
        youLabel: "You",
        assistantLabel: "Assistant",
        question: "Q",
        answer: "A",
        sources: ["NBR"],
      },
    });

    translation.starterQuestionsText = "What is taxable?\n\nHow do I file?\n";
    translation.previewSourcesText = "NBR\n\nSROs\n";

    expect(translation.starterQuestionsText).toContain("\n\n");
    expect(normalizeMultilineList(translation.starterQuestionsText)).toEqual([
      "What is taxable?",
      "How do I file?",
    ]);
    expect(translationForSave(translation).starterQuestions).toEqual([
      "What is taxable?",
      "How do I file?",
    ]);
    expect(translationForSave(translation).preview?.sources).toEqual(["NBR", "SROs"]);
  });

  it("prefers draft, then live, then the retained revision", () => {
    const retained = { revisionId: "retained" } as AdminTopicRevision;
    const live = { revisionId: "live" } as AdminTopicRevision;
    const draft = { revisionId: "draft" } as AdminTopicRevision;

    expect(adminEditorSource({ draft: null, live: null, retained })?.revisionId).toBe("retained");
    expect(adminEditorSource({ draft: null, live, retained })?.revisionId).toBe("live");
    expect(adminEditorSource({ draft, live, retained })?.revisionId).toBe("draft");
  });

  it("locks and reconciles slug after a concurrent first publication", () => {
    const recovered = recoveredEditorMetadata("alpha-edited", {
      version: 4,
      isLive: true,
      slugLocked: true,
      slug: "alpha",
      draft: null,
      live: { revisionId: "live" } as AdminTopicRevision,
      retained: null,
    });

    expect(recovered).toMatchObject({
      version: 4,
      isLive: true,
      slugLocked: true,
      slug: "alpha",
      slugReconciled: true,
      hasDraft: false,
    });
  });

  it("changes the save fingerprint when copy is edited", () => {
    const english = toEditorTranslation({
      title: "Alpha",
      landingDescription: "",
      workspaceSubtitle: "",
      aboutDescription: "",
      sourceDescription: "",
      artworkAlt: "",
      composerPlaceholder: "",
      starterQuestions: [],
    });
    const base = {
      slug: "alpha",
      themeKey: "tax",
      focalPosition: "center",
      knowledgeReviewDate: null,
      artworkAssetId: null,
      apeProjectId: null,
      english,
      bangla: english,
      includeBangla: false,
    };

    expect(editorSaveFingerprint(base)).toBe(editorSaveFingerprint(base));
    expect(
      editorSaveFingerprint({
        ...base,
        english: { ...english, title: "Kept title" },
      }),
    ).not.toBe(editorSaveFingerprint(base));
  });
});
