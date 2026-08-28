import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { encodeSseEvent } from "@/features/conversations/conversation-sse";
import { sealConversationToken } from "@/features/conversations/server/ape-conversation-token";

import { POST } from "./route";

const ROUTE_URL =
  "http://localhost:3011/api/topics/income-tax/conversation-turns";
const TOKEN_KEY_HEX = "11".repeat(32);
const PROJECT_ID = "660e8400-e29b-41d4-a716-446655440001";
const CONVERSATION_ID = "880e8400-e29b-41d4-a716-446655440003";

beforeEach(() => {
  vi.stubEnv("APE_BASE_URL", "https://ape.example");
  vi.stubEnv("APE_ORG_KEY", "ape_live_test");
  vi.stubEnv("APE_CONVERSATION_TOKEN_KEY", TOKEN_KEY_HEX);
  vi.stubEnv("APE_PROJECT_INCOME_TAX", PROJECT_ID);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
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

function context() {
  return { params: Promise.resolve({ slug: "income-tax" }) };
}

describe("POST /api/topics/[slug]/conversation-turns", () => {
  it("sends the user's question to APE unchanged", async () => {
    const fetchMock = vi.fn(
      async (input: string | URL | Request, _init?: RequestInit) => {
        void _init;
        const url = String(input);

        if (url.endsWith("/conversations")) {
          return Response.json(
            { success: true, data: { id: CONVERSATION_ID } },
            { status: 201 },
          );
        }

        return new Response(
          [
            encodeSseEvent("token", { event: "token", delta: "Hello" }),
            encodeSseEvent("done", {
              event: "done",
              assistant_message_id:
                "aa0e8400-e29b-41d4-a716-446655440005",
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
    expect(JSON.parse(String(messageInit?.body))).toEqual({
      content: "  Keep my spacing.  ",
    });
  });

  it("rejects a continuation token bound to another topic at the route", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const token = sealConversationToken(
      Buffer.from(TOKEN_KEY_HEX, "hex"),
      "topic_literature",
      CONVERSATION_ID,
    );

    const response = await POST(
      routeRequest({ question: "Follow up?", continuationToken: token }),
      context(),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain("event: error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a tampered continuation token at the route", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const token = sealConversationToken(
      Buffer.from(TOKEN_KEY_HEX, "hex"),
      "topic_income_tax",
      CONVERSATION_ID,
    );
    const middle = Math.floor(token.length / 2);
    const replacement = token[middle] === "A" ? "B" : "A";
    const tampered = `${token.slice(0, middle)}${replacement}${token.slice(
      middle + 1,
    )}`;

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
