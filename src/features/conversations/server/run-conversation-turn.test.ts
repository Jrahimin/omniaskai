import { describe, expect, it, vi } from "vitest";

import { encodeSseEvent } from "../conversation-sse";
import { runConversationTurn } from "./run-conversation-turn";
import type {
  ConversationTurnClientEvent,
  ConversationTurnGateway,
} from "./run-conversation-turn";

const tokens = {
  seal: (topicId: string, conversationId: string) =>
    `${topicId}:${conversationId}`,
  open: (token: string, topicId: string) => {
    const [tokenTopic, conversationId] = token.split(":");
    return tokenTopic === topicId ? conversationId : undefined;
  },
};

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

describe("runConversationTurn", () => {
  it("creates then streams a grounded answer", async () => {
    const { events, emit } = collectEvents();
    const createConversation = vi.fn(async () => "conv-1");
    const streamMessage = vi.fn(async () =>
      sseResponse([
        encodeSseEvent("token", { event: "token", delta: "Hello" }),
        encodeSseEvent("done", {
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
        }),
      ]),
    );
    const gateway: ConversationTurnGateway = {
      createConversation,
      streamMessage,
    };

    await runConversationTurn({
      topicId: "topic_income_tax",
      projectId: "660e8400-e29b-41d4-a716-446655440001",
      question: "What is taxable?",
      signal: new AbortController().signal,
      gateway,
      tokens,
      emit,
    });

    expect(createConversation).toHaveBeenCalledOnce();
    expect(streamMessage).toHaveBeenCalledOnce();
    expect(events[0]).toMatchObject({
      event: "conversation",
      data: { continuationToken: "topic_income_tax:conv-1" },
    });
    const last = events.at(-1);
    expect(last?.event).toBe("final");
    if (last?.event === "final") {
      expect(last.data.sourceProvenance).toBe("knowledge");
    }
  });

  it("emits conversation then error when create succeeds and the stream fails", async () => {
    const { events, emit } = collectEvents();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const createConversation = vi.fn(async () => "conv-1");
    const streamMessage = vi.fn(
      async () =>
        new Response(null, {
          status: 503,
          headers: {
            "X-Request-ID": "req-503",
            "X-Trace-ID": "trace-503",
          },
        }),
    );

    await runConversationTurn({
      topicId: "topic_income_tax",
      projectId: "660e8400-e29b-41d4-a716-446655440001",
      question: "What is taxable?",
      signal: new AbortController().signal,
      gateway: { createConversation, streamMessage },
      tokens,
      emit,
    });

    expect(createConversation).toHaveBeenCalledOnce();
    expect(streamMessage).toHaveBeenCalledOnce();
    expect(events.map((event) => event.event)).toEqual([
      "conversation",
      "error",
    ]);
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
    errorSpy.mockRestore();
  });

  it("emits a generic error when conversation create throws", async () => {
    const { events, emit } = collectEvents();

    await runConversationTurn({
      topicId: "topic_income_tax",
      projectId: "660e8400-e29b-41d4-a716-446655440001",
      question: "What is taxable?",
      signal: new AbortController().signal,
      gateway: {
        createConversation: vi.fn(async () => {
          throw new Error("upstream down");
        }),
        streamMessage: vi.fn(),
      },
      tokens,
      emit,
    });

    expect(events).toEqual([{ event: "error", data: {} }]);
    expect(JSON.stringify(events)).not.toContain("upstream down");
  });

  it("does not create a conversation for a tampered continuation token", async () => {
    const { events, emit } = collectEvents();
    const createConversation = vi.fn(async () => "conv-1");
    const streamMessage = vi.fn();

    await runConversationTurn({
      topicId: "topic_income_tax",
      projectId: "660e8400-e29b-41d4-a716-446655440001",
      question: "Follow up?",
      continuationToken: "topic_literature:conv-9",
      signal: new AbortController().signal,
      gateway: { createConversation, streamMessage },
      tokens,
      emit,
    });

    expect(createConversation).not.toHaveBeenCalled();
    expect(streamMessage).not.toHaveBeenCalled();
    expect(events).toEqual([{ event: "error", data: {} }]);
  });

  it("treats a generic upstream SSE error as a generic client error", async () => {
    const { events, emit } = collectEvents();

    await runConversationTurn({
      topicId: "topic_income_tax",
      projectId: "660e8400-e29b-41d4-a716-446655440001",
      question: "What is taxable?",
      continuationToken: "topic_income_tax:conv-1",
      signal: new AbortController().signal,
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
      tokens,
      emit,
    });

    expect(events.map((event) => event.event)).toEqual([
      "conversation",
      "error",
    ]);
    expect(JSON.stringify(events.at(-1))).not.toContain("language model");
  });

  it("rejects a malformed done event instead of completing a blank answer", async () => {
    const { events, emit } = collectEvents();

    await runConversationTurn({
      topicId: "topic_income_tax",
      projectId: "660e8400-e29b-41d4-a716-446655440001",
      question: "What is taxable?",
      continuationToken: "topic_income_tax:conv-1",
      signal: new AbortController().signal,
      gateway: {
        createConversation: vi.fn(),
        streamMessage: vi.fn(async () =>
          sseResponse([
            encodeSseEvent("token", { event: "token", delta: "Partial" }),
            encodeSseEvent("done", {}),
          ]),
        ),
      },
      tokens,
      emit,
    });

    expect(events.map((event) => event.event)).toEqual([
      "conversation",
      "token",
      "error",
    ]);
  });
});
