import { describe, expect, it } from "vitest";

import type { AdminTopicRevision } from "@/features/topics/admin-topic-types";

import {
  adminEditorSource,
  editorSaveFingerprint,
  knowledgeProjectsForPicker,
  normalizeMultilineList,
  recoveredEditorMetadata,
  toEditorTranslation,
  translationForSave,
  artworkOptionLabel,
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

  it("labels bundled artwork by filename and uploaded artwork by a short id", () => {
    expect(
      artworkOptionLabel({
        id: "47348101-d598-4261-9bc4-848335f5744b",
        storageKind: "bundled",
        storageKey: "topics/topic-income-tax.png",
      }),
    ).toBe("topic-income-tax.png");
    expect(
      artworkOptionLabel({
        id: "99810c9e-2e97-4de1-b54b-870031d1ed0f",
        storageKind: "uploaded",
        storageKey: "99810c9e-2e97-4de1-b54b-870031d1ed0f",
      }),
    ).toBe("Uploaded · 99810c9e");
  });

  it("keeps a stored project in the picker when it is not on the first APE page", () => {
    const listed = [{ id: "660e8400-e29b-41d4-a716-446655440002", name: "Literature" }];
    const storedId = "660e8400-e29b-41d4-a716-446655440001";

    expect(knowledgeProjectsForPicker(listed, storedId, "Income Tax")).toEqual([
      { id: storedId, name: "Income Tax" },
      ...listed,
    ]);
    expect(knowledgeProjectsForPicker(listed, listed[0]!.id, "Literature")).toEqual(listed);
    expect(knowledgeProjectsForPicker(listed, "", null)).toEqual(listed);
  });
});
