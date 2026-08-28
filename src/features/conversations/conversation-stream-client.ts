import type { ConversationTurnFinal } from "./conversation";
import { readDecodedSse } from "./conversation-sse";
import { createTokenDeltaBatcher } from "./conversation-token-batcher";

export type BrowserTurnHandlers = {
  onConversation: (continuationToken: string) => void;
  onToken: (delta: string) => void;
  onFinal: (payload: ConversationTurnFinal) => void;
  onError: (retryableBeforeAcceptance: boolean) => void;
};

export async function readConversationTurnStream(
  response: Response,
  handlers: BrowserTurnHandlers,
  signal?: AbortSignal,
): Promise<void> {
  if (!response.body) {
    handlers.onError(false);
    return;
  }

  let settled = false;
  let conversationIssued = false;
  const tokens = createTokenDeltaBatcher(handlers.onToken);

  await readDecodedSse(
    response.body,
    (frame) => {
      if (settled) {
        return;
      }

      if (frame.event === "conversation") {
        const token =
          isRecord(frame.data) && typeof frame.data.continuationToken === "string"
            ? frame.data.continuationToken
            : undefined;

        if (token) {
          conversationIssued = true;
          handlers.onConversation(token);
        } else {
          settled = true;
          handlers.onError(false);
        }

        return;
      }

      if (frame.event === "token") {
        const delta =
          isRecord(frame.data) && typeof frame.data.delta === "string"
            ? frame.data.delta
            : undefined;

        if (typeof delta === "string") {
          tokens.push(delta);
        }

        return;
      }

      if (frame.event === "final") {
        settled = true;
        tokens.flush();

        if (isMappedFinal(frame.data)) {
          handlers.onFinal(frame.data);
        } else {
          handlers.onError(false);
        }

        return;
      }

      if (frame.event === "error") {
        settled = true;
        tokens.flush();
        handlers.onError(!conversationIssued);
      }
    },
    signal,
  );

  tokens.flush();

  if (!settled && !signal?.aborted) {
    handlers.onError(false);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMappedFinal(value: unknown): value is ConversationTurnFinal {
  return (
    isRecord(value) &&
    (value.status === "grounded" ||
      value.status === "completed" ||
      value.status === "insufficient") &&
    Array.isArray(value.blocks) &&
    Array.isArray(value.sources) &&
    Array.isArray(value.sourceIds)
  );
}
