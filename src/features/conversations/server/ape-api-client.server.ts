import "server-only";

import type { ApeRuntimeConfig } from "./ape-config.server";
import type { ApeEnvelope } from "./ape-stream-events";
import { isRecord } from "./ape-stream-events";
import { logApeHttpFailure, logApeUpstreamFailure } from "./ape-upstream-log";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const APE_REQUEST_TIMEOUT_MS = 120_000;

function apeRequestSignal(signal?: AbortSignal): AbortSignal {
  if (typeof AbortSignal.timeout !== "function") {
    return signal ?? new AbortController().signal;
  }

  const timeout = AbortSignal.timeout(APE_REQUEST_TIMEOUT_MS);

  if (!signal) {
    return timeout;
  }

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([signal, timeout]);
  }

  return timeout;
}

export async function createApeConversation(
  config: ApeRuntimeConfig,
  projectId: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  let response: Response;

  try {
    response = await fetch(
      `${config.baseUrl}/api/v1/projects/${projectId}/conversations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.orgKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ title: null }),
        cache: "no-store",
        signal: apeRequestSignal(signal),
      },
    );
  } catch {
    logApeUpstreamFailure("create_conversation");
    return undefined;
  }

  if (!response.ok) {
    logApeHttpFailure("create_conversation", response);
    return undefined;
  }

  try {
    const envelope = (await response.json()) as ApeEnvelope<{ id?: string }>;
    const id = envelope.success === true ? envelope.data?.id : undefined;

    if (typeof id === "string" && UUID_PATTERN.test(id)) {
      return id;
    }
  } catch {
    logApeHttpFailure("create_conversation", response);
    return undefined;
  }

  logApeHttpFailure("create_conversation", response);
  return undefined;
}

export type ApeProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  deletedAt: string | null;
};

export type ApeProjectReadResult =
  | { status: "ok"; project: ApeProjectRecord }
  | { status: "missing" }
  | { status: "inaccessible" }
  | { status: "unreachable" };

export type ApeProjectListResult =
  | {
      status: "ok";
      items: ApeProjectRecord[];
      total: number;
      limit: number;
      offset: number;
    }
  | { status: "inaccessible" }
  | { status: "unreachable" };

export async function getApeProject(
  config: ApeRuntimeConfig,
  projectId: string,
  signal?: AbortSignal,
): Promise<ApeProjectReadResult> {
  let response: Response;

  try {
    response = await fetch(`${config.baseUrl}/api/v1/projects/${projectId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.orgKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: apeRequestSignal(signal),
    });
  } catch {
    logApeUpstreamFailure("get_project");
    return { status: "unreachable" };
  }

  if (response.status === 404) {
    return { status: "missing" };
  }

  if (response.status === 401 || response.status === 403) {
    logApeHttpFailure("get_project", response);
    return { status: "inaccessible" };
  }

  if (!response.ok) {
    logApeHttpFailure("get_project", response);
    return { status: "unreachable" };
  }

  try {
    const envelope = (await response.json()) as ApeEnvelope<unknown>;
    const project =
      envelope.success === true ? parseApeProjectRecord(envelope.data) : undefined;

    if (!project) {
      logApeHttpFailure("get_project", response);
      return { status: "unreachable" };
    }

    return { status: "ok", project };
  } catch {
    logApeHttpFailure("get_project", response);
    return { status: "unreachable" };
  }
}

export async function listApeProjects(
  config: ApeRuntimeConfig,
  paging: { limit: number; offset: number },
  signal?: AbortSignal,
): Promise<ApeProjectListResult> {
  const limit = Math.min(Math.max(paging.limit, 1), 100);
  const offset = Math.max(paging.offset, 0);
  let response: Response;

  try {
    response = await fetch(
      `${config.baseUrl}/api/v1/projects?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.orgKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: apeRequestSignal(signal),
      },
    );
  } catch {
    logApeUpstreamFailure("list_projects");
    return { status: "unreachable" };
  }

  if (response.status === 401 || response.status === 403) {
    logApeHttpFailure("list_projects", response);
    return { status: "inaccessible" };
  }

  if (!response.ok) {
    logApeHttpFailure("list_projects", response);
    return { status: "unreachable" };
  }

  try {
    const envelope = (await response.json()) as ApeEnvelope<unknown>;
    const parsed =
      envelope.success === true ? parseApeProjectList(envelope.data, limit, offset) : undefined;

    if (!parsed) {
      logApeHttpFailure("list_projects", response);
      return { status: "unreachable" };
    }

    return parsed;
  } catch {
    logApeHttpFailure("list_projects", response);
    return { status: "unreachable" };
  }
}

export function parseApeProjectRecord(value: unknown): ApeProjectRecord | undefined {
  if (!isRecord(value) || typeof value.id !== "string" || !UUID_PATTERN.test(value.id)) {
    return undefined;
  }

  if (typeof value.name !== "string" || typeof value.is_active !== "boolean") {
    return undefined;
  }

  if (
    value.description !== null &&
    value.description !== undefined &&
    typeof value.description !== "string"
  ) {
    return undefined;
  }

  if (
    value.deleted_at !== null &&
    value.deleted_at !== undefined &&
    typeof value.deleted_at !== "string"
  ) {
    return undefined;
  }

  return {
    id: value.id,
    name: value.name,
    description: typeof value.description === "string" ? value.description : null,
    isActive: value.is_active,
    deletedAt: typeof value.deleted_at === "string" ? value.deleted_at : null,
  };
}

export function parseApeProjectList(
  value: unknown,
  limit: number,
  offset: number,
): Extract<ApeProjectListResult, { status: "ok" }> | undefined {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return undefined;
  }

  const items: ApeProjectRecord[] = [];

  for (const item of value.items) {
    const parsed = parseApeProjectRecord(item);

    if (!parsed) {
      return undefined;
    }

    items.push(parsed);
  }

  const total =
    typeof value.total === "number" && Number.isInteger(value.total) && value.total >= 0
      ? value.total
      : items.length;

  return {
    status: "ok",
    items,
    total,
    limit,
    offset,
  };
}

export function classifyApeProjectForPublish(
  result: ApeProjectReadResult,
): "valid" | "inaccessible" | "inactive" | "deleted" | "missing" {
  if (result.status === "missing") {
    return "missing";
  }

  if (result.status === "inaccessible" || result.status === "unreachable") {
    return "inaccessible";
  }

  if (result.project.deletedAt) {
    return "deleted";
  }

  if (!result.project.isActive) {
    return "inactive";
  }

  return "valid";
}

export async function streamApeMessage(
  config: ApeRuntimeConfig,
  projectId: string,
  conversationId: string,
  content: string,
  signal: AbortSignal,
): Promise<Response> {
  return fetch(
    `${config.baseUrl}/api/v1/projects/${projectId}/conversations/${conversationId}/messages/stream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.orgKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ content }),
      cache: "no-store",
      signal: apeRequestSignal(signal),
    },
  );
}

export type ApeTranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string | null;
};

export const APE_TRANSCRIPT_PAGE_SIZE = 50;
export const APE_TRANSCRIPT_MAX_OFFSET = APE_TRANSCRIPT_PAGE_SIZE * 19;

export type ApeTranscriptResult =
  | {
      status: "ok";
      messages: ApeTranscriptMessage[];
      total: number;
      limit: number;
      offset: number;
    }
  | { status: "unavailable" };

export async function getApeConversationMessages(
  config: ApeRuntimeConfig,
  projectId: string,
  conversationId: string,
  paging: { limit?: number; offset?: number } = {},
  signal?: AbortSignal,
): Promise<ApeTranscriptResult> {
  const limit = Math.min(Math.max(paging.limit ?? APE_TRANSCRIPT_PAGE_SIZE, 1), APE_TRANSCRIPT_PAGE_SIZE);
  const offset = Math.max(paging.offset ?? 0, 0);
  let response: Response;

  try {
    response = await fetch(
      `${config.baseUrl}/api/v1/projects/${projectId}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.orgKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: apeRequestSignal(signal),
      },
    );
  } catch {
    logApeUpstreamFailure("get_conversation_messages");
    return { status: "unavailable" };
  }

  if (!response.ok) {
    logApeHttpFailure("get_conversation_messages", response);
    return { status: "unavailable" };
  }

  try {
    const envelope = (await response.json()) as ApeEnvelope<unknown>;
    const parsed =
      envelope.success === true
        ? parseApeTranscriptPage(envelope.data, limit, offset)
        : undefined;

    if (!parsed) {
      logApeHttpFailure("get_conversation_messages", response);
      return { status: "unavailable" };
    }

    return parsed;
  } catch {
    logApeHttpFailure("get_conversation_messages", response);
    return { status: "unavailable" };
  }
}

export function parseApeTranscriptPage(
  value: unknown,
  limit: number,
  offset: number,
): Extract<ApeTranscriptResult, { status: "ok" }> | undefined {
  const messages = parseApeTranscriptMessages(value);

  if (!messages) {
    return undefined;
  }

  const total =
    isRecord(value) && typeof value.total === "number" && Number.isInteger(value.total) && value.total >= 0
      ? value.total
      : offset + messages.length;

  return {
    status: "ok",
    messages,
    total,
    limit,
    offset,
  };
}

export function parseApeTranscriptMessages(value: unknown): ApeTranscriptMessage[] | undefined {
  const items = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.items)
      ? value.items
      : isRecord(value) && Array.isArray(value.messages)
        ? value.messages
        : undefined;

  if (!items) {
    return undefined;
  }

  const messages: ApeTranscriptMessage[] = [];

  for (const item of items) {
    const parsed = parseApeTranscriptMessage(item);

    if (!parsed) {
      return undefined;
    }

    messages.push(parsed);
  }

  return messages;
}

function parseApeTranscriptMessage(value: unknown): ApeTranscriptMessage | undefined {
  if (!isRecord(value) || typeof value.id !== "string" || !UUID_PATTERN.test(value.id)) {
    return undefined;
  }

  const roleValue = typeof value.role === "string" ? value.role.toLowerCase() : "";
  const role =
    roleValue === "assistant"
      ? "assistant"
      : roleValue === "user" || roleValue === "human"
        ? "user"
        : undefined;

  if (!role) {
    return undefined;
  }

  const content =
    typeof value.content === "string"
      ? value.content
      : typeof value.text === "string"
        ? value.text
        : undefined;

  if (content === undefined) {
    return undefined;
  }

  const createdAt =
    typeof value.created_at === "string"
      ? value.created_at
      : typeof value.createdAt === "string"
        ? value.createdAt
        : null;

  return {
    id: value.id,
    role,
    content,
    createdAt,
  };
}
