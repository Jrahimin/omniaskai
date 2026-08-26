import { describe, expect, it } from "vitest";

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

  it("allows same-origin and missing Origin, and rejects a foreign Origin", () => {
    const url = "http://localhost:3011/api/topics/income-tax/conversation-turns";

    expect(
      isSameOriginRequest(
        new Request(url, { headers: { origin: "http://localhost:3011" } }),
      ),
    ).toBe(true);
    expect(isSameOriginRequest(new Request(url))).toBe(true);
    expect(
      isSameOriginRequest(
        new Request(url, { headers: { origin: "https://evil.example" } }),
      ),
    ).toBe(false);
  });
});
