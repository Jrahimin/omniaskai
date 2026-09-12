import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sealConversationToken } from "@/features/conversations/server/ape-conversation-token";
import { ConversationFeedbackError } from "@/features/conversations/server/conversation-feedback";

const { upsertAnswerFeedback } = vi.hoisted(() => ({
  upsertAnswerFeedback: vi.fn(),
}));

vi.mock("@/features/conversations/server/conversation-feedback", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/conversations/server/conversation-feedback")
    >();

  return {
    ...actual,
    upsertAnswerFeedback,
  };
});

import { POST } from "./route";

const TOKEN_KEY_HEX = "11".repeat(32);
const OPERATION_ID = "aa0e8400-e29b-41d4-a716-446655440088";
const REFERENCE_ID = "990e8400-e29b-41d4-a716-446655440099";

beforeEach(() => {
  vi.stubEnv("APE_BASE_URL", "https://ape.example");
  vi.stubEnv("APE_ORG_KEY", "ape_live_test");
  vi.stubEnv("APE_CONVERSATION_TOKEN_KEY", TOKEN_KEY_HEX);
  upsertAnswerFeedback.mockReset();
  upsertAnswerFeedback.mockResolvedValue({ rating: "up" });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("answer feedback route", () => {
  it("upserts a rating for the owning conversation", async () => {
    const token = sealConversationToken(
      Buffer.from(TOKEN_KEY_HEX, "hex"),
      "topic_income_tax",
      REFERENCE_ID,
    );
    const response = await POST(
      new NextRequest(
        `http://localhost:3011/api/conversation-turns/${OPERATION_ID}/feedback`,
        {
          method: "POST",
          body: JSON.stringify({ continuationToken: token, rating: "up" }),
        },
      ),
      { params: Promise.resolve({ operationId: OPERATION_ID }) },
    );

    expect(response.status).toBe(200);
    expect(upsertAnswerFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        operationId: OPERATION_ID,
        rating: "up",
      }),
    );
  });

  it("rejects a tampered token as forbidden", async () => {
    upsertAnswerFeedback.mockRejectedValue(
      new ConversationFeedbackError("This answer is not available.", "forbidden"),
    );
    const response = await POST(
      new NextRequest(
        `http://localhost:3011/api/conversation-turns/${OPERATION_ID}/feedback`,
        {
          method: "POST",
          body: JSON.stringify({ continuationToken: "bad", rating: "down" }),
        },
      ),
      { params: Promise.resolve({ operationId: OPERATION_ID }) },
    );

    expect(response.status).toBe(403);
  });

  it("removes a rating when rating is null", async () => {
    upsertAnswerFeedback.mockResolvedValue({ rating: null });
    const token = sealConversationToken(
      Buffer.from(TOKEN_KEY_HEX, "hex"),
      "topic_income_tax",
      REFERENCE_ID,
    );
    const response = await POST(
      new NextRequest(
        `http://localhost:3011/api/conversation-turns/${OPERATION_ID}/feedback`,
        {
          method: "POST",
          body: JSON.stringify({ continuationToken: token, rating: null }),
        },
      ),
      { params: Promise.resolve({ operationId: OPERATION_ID }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ rating: null });
  });
});
