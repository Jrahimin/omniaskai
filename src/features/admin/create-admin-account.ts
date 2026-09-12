import { getAuth } from "@/lib/auth/auth.server";

export class AdminBootstrapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminBootstrapError";
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAdminAccount(input: {
  email: string;
  password: string;
}): Promise<{ userId: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!EMAIL_PATTERN.test(email)) {
    throw new AdminBootstrapError("A valid email address is required.");
  }

  if (password.length < 8 || password.length > 128) {
    throw new AdminBootstrapError("Password must be between 8 and 128 characters.");
  }

  const auth = getAuth();
  const context = await auth.$context;
  const existing = await context.internalAdapter.findUserByEmail(email);

  if (existing) {
    throw new AdminBootstrapError("An account with that email already exists.");
  }

  const user = await context.internalAdapter.createUser(
    {
      email,
      name: email.split("@")[0] ?? "Admin",
      emailVerified: true,
      role: "admin",
    },
    { method: "admin" },
  );

  await context.internalAdapter.createAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await context.password.hash(password),
  });

  return { userId: user.id };
}
