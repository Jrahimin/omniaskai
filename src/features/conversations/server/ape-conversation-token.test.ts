import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  openConversationToken,
  sealConversationToken,
} from "./ape-conversation-token";

const key = randomBytes(32);

describe("conversation continuation token", () => {
  it("round-trips a topic-bound APE conversation id", () => {
    const token = sealConversationToken(
      key,
      "topic_income_tax",
      "880e8400-e29b-41d4-a716-446655440003",
    );

    expect(
      openConversationToken(key, token, "topic_income_tax"),
    ).toBe("880e8400-e29b-41d4-a716-446655440003");
  });

  it("rejects a token for a different topic", () => {
    const token = sealConversationToken(
      key,
      "topic_income_tax",
      "880e8400-e29b-41d4-a716-446655440003",
    );

    expect(openConversationToken(key, token, "topic_literature")).toBeUndefined();
  });

  it("rejects tampered bytes", () => {
    const token = sealConversationToken(
      key,
      "topic_income_tax",
      "880e8400-e29b-41d4-a716-446655440003",
    );
    const bytes = Buffer.from(token, "base64url");
    bytes[bytes.length - 1] = bytes[bytes.length - 1] ^ 1;

    expect(
      openConversationToken(
        key,
        bytes.toString("base64url"),
        "topic_income_tax",
      ),
    ).toBeUndefined();
  });

  it("rejects an expired token", () => {
    const token = sealConversationToken(
      key,
      "topic_income_tax",
      "880e8400-e29b-41d4-a716-446655440003",
      Date.now() - 13 * 60 * 60 * 1000,
    );

    expect(
      openConversationToken(key, token, "topic_income_tax"),
    ).toBeUndefined();
  });
});
