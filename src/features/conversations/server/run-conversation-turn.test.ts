import { describe, expect, it, vi } from "vitest";

import { encodeSseEvent } from "../conversation-sse";
import { runConversationTurn } from "./run-conversation-turn";
import type {
  ConversationTurnClientEvent,
  ConversationTurnGateway,
  ConversationTurnLifecycle,
} from "./run-conversation-turn";

const tokens = {
  seal: (topicId: string, conversationReferenceId: string) =>
    `${topicId}:${conversationReferenceId}`,
};

const REFERENCE_ID = "990e8400-e29b-41d4-a716-446655440099";
const OPERATION_ID = "aa0e8400-e29b-41d4-a716-446655440088";
const APE_CONVERSATION_ID = "880e8400-e29b-41d4-a716-446655440003";
const PROJECT_ID = "660e8400-e29b-41d4-a716-446655440001";

function collectEvents() {
  const events: ConversationTurnClientEvent[] = [];
  return {
    events,
    emit: (event: ConversationTurnClientEvent) => {
      events.push(event);
    },
  };
}

function sseResponse(chunks: string[], status = 200): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(stream, { status });
}

function groundedDone() {
  return encodeSseEvent("done", {
    event: "done",
    assistant_message_id: "aa0e8400-e29b-41d4-a716-446655440005",
    grounded: true,
    insufficient_evidence_reason: null,
    source_provenance: "knowledge",
    citations: [
      {
        chunk_id: "770e8400-e29b-41d4-a716-446655440002",
        filename: "note.pdf",
        source_kind: "knowledge",
        source_title: "Note",
      },
    ],
    claims: [],
  });
}

function baseInput(overrides: {
  gateway: ConversationTurnGateway;
  emit: (event: ConversationTurnClientEvent) => void;
  apeConversationId?: string;
  lifecycle?: ConversationTurnLifecycle;
  signal?: AbortSignal;
}) {
  return {
    topicId: "topic_income_tax",
    projectId: PROJECT_ID,
    conversationReferenceId: REFERENCE_ID,
    operationId: OPERATION_ID,
    apeConversationId: overrides.apeConversationId,
    question: "What is taxable?",
    signal: overrides.signal ?? new AbortController().signal,
    gateway: overrides.gateway,
    tokens,
    lifecycle: overrides.lifecycle,
    emit: overrides.emit,
  };
}

describe("runConversationTurn", () => {
  it("creates then streams a grounded answer with a public operation id", async () => {
    const { events, emit } = collectEvents();
    const persistCreatedConversation = vi.fn(async () => undefined);
    const persistCompleted = vi.fn(async () => "recorded" as const);
    const createConversation = vi.fn(async () => APE_CONVERSATION_ID);
    const streamMessage = vi.fn(async () =>
      sseResponse([
        encodeSseEvent("token", { event: "token", delta: "Hello" }),
        groundedDone(),
      ]),
    );

    await runConversationTurn(
      baseInput({
        gateway: { createConversation, streamMessage },
        emit,
        lifecycle: { persistCreatedConversation, persistCompleted },
      }),
    );

    expect(createConversation).toHaveBeenCalledOnce();
    expect(persistCreatedConversation).toHaveBeenCalledWith(APE_CONVERSATION_ID);
    expect(streamMessage).toHaveBeenCalledOnce();
    expect(events[0]).toMatchObject({
      event: "conversation",
      data: { continuationToken: `topic_income_tax:${REFERENCE_ID}` },
    });
    const last = events.at(-1);
    expect(last?.event).toBe("final");
    if (last?.event === "final") {
      expect(last.data.sourceProvenance).toBe("knowledge");
      expect(last.data.operationId).toBe(OPERATION_ID);
    }
    expect(JSON.stringify(events)).not.toContain(APE_CONVERSATION_ID);
    expect(JSON.stringify(events)).not.toContain(PROJECT_ID);
  });

  it("emits a retryable error when conversation create throws", async () => {
    const { events, emit } = collectEvents();
    const persistFailed = vi.fn(async () => undefined);
    const streamMessage = vi.fn();

    await runConversationTurn(
      baseInput({
        gateway: {
          createConversation: vi.fn(async () => {
            throw new Error("upstream down");
          }),
          streamMessage,
        },
        emit,
        lifecycle: { persistFailed },
      }),
    );

    expect(streamMessage).not.toHaveBeenCalled();
    expect(persistFailed).toHaveBeenCalledWith({
      state: "failed",
      blockConversation: false,
    });
    expect(events).toEqual([
      { event: "error", data: { retryable: true, code: "retryable" } },
    ]);
    expect(JSON.stringify(events)).not.toContain("upstream down");
  });

  it("does not stream when persisting a newly created APE conversation id fails", async () => {
    const { events, emit } = collectEvents();
    const persistFailed = vi.fn(async () => undefined);
    const streamMessage = vi.fn();

    await runConversationTurn(
      baseInput({
        gateway: {
          createConversation: vi.fn(async () => APE_CONVERSATION_ID),
          streamMessage,
        },
        emit,
        lifecycle: {
          persistCreatedConversation: async () => {
            throw new Error("disk full");
          },
          persistFailed,
        },
      }),
    );

    expect(streamMessage).not.toHaveBeenCalled();
    expect(persistFailed).toHaveBeenCalledWith({
      state: "unknown",
      blockConversation: true,
    });
    expect(events).toEqual([
      { event: "error", data: { retryable: false, code: "start_new" } },
    ]);
  });

  it("delivers a generated answer without operationId when final persistence fails", async () => {
    const { events, emit } = collectEvents();
    const persistCompleted = vi.fn(async () => "unrecorded" as const);

    await runConversationTurn(
      baseInput({
        apeConversationId: APE_CONVERSATION_ID,
        gateway: {
          createConversation: vi.fn(),
          streamMessage: vi.fn(async () =>
            sseResponse([
              encodeSseEvent("token", { event: "token", delta: "Hello" }),
              groundedDone(),
            ]),
          ),
        },
        emit,
        lifecycle: { persistCompleted },
      }),
    );

    const last = events.at(-1);
    expect(last?.event).toBe("final");
    if (last?.event === "final") {
      expect(last.data.operationId).toBeUndefined();
    }
  });

  it("emits conversation then a non-retryable error when create succeeds and the stream fails", async () => {
    const { events, emit } = collectEvents();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const persistFailed = vi.fn(async () => undefined);

    await runConversationTurn(
      baseInput({
        apeConversationId: APE_CONVERSATION_ID,
        gateway: {
          createConversation: vi.fn(),
          streamMessage: vi.fn(
            async () =>
              new Response(null, {
                status: 503,
                headers: {
                  "X-Request-ID": "req-503",
                  "X-Trace-ID": "trace-503",
                },
              }),
          ),
        },
        emit,
        lifecycle: { persistFailed },
      }),
    );

    expect(events.map((event) => event.event)).toEqual(["conversation", "error"]);
    expect(events.at(-1)).toEqual({
      event: "error",
      data: { retryable: false, code: "start_new" },
    });
    expect(JSON.stringify(events.at(-1))).not.toContain("req-503");
    expect(errorSpy).toHaveBeenCalledWith(
      "APE upstream request failed",
      expect.objectContaining({
        operation: "stream_message",
        status: 503,
        requestId: "req-503",
        traceId: "trace-503",
      }),
    );
    expect(persistFailed).toHaveBeenCalledWith({
      state: "unknown",
      blockConversation: true,
    });
    errorSpy.mockRestore();
  });

  it("treats a generic upstream SSE error as a start-new client error", async () => {
    const { events, emit } = collectEvents();

    await runConversationTurn(
      baseInput({
        apeConversationId: APE_CONVERSATION_ID,
        gateway: {
          createConversation: vi.fn(),
          streamMessage: vi.fn(async () =>
            sseResponse([
              encodeSseEvent("error", {
                event: "error",
                message: "The language model provider is temporarily unavailable.",
              }),
            ]),
          ),
        },
        emit,
      }),
    );

    expect(events.map((event) => event.event)).toEqual(["conversation", "error"]);
    expect(JSON.stringify(events.at(-1))).not.toContain("language model");
  });

  it("rejects a malformed done event instead of completing a blank answer", async () => {
    const { events, emit } = collectEvents();

    await runConversationTurn(
      baseInput({
        apeConversationId: APE_CONVERSATION_ID,
        gateway: {
          createConversation: vi.fn(),
          streamMessage: vi.fn(async () =>
            sseResponse([
              encodeSseEvent("token", { event: "token", delta: "Partial" }),
              encodeSseEvent("done", {}),
            ]),
          ),
        },
        emit,
      }),
    );

    expect(events.map((event) => event.event)).toEqual([
      "conversation",
      "token",
      "error",
    ]);
    expect(events.at(-1)).toEqual({
      event: "error",
      data: { retryable: false, code: "start_new" },
    });
  });

  it("records interruption without emitting a client error", async () => {
    const { events, emit } = collectEvents();
    const persistFailed = vi.fn(async () => undefined);
    const controller = new AbortController();
    controller.abort();

    await runConversationTurn(
      baseInput({
        signal: controller.signal,
        gateway: {
          createConversation: vi.fn(async (_id, signal) => {
            if (signal.aborted) {
              throw new Error("aborted");
            }

            return APE_CONVERSATION_ID;
          }),
          streamMessage: vi.fn(),
        },
        emit,
        lifecycle: { persistFailed },
      }),
    );

    expect(events).toEqual([]);
    expect(persistFailed).toHaveBeenCalledWith({
      state: "unknown",
      blockConversation: true,
    });
  });
});
