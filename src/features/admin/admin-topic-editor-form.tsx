"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type {
  AdminArtworkOption,
  AdminTopicEditor,
} from "@/features/topics/admin-topic-types";
import { topicThemeKeys, type TopicThemeKey } from "@/features/topics/topic-theme";
import { uploadedArtworkSrc } from "@/features/topics/topic-presentation";

import { adminCopy } from "./admin-copy";
import {
  checkAdminApeProjectAction,
  listAdminApeProjectsAction,
  loadAdminTopicEditorAction,
  publishAdminTopicAction,
  saveAdminTopicDraftAction,
  unpublishAdminTopicAction,
} from "./admin-topic-actions";
import {
  editorSaveFingerprint,
  fieldsFromEditor,
  recoveredEditorMetadata,
  translationForSave,
  type EditorTranslation,
} from "./admin-topic-editor-state";
import { AdminTopicPreview } from "./admin-topic-preview";

type AdminTopicEditorFormProps = {
  topic: AdminTopicEditor;
  initialProjects: Array<{ id: string; name: string }>;
  artworkOptions: AdminArtworkOption[];
};

export function AdminTopicEditorForm({
  topic,
  initialProjects,
  artworkOptions,
}: AdminTopicEditorFormProps) {
  const router = useRouter();
  const initial = fieldsFromEditor(topic);
  const [version, setVersion] = useState(topic.version);
  const [isLive, setIsLive] = useState(topic.isLive);
  const [slugLocked, setSlugLocked] = useState(topic.slugLocked);
  const [hasDraft, setHasDraft] = useState(Boolean(topic.draft));
  const [slug, setSlug] = useState(topic.slug);
  const [themeKey, setThemeKey] = useState<TopicThemeKey>(initial.source?.themeKey ?? "tax");
  const [focalPosition, setFocalPosition] = useState(initial.source?.focalPosition ?? "center");
  const [knowledgeReviewDate, setKnowledgeReviewDate] = useState(
    initial.source?.knowledgeReviewDate ?? "",
  );
  const [artworkAssetId, setArtworkAssetId] = useState(initial.source?.artworkAssetId ?? "");
  const [artworkSrc, setArtworkSrc] = useState(initial.source?.artworkSrc);
  const [assets, setAssets] = useState(artworkOptions);
  const [apeProjectId, setApeProjectId] = useState(initial.source?.apeProjectId ?? "");
  const [english, setEnglish] = useState(initial.english);
  const [bangla, setBangla] = useState(initial.bangla);
  const [includeBangla, setIncludeBangla] = useState(initial.includeBangla);
  const [localeTab, setLocaleTab] = useState<"en" | "bn">("en");
  const [section, setSection] = useState<"edit" | "preview">("edit");
  const [message, setMessage] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [pending, setPending] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const [projectStatus, setProjectStatus] = useState<string | null>(
    initial.source?.lastValidationResult ?? null,
  );
  const [savedFingerprint, setSavedFingerprint] = useState(() =>
    editorSaveFingerprint({
      slug: topic.slug,
      themeKey: initial.source?.themeKey ?? "tax",
      focalPosition: initial.source?.focalPosition ?? "center",
      knowledgeReviewDate: initial.source?.knowledgeReviewDate ?? null,
      artworkAssetId: initial.source?.artworkAssetId ?? null,
      apeProjectId: initial.source?.apeProjectId ?? null,
      english: initial.english,
      bangla: initial.bangla,
      includeBangla: initial.includeBangla,
    }),
  );

  const translation = localeTab === "en" ? english : bangla;
  const setTranslation = localeTab === "en" ? setEnglish : setBangla;
  const previewLocale = localeTab === "bn" && includeBangla ? "bn" : "en";
  const dirty =
    editorSaveFingerprint({
      slug,
      themeKey,
      focalPosition,
      knowledgeReviewDate: knowledgeReviewDate.trim() || null,
      artworkAssetId: artworkAssetId.trim() || null,
      apeProjectId: apeProjectId.trim() || null,
      english,
      bangla,
      includeBangla,
    }) !== savedFingerprint;

  function applyArtwork(assetId: string, src: string | undefined) {
    setArtworkAssetId(assetId);
    setArtworkSrc(src);
  }

  function applyImmutableMetadata(
    latest: Parameters<typeof recoveredEditorMetadata>[1],
    localSlug: string,
  ) {
    const recovered = recoveredEditorMetadata(localSlug, latest);
    setVersion(recovered.version);
    setIsLive(recovered.isLive);
    setSlugLocked(recovered.slugLocked);
    setHasDraft(recovered.hasDraft);
    setSlug(recovered.slug);
    return recovered;
  }

  async function refreshServerMetadata(): Promise<boolean> {
    try {
      const latest = await loadAdminTopicEditorAction(topic.id);
      if (!latest.ok) {
        return false;
      }

      applyImmutableMetadata(latest.topic, slug);
      return true;
    } catch {
      return false;
    }
  }

  async function recoverAfterUncertainMutation() {
    const refreshed = await refreshServerMetadata();
    setMessage(refreshed ? adminCopy.uncertainSave : adminCopy.networkError);
  }

  async function runPending(work: () => Promise<void>) {
    setPending(true);
    setMessage(null);
    try {
      await work();
    } catch {
      await recoverAfterUncertainMutation();
    } finally {
      setPending(false);
    }
  }

  async function saveDraft() {
    await runPending(async () => {
      const result = await saveAdminTopicDraftAction({
        topicId: topic.id,
        expectedVersion: version,
        slug: slugLocked ? undefined : slug,
        themeKey,
        focalPosition,
        knowledgeReviewDate: knowledgeReviewDate.trim() || null,
        artworkAssetId: artworkAssetId.trim() || null,
        apeProjectId: apeProjectId.trim() || null,
        translations: {
          en: translationForSave(english),
          bn: includeBangla ? translationForSave(bangla) : null,
        },
      });

      if (result.ok) {
        setVersion(result.version);
        setConflict(false);
        setSavedFingerprint(
          editorSaveFingerprint({
            slug,
            themeKey,
            focalPosition,
            knowledgeReviewDate: knowledgeReviewDate.trim() || null,
            artworkAssetId: artworkAssetId.trim() || null,
            apeProjectId: apeProjectId.trim() || null,
            english,
            bangla,
            includeBangla,
          }),
        );
        setMessage("Draft saved.");
        router.refresh();
        return;
      }

      if (result.code === "conflict") {
        setConflict(true);
        setMessage(adminCopy.conflict);
        return;
      }

      setMessage(result.message);
    });
  }

  async function keepMineAndRetry() {
    await runPending(async () => {
      const latest = await loadAdminTopicEditorAction(topic.id);

      if (!latest.ok) {
        setMessage(latest.message);
        return;
      }

      const recovered = applyImmutableMetadata(latest.topic, slug);
      setConflict(false);
      setMessage(
        recovered.slugReconciled ? adminCopy.conflictSlugReconciled : adminCopy.conflictVersionReady,
      );
    });
  }

  async function restoreStoredDraft() {
    await runPending(async () => {
      const latest = await loadAdminTopicEditorAction(topic.id);

      if (!latest.ok) {
        setMessage(latest.message);
        return;
      }

      const next = fieldsFromEditor(latest.topic);
      applyImmutableMetadata(latest.topic, latest.topic.slug);
      setThemeKey(next.source?.themeKey ?? "tax");
      setFocalPosition(next.source?.focalPosition ?? "center");
      setKnowledgeReviewDate(next.source?.knowledgeReviewDate ?? "");
      setArtworkAssetId(next.source?.artworkAssetId ?? "");
      setArtworkSrc(next.source?.artworkSrc);
      setApeProjectId(next.source?.apeProjectId ?? "");
      setEnglish(next.english);
      setBangla(next.bangla);
      setIncludeBangla(next.includeBangla);
      setProjectStatus(next.source?.lastValidationResult ?? null);
      setSavedFingerprint(
        editorSaveFingerprint({
          slug: latest.topic.slug,
          themeKey: next.source?.themeKey ?? "tax",
          focalPosition: next.source?.focalPosition ?? "center",
          knowledgeReviewDate: next.source?.knowledgeReviewDate ?? null,
          artworkAssetId: next.source?.artworkAssetId ?? null,
          apeProjectId: next.source?.apeProjectId ?? null,
          english: next.english,
          bangla: next.bangla,
          includeBangla: next.includeBangla,
        }),
      );
      setConflict(false);
      setMessage(adminCopy.conflictRestored);
    });
  }

  const statusLabel = isLive
    ? adminCopy.statusLive
    : topic.live || topic.retained
      ? adminCopy.statusUnpublished
      : adminCopy.statusDraft;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted text-sm">
            {statusLabel}
            {hasDraft ? ` · ${adminCopy.statusDraft}` : ""}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{english.title || topic.slug}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSection(section === "edit" ? "preview" : "edit")}
            className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium"
          >
            {adminCopy.preview}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void saveDraft()}
            className="bg-brand cursor-pointer rounded-full px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {adminCopy.saveDraft}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              void runPending(async () => {
                if (dirty) {
                  setMessage(adminCopy.saveBeforePublish);
                  return;
                }

                const result = await publishAdminTopicAction({
                  topicId: topic.id,
                  expectedVersion: version,
                });
                if (result.ok) {
                  setVersion(result.version);
                  setIsLive(true);
                  setSlugLocked(true);
                  setHasDraft(false);
                  setConflict(false);
                  setMessage("Published.");
                  router.refresh();
                  return;
                }
                if (result.code === "conflict") {
                  setConflict(true);
                  setMessage(adminCopy.conflict);
                  return;
                }
                setMessage(result.message);
              })
            }
            className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
          >
            {adminCopy.publish}
          </button>
          {isLive ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                void runPending(async () => {
                  const result = await unpublishAdminTopicAction({
                    topicId: topic.id,
                    expectedVersion: version,
                  });
                  if (result.ok) {
                    setVersion(result.version);
                    setIsLive(false);
                    setConflict(false);
                    setMessage("Unpublished.");
                    router.refresh();
                    return;
                  }
                  if (result.code === "conflict") {
                    setConflict(true);
                    setMessage(adminCopy.conflict);
                    return;
                  }
                  setMessage(result.message);
                })
              }
              className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
            >
              {adminCopy.unpublish}
            </button>
          ) : null}
        </div>
      </div>

      {message ? <p className="text-sm text-[#5c3a16]">{message}</p> : null}
      {conflict ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => void keepMineAndRetry()}
            className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
          >
            {adminCopy.conflictKeepMine}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void restoreStoredDraft()}
            className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
          >
            {adminCopy.conflictRestoreStored}
          </button>
        </div>
      ) : null}

      {section === "preview" ? (
        <div className="flex flex-col gap-3">
          {dirty ? <p className="text-sm text-[#5c3a16]">{adminCopy.previewUnsaved}</p> : null}
          <AdminTopicPreview
            topicId={topic.id}
            slug={slug}
            themeKey={themeKey}
            focalPosition={focalPosition}
            knowledgeReviewDate={knowledgeReviewDate.trim() || null}
            artworkSrc={artworkSrc}
            locale={previewLocale}
            translations={{
              en: translationForSave(english),
              bn: includeBangla ? translationForSave(bangla) : undefined,
            }}
          />
        </div>
      ) : (
        <div className="grid gap-6 min-[1024px]:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="flex flex-col gap-5 rounded-[1.2rem] border border-[var(--border)] bg-white/80 p-5">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{adminCopy.slug}</span>
              <input
                value={slug}
                disabled={slugLocked}
                onChange={(event) => setSlug(event.target.value)}
                className="rounded-xl border border-[var(--border)] px-3 py-2 disabled:bg-[var(--surface-muted)]"
              />
              {slugLocked ? (
                <span className="text-muted text-xs">{adminCopy.slugLocked}</span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{adminCopy.theme}</span>
              <select
                value={themeKey}
                onChange={(event) => setThemeKey(event.target.value as TopicThemeKey)}
                className="rounded-xl border border-[var(--border)] px-3 py-2"
              >
                {topicThemeKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{adminCopy.focalPosition}</span>
              <input
                value={focalPosition}
                onChange={(event) => setFocalPosition(event.target.value)}
                className="rounded-xl border border-[var(--border)] px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{adminCopy.knowledgeReviewDate}</span>
              <input
                type="date"
                value={knowledgeReviewDate}
                onChange={(event) => setKnowledgeReviewDate(event.target.value)}
                className="rounded-xl border border-[var(--border)] px-3 py-2"
              />
            </label>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-medium">{adminCopy.artwork}</span>
              <label className="flex flex-col gap-1">
                <span className="text-muted text-xs">{adminCopy.existingArtwork}</span>
                <select
                  value={artworkAssetId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    const selected = assets.find((asset) => asset.id === nextId);
                    applyArtwork(nextId, selected?.artworkSrc);
                  }}
                  className="rounded-xl border border-[var(--border)] px-3 py-2"
                >
                  <option value="">{adminCopy.artworkNone}</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.storageKind === "bundled" ? asset.storageKey : asset.id}
                    </option>
                  ))}
                </select>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={pending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  const form = new FormData();
                  form.set("file", file);
                  void runPending(async () => {
                    let response: Response;
                    try {
                      response = await fetch("/api/admin/artwork", { method: "POST", body: form });
                    } catch {
                      setMessage(adminCopy.networkError);
                      return;
                    }

                    const payload = (await response.json()) as { assetId?: string; error?: string };
                    if (!response.ok || !payload.assetId) {
                      setMessage(payload.error ?? "Artwork could not be uploaded.");
                      return;
                    }
                    const src = uploadedArtworkSrc(payload.assetId);
                    setAssets((current) => {
                      if (current.some((asset) => asset.id === payload.assetId)) {
                        return current;
                      }

                      return [
                        {
                          id: payload.assetId!,
                          storageKind: "uploaded",
                          storageKey: payload.assetId!,
                          artworkSrc: src,
                        },
                        ...current,
                      ];
                    });
                    applyArtwork(payload.assetId, src);
                  });
                }}
              />
              <button
                type="button"
                className="text-muted w-fit cursor-pointer text-left text-xs"
                onClick={() => applyArtwork("", undefined)}
              >
                {adminCopy.clearArtwork}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm ${localeTab === "en" ? "bg-brand text-white" : "border border-[var(--border)]"}`}
                onClick={() => setLocaleTab("en")}
              >
                {adminCopy.english}
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm ${localeTab === "bn" ? "bg-brand text-white" : "border border-[var(--border)]"}`}
                onClick={() => {
                  setIncludeBangla(true);
                  setLocaleTab("bn");
                }}
              >
                {adminCopy.bangla}
              </button>
            </div>
            <TranslationFields
              translation={translation}
              onChange={setTranslation}
            />
          </div>
          <aside className="flex h-fit flex-col gap-3 rounded-[1.2rem] border border-[var(--border)] bg-white/80 p-4 text-sm">
            <p className="font-medium">{adminCopy.apeProject}</p>
            <input
              value={apeProjectId}
              onChange={(event) => setApeProjectId(event.target.value)}
              placeholder="APE project UUID"
              className="rounded-xl border border-[var(--border)] px-3 py-2"
            />
            <button
              type="button"
              className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 font-medium"
              onClick={() =>
                void runPending(async () => {
                  const result = await checkAdminApeProjectAction(apeProjectId);
                  if (!result.ok) {
                    setProjectStatus(result.message);
                    return;
                  }
                  setProjectStatus(result.status);
                })
              }
            >
              {adminCopy.checkProject}
            </button>
            {projectStatus ? <p className="text-muted text-xs">{projectStatus}</p> : null}
            <ul className="flex max-h-64 flex-col gap-1 overflow-auto">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    className="hover:text-foreground w-full cursor-pointer truncate text-left text-xs"
                    onClick={() => setApeProjectId(project.id)}
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="text-muted cursor-pointer text-left text-xs"
              onClick={() =>
                void runPending(async () => {
                  const result = await listAdminApeProjectsAction({
                    limit: 50,
                    offset: projects.length,
                  });
                  if (result.ok) {
                    setProjects((current) => [...current, ...result.items]);
                    return;
                  }
                  setMessage(result.message);
                })
              }
            >
              Load more projects
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

function TranslationFields({
  translation,
  onChange,
}: {
  translation: EditorTranslation;
  onChange: (value: EditorTranslation) => void;
}) {
  function patch(patchValue: Partial<EditorTranslation>) {
    onChange({ ...translation, ...patchValue });
  }

  function patchPreview(
    partial: Partial<NonNullable<EditorTranslation["preview"]>>,
  ) {
    patch({
      preview: {
        youLabel: translation.preview?.youLabel ?? "",
        assistantLabel: translation.preview?.assistantLabel ?? "",
        question: translation.preview?.question ?? "",
        answer: translation.preview?.answer ?? "",
        sources: translation.preview?.sources ?? [],
        ...partial,
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label={adminCopy.titleField} value={translation.title} onChange={(title) => patch({ title })} />
      <Field
        label={adminCopy.landingDescription}
        value={translation.landingDescription}
        onChange={(landingDescription) => patch({ landingDescription })}
        multiline
      />
      <Field
        label={adminCopy.workspaceSubtitle}
        value={translation.workspaceSubtitle}
        onChange={(workspaceSubtitle) => patch({ workspaceSubtitle })}
      />
      <Field
        label={adminCopy.aboutDescription}
        value={translation.aboutDescription}
        onChange={(aboutDescription) => patch({ aboutDescription })}
        multiline
      />
      <Field
        label={adminCopy.sourceDescription}
        value={translation.sourceDescription}
        onChange={(sourceDescription) => patch({ sourceDescription })}
      />
      <Field
        label={adminCopy.artworkAlt}
        value={translation.artworkAlt}
        onChange={(artworkAlt) => patch({ artworkAlt })}
      />
      <Field
        label={adminCopy.composerPlaceholder}
        value={translation.composerPlaceholder}
        onChange={(composerPlaceholder) => patch({ composerPlaceholder })}
      />
      <Field
        label={adminCopy.badge}
        value={translation.badge ?? ""}
        onChange={(badge) => patch({ badge: badge || undefined })}
      />
      <Field
        label={adminCopy.exploreLabel}
        value={translation.exploreLabel ?? ""}
        onChange={(exploreLabel) => patch({ exploreLabel: exploreLabel || undefined })}
      />
      <Field
        label={adminCopy.previewYouLabel}
        value={translation.preview?.youLabel ?? ""}
        onChange={(youLabel) => patchPreview({ youLabel })}
      />
      <Field
        label={adminCopy.previewAssistantLabel}
        value={translation.preview?.assistantLabel ?? ""}
        onChange={(assistantLabel) => patchPreview({ assistantLabel })}
      />
      <Field
        label={adminCopy.previewQuestion}
        value={translation.preview?.question ?? ""}
        onChange={(question) => patchPreview({ question })}
      />
      <Field
        label={adminCopy.previewAnswer}
        value={translation.preview?.answer ?? ""}
        onChange={(answer) => patchPreview({ answer })}
        multiline
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{adminCopy.previewSources}</span>
        <textarea
          rows={3}
          value={translation.previewSourcesText}
          onChange={(event) => patch({ previewSourcesText: event.target.value })}
          className="rounded-xl border border-[var(--border)] px-3 py-2"
        />
        <span className="text-muted text-xs">{adminCopy.previewHint}</span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{adminCopy.starterQuestions}</span>
        <textarea
          rows={5}
          value={translation.starterQuestionsText}
          onChange={(event) => patch({ starterQuestionsText: event.target.value })}
          className="rounded-xl border border-[var(--border)] px-3 py-2"
        />
        <span className="text-muted text-xs">{adminCopy.starterQuestionsHint}</span>
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className = "rounded-xl border border-[var(--border)] px-3 py-2";

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      )}
    </label>
  );
}
