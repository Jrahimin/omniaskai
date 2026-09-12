import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabasePoolMax, getDatabaseUrl } from "./database-env";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema, Pool>>;

const globalForDatabase = globalThis as {
  omniaskaiPool?: Pool;
  omniaskaiDb?: Database;
};

export function getDatabase(): Database {
  if (!globalForDatabase.omniaskaiDb) {
    const pool = getDatabasePool();
    globalForDatabase.omniaskaiDb = drizzle(pool, { schema });
  }

  return globalForDatabase.omniaskaiDb;
}

export function getDatabasePool(): Pool {
  if (!globalForDatabase.omniaskaiPool) {
    globalForDatabase.omniaskaiPool = new Pool({
      connectionString: getDatabaseUrl(),
      max: getDatabasePoolMax(),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return globalForDatabase.omniaskaiPool;
}

export async function closeDatabasePool(): Promise<void> {
  const pool = globalForDatabase.omniaskaiPool;

  if (!pool) {
    return;
  }

  await pool.end();
  globalForDatabase.omniaskaiPool = undefined;
  globalForDatabase.omniaskaiDb = undefined;
}
