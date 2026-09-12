import { stdin, stderr } from "node:process";

import { createAdminAccount } from "@/features/admin/create-admin-account";
import { readHiddenTerminalPassword } from "@/features/admin/read-hidden-terminal-password";
import { closeDatabasePool } from "@/lib/db/database";
import { loadLocalEnvFiles } from "@/lib/db/run-migrations";

async function main(): Promise<void> {
  loadLocalEnvFiles();

  const email = readFlag("--email");
  let password = readFlag("--password");

  if (!email) {
    throw new Error("Usage: npm run admin:create -- --email <email> [--password <password>]");
  }

  if (!password) {
    password = await readHiddenTerminalPassword({
      stdin,
      stderr,
      label: "Password: ",
    });
  }

  const created = await createAdminAccount({ email, password });
  console.log(`Created admin account ${email} (${created.userId}).`);
}

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  return value?.trim() || undefined;
}

void main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabasePool();
  });
