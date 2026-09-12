export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL is required for OmniAskAI persistence.",
    );
  }

  assertPostgresUrl(url, "DATABASE_URL");
  return url;
}

export function postgresDatabaseName(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\//, "")).trim();
  } catch {
    return "";
  }
}

type DatabaseUrlEnv = {
  DATABASE_URL?: string;
  TEST_DATABASE_URL?: string;
};

export function resolveIntegrationTestDatabaseUrl(
  env: DatabaseUrlEnv = process.env as DatabaseUrlEnv,
): string {
  const testUrl = env.TEST_DATABASE_URL?.trim();

  if (!testUrl) {
    throw new DatabaseConfigurationError(
      "TEST_DATABASE_URL is required for integration tests. Do not use DATABASE_URL.",
    );
  }

  assertPostgresUrl(testUrl, "TEST_DATABASE_URL");

  const testName = postgresDatabaseName(testUrl);

  if (!testName.endsWith("_test")) {
    throw new DatabaseConfigurationError(
      "TEST_DATABASE_URL must target an isolated database whose name ends with _test.",
    );
  }

  const appUrl = env.DATABASE_URL?.trim();

  if (appUrl) {
    try {
      assertPostgresUrl(appUrl, "DATABASE_URL");
    } catch {
      return testUrl;
    }

    const appName = postgresDatabaseName(appUrl);

    if (!appName.endsWith("_test") && sameDatabaseTarget(appUrl, testUrl)) {
      throw new DatabaseConfigurationError(
        "TEST_DATABASE_URL must not point at the application DATABASE_URL.",
      );
    }
  }

  return testUrl;
}

export function assertIsolatedTestDatabaseUrl(url: string): void {
  assertPostgresUrl(url, "DATABASE_URL");
  const name = postgresDatabaseName(url);

  if (!name.endsWith("_test")) {
    throw new DatabaseConfigurationError(
      "Refusing to migrate or truncate a database whose name does not end with _test.",
    );
  }
}

function assertPostgresUrl(url: string, name: string): void {
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    throw new DatabaseConfigurationError(
      `${name} must be a postgres:// or postgresql:// connection string.`,
    );
  }
}

function sameDatabaseTarget(left: string, right: string): boolean {
  try {
    const a = new URL(left);
    const b = new URL(right);
    return (
      a.hostname === b.hostname &&
      (a.port || "5432") === (b.port || "5432") &&
      postgresDatabaseName(left) === postgresDatabaseName(right)
    );
  } catch {
    return left === right;
  }
}

export function getDatabasePoolMax(): number {
  const raw = process.env.DATABASE_POOL_MAX?.trim();

  if (!raw) {
    return 10;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
    throw new DatabaseConfigurationError(
      "DATABASE_POOL_MAX must be an integer between 1 and 50.",
    );
  }

  return parsed;
}
