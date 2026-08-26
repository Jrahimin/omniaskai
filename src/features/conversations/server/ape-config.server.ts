import "server-only";

export type ApeRuntimeConfig = {
  baseUrl: string;
  orgKey: string;
  tokenKey: Buffer;
};

export function getApeRuntimeConfig(): ApeRuntimeConfig | undefined {
  const baseUrl = process.env.APE_BASE_URL?.trim().replace(/\/$/, "");
  const orgKey = process.env.APE_ORG_KEY?.trim();
  const tokenKey = parseTokenKey(process.env.APE_CONVERSATION_TOKEN_KEY);

  if (!baseUrl || !orgKey || !tokenKey) {
    return undefined;
  }

  return { baseUrl, orgKey, tokenKey };
}

function parseTokenKey(raw: string | undefined): Buffer | undefined {
  const value = raw?.trim();

  if (!value) {
    return undefined;
  }

  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    return Buffer.from(value, "hex");
  }

  const fromBase64 = Buffer.from(value, "base64");

  if (fromBase64.length === 32) {
    return fromBase64;
  }

  return undefined;
}
