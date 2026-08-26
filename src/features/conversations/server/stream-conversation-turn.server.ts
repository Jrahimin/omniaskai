import "server-only";

import { encodeSseEvent } from "../conversation-sse";
import { getApeRuntimeConfig } from "./ape-config.server";
import {
  createApeConversation,
  streamApeMessage,
} from "./ape-api-client.server";
import {
  openConversationToken,
  sealConversationToken,
} from "./ape-conversation-token";
import { runConversationTurn } from "./run-conversation-turn";
import {
  getApeProjectIdForTopicSlug,
  getTopicIdForSlug,
} from "@/features/topics/topic-ape-project-mapping.server";

const MAX_QUESTION_LENGTH = 8000;
const MAX_CONTINUATION_TOKEN_LENGTH = 1024;
export const MAX_CONVERSATION_TURN_BODY_BYTES = 40_000;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

export type JsonBodyReadResult =
  | { ok: true; value: unknown }
  | { ok: false };

export async function readJsonBodyWithinLimit(
  request: Request,
  maxBytes = MAX_CONVERSATION_TURN_BODY_BYTES,
): Promise<JsonBodyReadResult> {
  const declaredLength = request.headers.get("content-length");

  if (declaredLength) {
    const parsedLength = Number(declaredLength);

    if (
      !Number.isSafeInteger(parsedLength) ||
      parsedLength < 0 ||
      parsedLength > maxBytes
    ) {
      return { ok: false };
    }
  }

  if (!request.body) {
    return { ok: false };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { ok: false };
      }

      chunks.push(value);
    }
  } catch {
    return { ok: false };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)),
    };
  } catch {
    return { ok: false };
  }
}

export function validateConversationTurnRequest(body: unknown):
  | { question: string; continuationToken?: string }
  | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }

  const record = body as Record<string, unknown>;
  const question = typeof record.question === "string" ? record.question : "";

  if (!question.trim() || question.length > MAX_QUESTION_LENGTH) {
    return undefined;
  }

  const hasContinuationToken = Object.prototype.hasOwnProperty.call(
    record,
    "continuationToken",
  );
  let continuationToken: string | undefined;

  if (hasContinuationToken) {
    if (
      typeof record.continuationToken !== "string" ||
      record.continuationToken.length === 0 ||
      record.continuationToken.length > MAX_CONTINUATION_TOKEN_LENGTH ||
      !BASE64URL_PATTERN.test(record.continuationToken)
    ) {
      return undefined;
    }

    continuationToken = record.continuationToken;
  }

  return { question, continuationToken };
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  return origin === new URL(request.url).origin;
}

export async function streamTopicConversationTurn(input: {
  slug: string;
  question: string;
  continuationToken?: string;
  signal: AbortSignal;
  enqueue: (chunk: string) => void;
}): Promise<void> {
  const config = getApeRuntimeConfig();
  const topicId = getTopicIdForSlug(input.slug);
  const projectId = getApeProjectIdForTopicSlug(input.slug);

  if (!config || !topicId || !projectId) {
    input.enqueue(encodeSseEvent("error", {}));
    return;
  }

  await runConversationTurn({
    topicId,
    projectId,
    question: input.question,
    continuationToken: input.continuationToken,
    signal: input.signal,
    gateway: {
      createConversation: (id, signal) =>
        createApeConversation(config, id, signal),
      streamMessage: (id, conversationId, content, signal) =>
        streamApeMessage(config, id, conversationId, content, signal),
    },
    tokens: {
      seal: (sealTopicId, conversationId) =>
        sealConversationToken(config.tokenKey, sealTopicId, conversationId),
      open: (token, expectedTopicId) =>
        openConversationToken(config.tokenKey, token, expectedTopicId),
    },
    emit: (event) => {
      input.enqueue(encodeSseEvent(event.event, event.data));
    },
  });
}
