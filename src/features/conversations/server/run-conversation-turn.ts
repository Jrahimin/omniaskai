import { randomUUID } from "node:crypto";

import type { ConversationTurnFinal } from "../conversation";
import { readDecodedSse } from "../conversation-sse";
import { mapApeDoneToFinal } from "./ape-to-omni-mapper";
import {
  asApeDoneEvent,
  tokenDeltaFrom,
} from "./ape-stream-events";
import { logApeHttpFailure } from "./ape-upstream-log";
import { STREAM_DEADLINE_MS } from "./conversation-turn-persistence";

export const CONVERSATION_TURN_ERROR_CODES = [
  "retryable",
  "start_new",
  "unavailable",
] as const;

export type ConversationTurnErrorCode =
  (typeof CONVERSATION_TURN_ERROR_CODES)[number];

export type ConversationTurnErrorData = {
  retryable: boolean;
  code: ConversationTurnErrorCode;
};

export type ConversationTurnClientEvent =
  | { event: "conversation"; data: { continuationToken: string } }
  | { event: "token"; data: { delta: string } }
  | { event: "final"; data: ConversationTurnFinal }
  | { event: "error"; data: ConversationTurnErrorData };

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
  seal(topicId: string, conversationReferenceId: string): string;
};

export type ConversationTurnLifecycle = {
  persistCreatedConversation?(apeConversationId: string): Promise<void>;
  persistCompleted?(input: {
    classification: "grounded" | "completed" | "insufficient";
    apeAssistantMessageId: string | null;
  }): Promise<"recorded" | "unrecorded">;
  persistFailed?(input: {
    state: "failed" | "unknown";
    blockConversation: boolean;
  }): Promise<void>;
};

export type RunConversationTurnInput = {
  topicId: string;
  projectId: string;
  conversationReferenceId: string;
  operationId: string;
  apeConversationId?: string;
  question: string;
  signal: AbortSignal;
  gateway: ConversationTurnGateway;
  tokens: ConversationTokenCodec;
  lifecycle?: ConversationTurnLifecycle;
  emit: (event: ConversationTurnClientEvent) => void;
};

export async function runConversationTurn(
  input: RunConversationTurnInput,
): Promise<void> {
  const combinedSignal = combineSignals(input.signal, STREAM_DEADLINE_MS);
  let apeConversationId = input.apeConversationId;
  let createdThisTurn = false;

  if (!apeConversationId) {
    try {
      apeConversationId = await input.gateway.createConversation(
        input.projectId,
        combinedSignal,
      );
    } catch {
      if (input.signal.aborted || combinedSignal.aborted) {
        await input.lifecycle?.persistFailed?.({
          state: "unknown",
          blockConversation: true,
        });
        return;
      }

      await input.lifecycle?.persistFailed?.({
        state: "failed",
        blockConversation: false,
      });
      input.emit(retryableError());
      return;
    }

    if (!apeConversationId) {
      await input.lifecycle?.persistFailed?.({
        state: "failed",
        blockConversation: false,
      });
      input.emit(retryableError());
      return;
    }

    createdThisTurn = true;

    try {
      await input.lifecycle?.persistCreatedConversation?.(apeConversationId);
    } catch {
      await input.lifecycle?.persistFailed?.({
        state: "unknown",
        blockConversation: true,
      });
      input.emit(startNewError());
      return;
    }
  }

  input.emit({
    event: "conversation",
    data: {
      continuationToken: input.tokens.seal(
        input.topicId,
        input.conversationReferenceId,
      ),
    },
  });

  let response: Response;

  try {
    response = await input.gateway.streamMessage(
      input.projectId,
      apeConversationId,
      input.question,
      combinedSignal,
    );
  } catch {
    if (input.signal.aborted) {
      await input.lifecycle?.persistFailed?.({
        state: "unknown",
        blockConversation: true,
      });
      return;
    }

    await input.lifecycle?.persistFailed?.({
      state: "unknown",
      blockConversation: true,
    });
    input.emit(startNewError());
    return;
  }

  if (!response.ok || !response.body) {
    if (!response.ok) {
      logApeHttpFailure("stream_message", response);
    }

    await input.lifecycle?.persistFailed?.({
      state: createdThisTurn ? "failed" : "unknown",
      blockConversation: true,
    });
    input.emit(startNewError());
    return;
  }

  let content = "";
  let finished = false;

  try {
    await readDecodedSse(
      response.body,
      async (frame) => {
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
            await input.lifecycle?.persistFailed?.({
              state: "unknown",
              blockConversation: true,
            });
            input.emit(startNewError());
            return;
          }

          const final = mapApeDoneToFinal(content, done, randomUUID());
          const recorded = await input.lifecycle?.persistCompleted?.({
            classification: final.status,
            apeAssistantMessageId: done.assistant_message_id,
          });

          finished = true;
          input.emit({
            event: "final",
            data:
              recorded === "unrecorded"
                ? final
                : { ...final, operationId: input.operationId },
          });
          return;
        }

        if (frame.event === "error") {
          finished = true;
          await input.lifecycle?.persistFailed?.({
            state: "unknown",
            blockConversation: true,
          });
          input.emit(startNewError());
        }
      },
      combinedSignal,
    );
  } catch {
    if (input.signal.aborted) {
      await input.lifecycle?.persistFailed?.({
        state: "unknown",
        blockConversation: true,
      });
      return;
    }

    if (!finished) {
      await input.lifecycle?.persistFailed?.({
        state: "unknown",
        blockConversation: true,
      });
      input.emit(startNewError());
    }

    return;
  }

  if (!finished && !input.signal.aborted) {
    await input.lifecycle?.persistFailed?.({
      state: "unknown",
      blockConversation: true,
    });
    input.emit(startNewError());
  }
}

function retryableError(): ConversationTurnClientEvent {
  return {
    event: "error",
    data: { retryable: true, code: "retryable" },
  };
}

function startNewError(): ConversationTurnClientEvent {
  return {
    event: "error",
    data: { retryable: false, code: "start_new" },
  };
}

function combineSignals(signal: AbortSignal, deadlineMs: number): AbortSignal {
  if (typeof AbortSignal.any === "function" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.any([signal, AbortSignal.timeout(deadlineMs)]);
  }

  return signal;
}
