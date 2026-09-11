import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DatabaseConfigurationError,
  getDatabasePoolMax,
  getDatabaseUrl,
  resolveIntegrationTestDatabaseUrl,
} from "./database-env";

describe("database environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires a postgres connection string", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(() => getDatabaseUrl()).toThrow(DatabaseConfigurationError);

    vi.stubEnv("DATABASE_URL", "mysql://localhost/omniaskai");
    expect(() => getDatabaseUrl()).toThrow(DatabaseConfigurationError);
  });

  it("accepts a postgres URL and a bounded pool size", () => {
    vi.stubEnv("DATABASE_URL", "postgres://omniaskai:omniaskai@localhost:5432/omniaskai");
    expect(getDatabaseUrl()).toContain("postgres://");

    vi.stubEnv("DATABASE_POOL_MAX", "");
    expect(getDatabasePoolMax()).toBe(10);

    vi.stubEnv("DATABASE_POOL_MAX", "8");
    expect(getDatabasePoolMax()).toBe(8);
  });

  it("requires an isolated TEST_DATABASE_URL and rejects the application database", () => {
    const appUrl = "postgres://omniaskai:omniaskai@localhost:5432/omniaskai";
    const testUrl = "postgres://omniaskai:omniaskai@localhost:5432/omniaskai_test";

    expect(() =>
      resolveIntegrationTestDatabaseUrl({
        DATABASE_URL: appUrl,
      }),
    ).toThrow(DatabaseConfigurationError);

    expect(() =>
      resolveIntegrationTestDatabaseUrl({
        DATABASE_URL: appUrl,
        TEST_DATABASE_URL: appUrl,
      }),
    ).toThrow(/_test/);

    expect(
      resolveIntegrationTestDatabaseUrl({
        DATABASE_URL: appUrl,
        TEST_DATABASE_URL: testUrl,
      }),
    ).toBe(testUrl);

    expect(
      resolveIntegrationTestDatabaseUrl({
        DATABASE_URL: testUrl,
        TEST_DATABASE_URL: testUrl,
      }),
    ).toBe(testUrl);
  });
});
