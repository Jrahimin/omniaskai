import { randomUUID } from "node:crypto";

import type { ConversationTurnFinal } from "../conversation";
import { readDecodedSse } from "../conversation-sse";
import { mapApeDoneToFinal } from "./ape-to-omni-mapper";
import {
  asApeDoneEvent,
  tokenDeltaFrom,
} from "./ape-stream-events";

export type ConversationTurnClientEvent =
  | { event: "conversation"; data: { continuationToken: string } }
  | { event: "token"; data: { delta: string } }
  | { event: "final"; data: ConversationTurnFinal }
  | { event: "error"; data: Record<string, never> };

export type ConversationTurnGateway = {
  createConversation(
    projectId: string,
    signal: AbortSignal,
  ): Promise<string | undefined>;
  streamMessage(
    projectId: string,
    conversationId: string,
    content: string,
    signal: AbortSignal,
  ): Promise<Response>;
};

export type ConversationTokenCodec = {
  seal(topicId: string, conversationId: string): string;
  open(token: string, topicId: string): string | undefined;
};

export type RunConversationTurnInput = {
  topicId: string;
  projectId: string;
  question: string;
  continuationToken?: string;
  signal: AbortSignal;
  gateway: ConversationTurnGateway;
  tokens: ConversationTokenCodec;
  emit: (event: ConversationTurnClientEvent) => void;
};

export async function runConversationTurn(
  input: RunConversationTurnInput,
): Promise<void> {
  let apeConversationId: string | undefined;

  if (input.continuationToken) {
    apeConversationId = input.tokens.open(
      input.continuationToken,
      input.topicId,
    );

    if (!apeConversationId) {
      input.emit({ event: "error", data: {} });
      return;
    }
  } else {
    apeConversationId = await input.gateway.createConversation(
      input.projectId,
      input.signal,
    );

    if (!apeConversationId) {
      input.emit({ event: "error", data: {} });
      return;
    }
  }

  input.emit({
    event: "conversation",
    data: {
      continuationToken: input.tokens.seal(input.topicId, apeConversationId),
    },
  });

  let response: Response;

  try {
    response = await input.gateway.streamMessage(
      input.projectId,
      apeConversationId,
      input.question,
      input.signal,
    );
  } catch {
    if (input.signal.aborted) {
      return;
    }

    input.emit({ event: "error", data: {} });
    return;
  }

  if (!response.ok || !response.body) {
    input.emit({ event: "error", data: {} });
    return;
  }

  let content = "";
  let finished = false;

  try {
    await readDecodedSse(
      response.body,
      (frame) => {
        if (finished || input.signal.aborted) {
          return;
        }

        if (frame.event === "token") {
          const delta = tokenDeltaFrom(frame.data);

          if (typeof delta !== "string") {
            return;
          }

          content += delta;
          input.emit({ event: "token", data: { delta } });
          return;
        }

        if (frame.event === "done") {
          const done = asApeDoneEvent(frame.data);

          if (!done || !content.trim()) {
            finished = true;
            input.emit({ event: "error", data: {} });
            return;
          }

          const final = mapApeDoneToFinal(content, done, randomUUID());
          finished = true;
          input.emit({
            event: "final",
            data: final,
          });
          return;
        }

        if (frame.event === "error") {
          finished = true;
          input.emit({ event: "error", data: {} });
        }
      },
      input.signal,
    );
  } catch {
    if (input.signal.aborted) {
      return;
    }

    if (!finished) {
      input.emit({ event: "error", data: {} });
    }

    return;
  }

  if (!finished && !input.signal.aborted) {
    input.emit({ event: "error", data: {} });
  }
}
