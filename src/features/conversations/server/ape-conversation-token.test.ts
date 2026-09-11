import { createCipheriv, randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  openConversationToken,
  sealConversationToken,
} from "./ape-conversation-token";

const key = randomBytes(32);
const referenceId = "990e8400-e29b-41d4-a716-446655440099";

function sealLegacyV1(
  topicId: string,
  apeConversationId: string,
  now = Date.now(),
): string {
  const payload = JSON.stringify({
    v: 1,
    topicId,
    conversationId: apeConversationId,
    exp: now + 12 * 60 * 60 * 1000,
  });
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(payload, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

describe("conversation continuation token", () => {
  it("round-trips a topic-bound conversation reference id", () => {
    const token = sealConversationToken(key, "topic_income_tax", referenceId);

    expect(openConversationToken(key, token, "topic_income_tax")).toEqual({
      conversationReferenceId: referenceId,
      topicId: "topic_income_tax",
    });
    expect(token).not.toContain(referenceId);
  });

  it("rejects a legacy v1 token that still carries an APE conversation id", () => {
    const token = sealLegacyV1(
      "topic_income_tax",
      "880e8400-e29b-41d4-a716-446655440003",
    );

    expect(
      openConversationToken(key, token, "topic_income_tax"),
    ).toBeUndefined();
  });

  it("rejects a token for a different topic", () => {
    const token = sealConversationToken(key, "topic_income_tax", referenceId);

    expect(
      openConversationToken(key, token, "topic_literature"),
    ).toBeUndefined();
  });

  it("rejects tampered bytes", () => {
    const token = sealConversationToken(key, "topic_income_tax", referenceId);
    const bytes = Buffer.from(token, "base64url");
    bytes[bytes.length - 1] = bytes[bytes.length - 1] ^ 1;

    expect(
      openConversationToken(key, bytes.toString("base64url"), "topic_income_tax"),
    ).toBeUndefined();
  });

  it("rejects an expired token", () => {
    const token = sealConversationToken(
      key,
      "topic_income_tax",
      referenceId,
      Date.now() - 13 * 60 * 60 * 1000,
    );

    expect(
      openConversationToken(key, token, "topic_income_tax"),
    ).toBeUndefined();
  });
});
