import { describe, expect, it, vi } from "vitest";

import {
  isSameOriginRequest,
  readJsonBodyWithinLimit,
  validateConversationTurnRequest,
} from "./stream-conversation-turn.server";

describe("conversation turn route boundary", () => {
  it("accepts a question and optional continuation token", () => {
    expect(
      validateConversationTurnRequest({
        question: " What is taxable? ",
        continuationToken: "sealed",
      }),
    ).toEqual({
      question: " What is taxable? ",
      continuationToken: "sealed",
    });
  });

  it("rejects malformed and oversized continuation tokens", () => {
    expect(
      validateConversationTurnRequest({
        question: "Question",
        continuationToken: 123,
      }),
    ).toBeUndefined();
    expect(
      validateConversationTurnRequest({
        question: "Question",
        continuationToken: "",
      }),
    ).toBeUndefined();
    expect(
      validateConversationTurnRequest({
        question: "Question",
        continuationToken: "not base64url",
      }),
    ).toBeUndefined();
    expect(
      validateConversationTurnRequest({
        question: "Question",
        continuationToken: "a".repeat(1025),
      }),
    ).toBeUndefined();
  });

  it("rejects a JSON body beyond the byte limit before parsing", async () => {
    const request = new Request("http://localhost:3011/api", {
      method: "POST",
      body: JSON.stringify({ question: "x".repeat(64) }),
    });

    await expect(readJsonBodyWithinLimit(request, 24)).resolves.toEqual({
      ok: false,
    });
  });

  it("rejects empty or oversized questions", () => {
    expect(validateConversationTurnRequest({ question: "  " })).toBeUndefined();
    expect(
      validateConversationTurnRequest({ question: "x".repeat(8001) }),
    ).toBeUndefined();
  });

  it("uses the public app origin behind a reverse proxy", () => {
    vi.stubEnv("APP_ORIGIN", "https://omniaskai.com");

    try {
      const url = "http://127.0.0.1:3011/api/topics/income-tax/conversation-turns";

      expect(
        isSameOriginRequest(
          new Request(url, { headers: { origin: "https://omniaskai.com" } }),
        ),
      ).toBe(true);
      expect(isSameOriginRequest(new Request(url))).toBe(true);
      expect(
        isSameOriginRequest(
          new Request(url, { headers: { origin: "https://evil.example" } }),
        ),
      ).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
