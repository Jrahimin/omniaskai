import { describe, expect, it } from "vitest";

import { getAppOrigin, getBetterAuthSecret, AuthConfigurationError } from "./auth-env";

describe("auth environment", () => {
  it("requires an absolute origin", () => {
    const previous = process.env.APP_ORIGIN;
    delete process.env.APP_ORIGIN;
    expect(() => getAppOrigin()).toThrow(AuthConfigurationError);
    process.env.APP_ORIGIN = "localhost:3011";
    expect(() => getAppOrigin()).toThrow(AuthConfigurationError);
    process.env.APP_ORIGIN = "http://localhost:3011/";
    expect(getAppOrigin()).toBe("http://localhost:3011");
    process.env.APP_ORIGIN = previous;
  });

  it("requires a 32-character secret", () => {
    const previous = process.env.BETTER_AUTH_SECRET;
    process.env.BETTER_AUTH_SECRET = "short";
    expect(() => getBetterAuthSecret()).toThrow(AuthConfigurationError);
    process.env.BETTER_AUTH_SECRET = "a".repeat(32);
    expect(getBetterAuthSecret()).toHaveLength(32);
    process.env.BETTER_AUTH_SECRET = previous;
  });
});
