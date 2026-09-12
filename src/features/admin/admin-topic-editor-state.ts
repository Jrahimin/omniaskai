import type {
  AdminArtworkOption,
  AdminTopicEditor,
  AdminTopicRevision,
  AdminTopicTranslation,
} from "@/features/topics/admin-topic-types";

export function adminEditorSource(
  topic: Pick<AdminTopicEditor, "draft" | "live" | "retained">,
): AdminTopicRevision | null {
  return topic.draft ?? topic.live ?? topic.retained;
}

export type EditorTranslation = Omit<AdminTopicTranslation, "starterQuestions"> & {
  starterQuestionsText: string;
  previewSourcesText: string;
};

export function normalizeMultilineList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toEditorTranslation(translation: AdminTopicTranslation): EditorTranslation {
  return {
    ...translation,
    starterQuestionsText: translation.starterQuestions.join("\n"),
    previewSourcesText: (translation.preview?.sources ?? []).join("\n"),
  };
}

export function emptyEditorTranslation(): EditorTranslation {
  return {
    title: "",
    landingDescription: "",
    workspaceSubtitle: "",
    aboutDescription: "",
    sourceDescription: "",
    artworkAlt: "",
    composerPlaceholder: "",
    starterQuestionsText: "",
    previewSourcesText: "",
  };
}

export function translationForSave(translation: EditorTranslation): AdminTopicTranslation {
  const exploreLabel = translation.exploreLabel?.trim();
  const preview = normalizedPreview(translation);

  return {
    title: translation.title,
    landingDescription: translation.landingDescription,
    workspaceSubtitle: translation.workspaceSubtitle,
    aboutDescription: translation.aboutDescription,
    sourceDescription: translation.sourceDescription,
    badge: translation.badge?.trim() || undefined,
    artworkAlt: translation.artworkAlt,
    composerPlaceholder: translation.composerPlaceholder,
    exploreLabel: exploreLabel || undefined,
    preview,
    starterQuestions: normalizeMultilineList(translation.starterQuestionsText),
  };
}

export function fieldsFromEditor(topic: AdminTopicEditor): {
  source: AdminTopicRevision | null;
  english: EditorTranslation;
  bangla: EditorTranslation;
  includeBangla: boolean;
} {
  const source = adminEditorSource(topic);

  return {
    source,
    english: source ? toEditorTranslation(source.translations.en) : emptyEditorTranslation(),
    bangla: source?.translations.bn
      ? toEditorTranslation(source.translations.bn)
      : emptyEditorTranslation(),
    includeBangla: Boolean(source?.translations.bn),
  };
}

export function recoveredEditorMetadata(
  localSlug: string,
  latest: Pick<
    AdminTopicEditor,
    "version" | "isLive" | "slugLocked" | "slug" | "draft" | "live" | "retained"
  >,
): {
  version: number;
  isLive: boolean;
  slugLocked: boolean;
  slug: string;
  slugReconciled: boolean;
  hasDraft: boolean;
} {
  const slugLocked = latest.slugLocked;
  const slug = slugLocked ? latest.slug : localSlug;

  return {
    version: latest.version,
    isLive: latest.isLive,
    slugLocked,
    slug,
    slugReconciled: slugLocked && localSlug !== latest.slug,
    hasDraft: Boolean(latest.draft),
  };
}

export function editorSaveFingerprint(input: {
  slug: string;
  themeKey: string;
  focalPosition: string;
  knowledgeReviewDate: string | null;
  artworkAssetId: string | null;
  apeProjectId: string | null;
  english: EditorTranslation;
  bangla: EditorTranslation;
  includeBangla: boolean;
}): string {
  return JSON.stringify({
    slug: input.slug,
    themeKey: input.themeKey,
    focalPosition: input.focalPosition,
    knowledgeReviewDate: input.knowledgeReviewDate,
    artworkAssetId: input.artworkAssetId,
    apeProjectId: input.apeProjectId,
    english: translationForSave(input.english),
    bangla: input.includeBangla ? translationForSave(input.bangla) : null,
  });
}

export function knowledgeProjectsForPicker(
  projects: Array<{ id: string; name: string }>,
  selectedId: string,
  selectedName?: string | null,
): Array<{ id: string; name: string }> {
  const trimmed = selectedId.trim();

  if (!trimmed || projects.some((project) => project.id === trimmed)) {
    return projects;
  }

  return [{ id: trimmed, name: selectedName?.trim() || trimmed }, ...projects];
}

export function artworkOptionLabel(
  asset: Pick<AdminArtworkOption, "id" | "storageKind" | "storageKey">,
): string {
  if (asset.storageKind === "bundled") {
    return asset.storageKey.replace(/^topics\//, "");
  }

  return `Uploaded · ${asset.id.slice(0, 8)}`;
}

export const artworkPositionOptions = [
  { value: "center", label: "Center" },
  { value: "left center", label: "Left" },
  { value: "right center", label: "Right" },
  { value: "center top", label: "Top" },
  { value: "center bottom", label: "Bottom" },
  { value: "left 40%", label: "Left, slightly up" },
] as const;

function normalizedPreview(
  translation: EditorTranslation,
): AdminTopicTranslation["preview"] {
  const preview = translation.preview;
  const youLabel = preview?.youLabel.trim() ?? "";
  const assistantLabel = preview?.assistantLabel.trim() ?? "";
  const question = preview?.question.trim() ?? "";
  const answer = preview?.answer.trim() ?? "";
  const sources = normalizeMultilineList(translation.previewSourcesText);

  if (!youLabel && !assistantLabel && !question && !answer && sources.length === 0) {
    return undefined;
  }

  return {
    youLabel,
    assistantLabel,
    question,
    answer,
    sources,
  };
}
