import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { encodeSseEvent } from "@/features/conversations/conversation-sse";
import { sealConversationToken } from "@/features/conversations/server/ape-conversation-token";
import {
  ConversationBusyError,
  ConversationPersistenceError,
} from "@/features/conversations/server/conversation-turn-persistence";
import { TopicCatalogUnavailableError } from "@/features/topics/server/topic-errors";

const {
  loadPublishedTopicExecution,
  reserveConversationTurn,
  persistCreatedApeConversation,
  completeTurnOperation,
  failTurnOperation,
} = vi.hoisted(() => ({
  loadPublishedTopicExecution: vi.fn(),
  reserveConversationTurn: vi.fn(),
  persistCreatedApeConversation: vi.fn(),
  completeTurnOperation: vi.fn(),
  failTurnOperation: vi.fn(),
}));

vi.mock("@/features/topics/server/topic-catalog-read", () => ({
  loadPublishedTopicExecution,
}));

vi.mock("@/features/conversations/server/conversation-turn-persistence", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/conversations/server/conversation-turn-persistence")
    >();

  return {
    ...actual,
    reserveConversationTurn,
    persistCreatedApeConversation,
    completeTurnOperation,
    failTurnOperation,
  };
});

import { POST } from "./route";

const ROUTE_URL =
  "http://localhost:3011/api/topics/income-tax/conversation-turns";
const TOKEN_KEY_HEX = "11".repeat(32);
const PROJECT_ID = "660e8400-e29b-41d4-a716-446655440001";
const APE_CONVERSATION_ID = "880e8400-e29b-41d4-a716-446655440003";
const REFERENCE_ID = "990e8400-e29b-41d4-a716-446655440099";
const OPERATION_ID = "aa0e8400-e29b-41d4-a716-446655440088";

beforeEach(() => {
  vi.stubEnv("APE_BASE_URL", "https://ape.example");
  vi.stubEnv("APE_ORG_KEY", "ape_live_test");
  vi.stubEnv("APE_CONVERSATION_TOKEN_KEY", TOKEN_KEY_HEX);
  loadPublishedTopicExecution.mockReset();
  reserveConversationTurn.mockReset();
  persistCreatedApeConversation.mockReset();
  completeTurnOperation.mockReset();
  failTurnOperation.mockReset();
  loadPublishedTopicExecution.mockResolvedValue({
    topicId: "topic_income_tax",
    slug: "income-tax",
    conversationEpoch: 0,
    liveRevisionId: "110e8400-e29b-41d4-a716-446655440010",
    apeProjectId: PROJECT_ID,
  });
  reserveConversationTurn.mockResolvedValue({
    conversationReferenceId: REFERENCE_ID,
    operationId: OPERATION_ID,
    apeConversationId: null,
    apeProjectId: PROJECT_ID,
  });
  persistCreatedApeConversation.mockResolvedValue(undefined);
  completeTurnOperation.mockResolvedValue("recorded");
  failTurnOperation.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function routeRequest(body: unknown): NextRequest {
  return new NextRequest(ROUTE_URL, {
    method: "POST",
    headers: {
      origin: "http://localhost:3011",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function context(slug = "income-tax") {
  return { params: Promise.resolve({ slug }) };
}

describe("POST /api/topics/[slug]/conversation-turns", () => {
  it("sends the user's question to APE unchanged", async () => {
    const fetchMock = vi.fn(
      async (input: string | URL | Request, _init?: RequestInit) => {
        void _init;
        const url = String(input);

        if (url.endsWith("/conversations")) {
          return Response.json(
            { success: true, data: { id: APE_CONVERSATION_ID } },
            { status: 201 },
          );
        }

        return new Response(
          [
            encodeSseEvent("token", { event: "token", delta: "Hello" }),
            encodeSseEvent("done", {
              event: "done",
              assistant_message_id: "aa0e8400-e29b-41d4-a716-446655440005",
              citations: [],
              claims: [],
              grounded: false,
              insufficient_evidence_reason: null,
              source_provenance: "none",
            }),
          ].join(""),
          { status: 200, headers: { "Content-Type": "text/event-stream" } },
        );
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      routeRequest({ question: "  Keep my spacing.  " }),
      context(),
    );
    const streamText = await response.text();
    const messageInit = fetchMock.mock.calls[1]?.[1] as RequestInit | undefined;

    expect(response.status).toBe(200);
    expect(streamText).toContain("event: final");
    expect(streamText).toContain("event: conversation");
    expect(streamText).toContain(OPERATION_ID);
    expect(streamText).not.toContain("ape_live_test");
    expect(streamText).not.toContain(PROJECT_ID);
    expect(streamText).not.toContain(APE_CONVERSATION_ID);
    expect(JSON.parse(String(messageInit?.body))).toEqual({
      content: "  Keep my spacing.  ",
    });
  });

  it("returns 404 for an unpublished topic before opening the stream", async () => {
    loadPublishedTopicExecution.mockResolvedValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      routeRequest({ question: "What is taxable?" }),
      context("unknown-topic"),
    );

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(reserveConversationTurn).not.toHaveBeenCalled();
  });

  it("returns 503 when the catalog cannot be read", async () => {
    loadPublishedTopicExecution.mockRejectedValue(new TopicCatalogUnavailableError());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      routeRequest({ question: "What is taxable?" }),
      context(),
    );

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not call APE when PostgreSQL reservation fails", async () => {
    reserveConversationTurn.mockRejectedValue(new ConversationPersistenceError("down"));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      routeRequest({ question: "What is taxable?" }),
      context(),
    );
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('"retryable":true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a concurrent running turn as retryable", async () => {
    reserveConversationTurn.mockRejectedValue(new ConversationBusyError());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      routeRequest({ question: "What is taxable?" }),
      context(),
    );

    expect(await response.text()).toContain('"retryable":true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a continuation token bound to another topic at the route", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const token = sealConversationToken(
      Buffer.from(TOKEN_KEY_HEX, "hex"),
      "topic_literature",
      REFERENCE_ID,
    );

    const response = await POST(
      routeRequest({ question: "Follow up?", continuationToken: token }),
      context(),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain('"code":"start_new"');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(reserveConversationTurn).not.toHaveBeenCalled();
  });

  it("rejects a tampered continuation token at the route", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const token = sealConversationToken(
      Buffer.from(TOKEN_KEY_HEX, "hex"),
      "topic_income_tax",
      REFERENCE_ID,
    );
    const middle = Math.floor(token.length / 2);
    const replacement = token[middle] === "A" ? "B" : "A";
    const tampered = `${token.slice(0, middle)}${replacement}${token.slice(middle + 1)}`;

    const response = await POST(
      routeRequest({ question: "Follow up?", continuationToken: tampered }),
      context(),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain("event: error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed continuation token before opening the stream", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      routeRequest({ question: "Follow up?", continuationToken: 123 }),
      context(),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
