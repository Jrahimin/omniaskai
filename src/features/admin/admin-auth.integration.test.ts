import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createAdminAccount } from "@/features/admin/create-admin-account";
import { getAuth } from "@/lib/auth/auth.server";
import { getDatabase } from "@/lib/db/database";
import { authSession, authUser } from "@/lib/db/schema";
import {
  closePostgresForIntegrationTests,
  preparePostgresForIntegrationTests,
  resetProductTables,
} from "@/lib/db/postgres-test-database";

const ORIGIN = "http://localhost:3011";

beforeAll(async () => {
  process.env.APP_ORIGIN = ORIGIN;
  process.env.BETTER_AUTH_SECRET =
    process.env.BETTER_AUTH_SECRET ?? "a".repeat(64);
  process.env.MEDIA_STORAGE_DIR =
    process.env.MEDIA_STORAGE_DIR ?? "./storage/media-test";
  await preparePostgresForIntegrationTests();
});

afterAll(async () => {
  await closePostgresForIntegrationTests();
});

describe("admin auth", () => {
  it("creates an admin account once, signs in, and refuses signup", async () => {
    await resetProductTables();
    await createAdminAccount({
      email: "ops@example.com",
      password: "correct-horse",
    });

    await expect(
      createAdminAccount({
        email: "ops@example.com",
        password: "correct-horse",
      }),
    ).rejects.toThrow("already exists");

    const auth = getAuth();
    const signIn = await auth.api.signInEmail({
      body: { email: "ops@example.com", password: "correct-horse" },
      asResponse: true,
    });

    expect(signIn.status).toBe(200);
    const cookie = signIn.headers.get("set-cookie");
    expect(cookie).toMatch(/HttpOnly/i);

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookie ?? "" }),
    });
    expect(session?.user.role).toBe("admin");

    const signup = await auth.handler(
      new Request(`${ORIGIN}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "other@example.com",
          password: "correct-horse",
          name: "Other",
        }),
      }),
    );
    expect(signup.status).toBeGreaterThanOrEqual(400);

    const wrong = await auth.api.signInEmail({
      body: { email: "ops@example.com", password: "wrong-password" },
      asResponse: true,
    });
    expect(wrong.status).toBeGreaterThanOrEqual(400);
    const wrongBody = await wrong.text();
    expect(wrongBody.toLowerCase()).not.toContain("ops@example.com");

    const unusedPaths = [
      "/forget-password",
      "/change-password",
      "/admin/list-users",
      "/admin/create-user",
    ];

    for (const path of unusedPaths) {
      const response = await auth.handler(
        new Request(`${ORIGIN}/api/auth${path}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: cookie ?? "",
          },
          body: "{}",
        }),
      );
      expect(response.status).toBeGreaterThanOrEqual(400);
    }

    const signedOut = await auth.api.signOut({
      headers: new Headers({ cookie: cookie ?? "" }),
      asResponse: true,
    });
    expect(signedOut.status).toBe(200);

    const afterSignOut = await auth.api.getSession({
      headers: new Headers({ cookie: cookie ?? "" }),
    });
    expect(afterSignOut).toBeNull();
  });

  it("refuses a non-admin session for operator access", async () => {
    await resetProductTables();
    const auth = getAuth();
    const context = await auth.$context;
    const user = await context.internalAdapter.createUser(
      {
        email: "member@example.com",
        name: "Member",
        emailVerified: true,
        role: "user",
      },
      { method: "admin" },
    );
    await context.internalAdapter.createAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: await context.password.hash("correct-horse"),
    });

    const signIn = await auth.api.signInEmail({
      body: { email: "member@example.com", password: "correct-horse" },
      asResponse: true,
    });
    expect(signIn.status).toBe(200);
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: signIn.headers.get("set-cookie") ?? "" }),
    });
    expect(session?.user.role).not.toBe("admin");
  });

  it("expires, revokes, and throttles operator sessions over HTTP", async () => {
    await resetProductTables();
    await createAdminAccount({
      email: "ops@example.com",
      password: "correct-horse",
    });
    const auth = getAuth();
    const signIn = await auth.api.signInEmail({
      body: { email: "ops@example.com", password: "correct-horse" },
      asResponse: true,
    });
    const cookie = signIn.headers.get("set-cookie") ?? "";

    await getDatabase()
      .update(authSession)
      .set({ expiresAt: new Date(Date.now() - 60_000) });
    const expired = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(expired).toBeNull();

    const fresh = await auth.api.signInEmail({
      body: { email: "ops@example.com", password: "correct-horse" },
      asResponse: true,
    });
    const freshCookie = fresh.headers.get("set-cookie") ?? "";
    await getDatabase().delete(authSession);
    const revoked = await auth.api.getSession({
      headers: new Headers({ cookie: freshCookie }),
    });
    expect(revoked).toBeNull();

    let throttled = false;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await auth.handler(
        new Request(`${ORIGIN}/api/auth/sign-in/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "ops@example.com",
            password: "wrong-password",
          }),
        }),
      );
      if (response.status === 429) {
        throttled = true;
        break;
      }
    }
    expect(throttled).toBe(true);
  });

  it("refuses operator access after the stored admin role is revoked", async () => {
    await resetProductTables();
    await createAdminAccount({
      email: "ops@example.com",
      password: "correct-horse",
    });
    const auth = getAuth();
    const signIn = await auth.api.signInEmail({
      body: { email: "ops@example.com", password: "correct-horse" },
      asResponse: true,
    });
    const cookie = signIn.headers.get("set-cookie") ?? "";
    const before = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(before?.user.role).toBe("admin");

    await getDatabase()
      .update(authUser)
      .set({ role: "user" })
      .where(eq(authUser.id, before!.user.id));

    const after = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(after?.user.role).not.toBe("admin");
  });
});
