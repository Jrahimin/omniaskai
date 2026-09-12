"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminUnauthorizedError, requireAdminSession } from "@/features/admin/require-admin-session";
import {
  classifyApeProjectForPublish,
  getApeProject,
  listApeProjects,
  type ApeProjectRecord,
} from "@/features/conversations/server/ape-api-client.server";
import { getApeRuntimeConfig } from "@/features/conversations/server/ape-config.server";
import { isUuid, topicSlugSchema, topicTranslationDraftSchema } from "@/features/topics/topic-validation-schema";
import {
  createTopic,
  publishTopic,
  reorderTopics,
  saveTopicDraft,
  unpublishTopic,
  type SaveTopicDraftInput,
} from "@/features/topics/server/topic-operations";
import {
  TopicConcurrencyError,
  TopicConflictError,
  TopicNotFoundError,
  TopicValidationError,
} from "@/features/topics/server/topic-errors";
import { getAdminTopicEditor } from "@/features/topics/server/topic-admin-read";
import { isTopicThemeKey } from "@/features/topics/topic-theme";

export type AdminMutationResult =
  | { ok: true; version: number; topicId?: string }
  | { ok: false; code: "unauthorized" | "conflict" | "not_found" | "invalid"; message: string; version?: number };

export async function createAdminTopicAction(input: {
  slug: string;
  themeKey: string;
  title: string;
}): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    const slug = topicSlugSchema.parse(input.slug.trim().toLowerCase());
    const themeKey = input.themeKey;

    if (!isTopicThemeKey(themeKey)) {
      return { ok: false, code: "invalid", message: "Choose a theme." };
    }

    const title = input.title.trim();

    if (!title) {
      return { ok: false, code: "invalid", message: "English title is required." };
    }

    const topicId = `topic_${slug.replace(/-/g, "_")}`;
    const created = await createTopic({
      id: topicId,
      slug,
      themeKey,
      translations: {
        en: {
          title,
          landingDescription: "",
          workspaceSubtitle: "",
          aboutDescription: "",
          sourceDescription: "",
          artworkAlt: title,
          composerPlaceholder: "Ask this knowledge space…",
          starterQuestions: [],
        },
      },
    });

    revalidateAdminAndPublic();
    redirect(`/admin/topics/${created.topicId}`);
  } catch (error) {
    return mapMutationError(error);
  }
}

export async function saveAdminTopicDraftAction(
  input: SaveTopicDraftInput,
): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();

    if (input.themeKey && !isTopicThemeKey(input.themeKey)) {
      return { ok: false, code: "invalid", message: "Choose a theme." };
    }

    if (input.translations?.en) {
      topicTranslationDraftSchema.parse(input.translations.en);
    }

    if (input.translations?.bn) {
      topicTranslationDraftSchema.parse(input.translations.bn);
    }

    if (input.apeProjectId) {
      if (!isUuid(input.apeProjectId.trim())) {
        return { ok: false, code: "invalid", message: "Enter a valid APE project UUID." };
      }
    }

    const saved = await saveTopicDraft(input);
    revalidateAdminAndPublic();
    return { ok: true, version: saved.version };
  } catch (error) {
    return mapMutationError(error, input.expectedVersion);
  }
}

export async function publishAdminTopicAction(input: {
  topicId: string;
  expectedVersion: number;
}): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    const published = await publishTopic(input);
    revalidateAdminAndPublic();
    return { ok: true, version: published.version };
  } catch (error) {
    return mapMutationError(error, input.expectedVersion);
  }
}

export async function unpublishAdminTopicAction(input: {
  topicId: string;
  expectedVersion: number;
}): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    const unpublished = await unpublishTopic(input);
    revalidateAdminAndPublic();
    return { ok: true, version: unpublished.version };
  } catch (error) {
    return mapMutationError(error, input.expectedVersion);
  }
}

export async function reorderAdminTopicsAction(input: {
  orderedIds: string[];
  expectedVersions: Record<string, number>;
}): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    await reorderTopics(input);
    revalidateAdminAndPublic();
    return { ok: true, version: 0 };
  } catch (error) {
    return mapMutationError(error);
  }
}

export async function checkAdminApeProjectAction(projectId: string): Promise<
  | { ok: true; status: "valid" | "inaccessible" | "inactive" | "deleted" | "missing"; project?: ApeProjectRecord }
  | { ok: false; code: "unauthorized" | "invalid" | "unreachable"; message: string }
> {
  try {
    await requireAdminSession();

    if (!isUuid(projectId)) {
      return { ok: false, code: "invalid", message: "Enter a valid APE project UUID." };
    }

    const config = getApeRuntimeConfig();

    if (!config) {
      return { ok: false, code: "unreachable", message: "APE is not configured." };
    }

    const result = await getApeProject(config, projectId);

    if (result.status === "unreachable") {
      return { ok: false, code: "unreachable", message: "APE could not be reached." };
    }

    const status = classifyApeProjectForPublish(result);
    return {
      ok: true,
      status,
      project: result.status === "ok" ? result.project : undefined,
    };
  } catch (error) {
    if (isAdminUnauthorizedError(error)) {
      return { ok: false, code: "unauthorized", message: "Sign in to continue." };
    }

    return { ok: false, code: "unreachable", message: "APE could not be reached." };
  }
}

export async function listAdminApeProjectsAction(paging: {
  limit: number;
  offset: number;
}): Promise<
  | { ok: true; items: ApeProjectRecord[]; total: number }
  | { ok: false; code: "unauthorized" | "unreachable"; message: string }
> {
  try {
    await requireAdminSession();
    const config = getApeRuntimeConfig();

    if (!config) {
      return { ok: false, code: "unreachable", message: "APE is not configured." };
    }

    const result = await listApeProjects(config, paging);

    if (result.status !== "ok") {
      return { ok: false, code: "unreachable", message: "APE projects could not be listed." };
    }

    return { ok: true, items: result.items, total: result.total };
  } catch (error) {
    if (isAdminUnauthorizedError(error)) {
      return { ok: false, code: "unauthorized", message: "Sign in to continue." };
    }

    return { ok: false, code: "unreachable", message: "APE projects could not be listed." };
  }
}

export async function loadAdminApeEditorProjectsAction(storedProjectId: string | null): Promise<{
  items: ApeProjectRecord[];
  total: number;
  storedProject: ApeProjectRecord | null;
  listUnavailable: boolean;
}> {
  try {
    await requireAdminSession();
    const config = getApeRuntimeConfig();

    if (!config) {
      return { items: [], total: 0, storedProject: null, listUnavailable: true };
    }

    const listed = await listApeProjects(config, { limit: 50, offset: 0 });
    const items = listed.status === "ok" ? listed.items : [];
    const total = listed.status === "ok" ? listed.total : 0;
    let storedProject: ApeProjectRecord | null =
      storedProjectId && isUuid(storedProjectId)
        ? (items.find((project) => project.id === storedProjectId) ?? null)
        : null;

    if (storedProjectId && isUuid(storedProjectId) && !storedProject) {
      const result = await getApeProject(config, storedProjectId);
      storedProject = result.status === "ok" ? result.project : null;
    }

    return {
      items,
      total,
      storedProject,
      listUnavailable: listed.status !== "ok",
    };
  } catch (error) {
    if (isAdminUnauthorizedError(error)) {
      throw error;
    }

    return { items: [], total: 0, storedProject: null, listUnavailable: true };
  }
}

export async function loadAdminTopicEditorAction(topicId: string): Promise<
  | { ok: true; topic: Awaited<ReturnType<typeof getAdminTopicEditor>> }
  | { ok: false; code: "unauthorized" | "not_found" | "unavailable"; message: string }
> {
  try {
    await requireAdminSession();
    return { ok: true, topic: await getAdminTopicEditor(topicId) };
  } catch (error) {
    if (isAdminUnauthorizedError(error)) {
      return { ok: false, code: "unauthorized", message: "Sign in to continue." };
    }

    if (error instanceof TopicNotFoundError) {
      return { ok: false, code: "not_found", message: error.message };
    }

    return { ok: false, code: "unavailable", message: "The topic editor could not be loaded." };
  }
}

function revalidateAdminAndPublic(): void {
  revalidatePath("/");
  revalidatePath("/topics/[slug]", "page");
  revalidatePath("/admin/topics");
}

function mapMutationError(error: unknown, fallbackVersion?: number): AdminMutationResult {
  if (isAdminUnauthorizedError(error)) {
    return { ok: false, code: "unauthorized", message: "Sign in to continue." };
  }

  if (error instanceof TopicConcurrencyError) {
    return {
      ok: false,
      code: "conflict",
      message: "This topic was changed by another edit. Your text is still here — save again.",
      version: fallbackVersion,
    };
  }

  if (error instanceof TopicNotFoundError) {
    return { ok: false, code: "not_found", message: error.message };
  }

  if (error instanceof TopicValidationError || error instanceof TopicConflictError) {
    return { ok: false, code: "invalid", message: error.message };
  }

  if (error instanceof Error && "digest" in error) {
    throw error;
  }

  return { ok: false, code: "invalid", message: "Could not save those changes." };
}
