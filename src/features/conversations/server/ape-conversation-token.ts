import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const TOKEN_VERSION = 1;
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

type TokenPayload = {
  v: number;
  topicId: string;
  conversationId: string;
  exp: number;
};

export function sealConversationToken(
  key: Buffer,
  topicId: string,
  conversationId: string,
  now = Date.now(),
): string {
  const payload: TokenPayload = {
    v: TOKEN_VERSION,
    topicId,
    conversationId,
    exp: now + TOKEN_TTL_MS,
  };
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function openConversationToken(
  key: Buffer,
  token: string,
  expectedTopicId: string,
  now = Date.now(),
): string | undefined {
  try {
    const bytes = Buffer.from(token, "base64url");

    if (bytes.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
      return undefined;
    }

    const iv = bytes.subarray(0, IV_LENGTH);
    const tag = bytes.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = bytes.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    const payload = JSON.parse(json) as TokenPayload;

    if (
      payload.v !== TOKEN_VERSION ||
      payload.topicId !== expectedTopicId ||
      typeof payload.conversationId !== "string" ||
      payload.conversationId.length === 0 ||
      typeof payload.exp !== "number" ||
      payload.exp <= now
    ) {
      return undefined;
    }

    return payload.conversationId;
  } catch {
    return undefined;
  }
}
