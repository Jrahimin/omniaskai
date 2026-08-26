import "server-only";

import type { ApeRuntimeConfig } from "./ape-config.server";
import type { ApeEnvelope } from "./ape-stream-events";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createApeConversation(
  config: ApeRuntimeConfig,
  projectId: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  const response = await fetch(
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
      signal,
    },
  );

  if (!response.ok) {
    return undefined;
  }

  const envelope = (await response.json()) as ApeEnvelope<{ id?: string }>;
  const id = envelope.success === true ? envelope.data?.id : undefined;

  return typeof id === "string" && UUID_PATTERN.test(id) ? id : undefined;
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
      signal,
    },
  );
}
