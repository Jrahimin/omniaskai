import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth/auth.server";

export class AdminUnauthorizedError extends Error {
  constructor(message = "Admin authentication is required.") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

export type AdminSession = {
  userId: string;
  email: string;
  role: "admin";
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.banned) {
    return null;
  }

  if (session.user.role !== "admin") {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    role: "admin",
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new AdminUnauthorizedError();
  }

  return session;
}

export async function requireAdminPageSession(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export function isAdminUnauthorizedError(
  error: unknown,
): error is AdminUnauthorizedError {
  return error instanceof AdminUnauthorizedError;
}
