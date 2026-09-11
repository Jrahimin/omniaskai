export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

export function getAppOrigin(): string {
  const origin = process.env.APP_ORIGIN?.trim().replace(/\/$/, "");

  if (!origin) {
    throw new AuthConfigurationError("APP_ORIGIN is required.");
  }

  if (!origin.startsWith("http://") && !origin.startsWith("https://")) {
    throw new AuthConfigurationError("APP_ORIGIN must be an absolute http(s) origin.");
  }

  return origin;
}

export function getBetterAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new AuthConfigurationError(
      "BETTER_AUTH_SECRET must be at least 32 characters.",
    );
  }

  return secret;
}
