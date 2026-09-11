import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUnauthorizedError } from "@/features/admin/require-admin-session";

const { requireAdminSession } = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/features/admin/require-admin-session", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/admin/require-admin-session")>();

  return {
    ...actual,
    requireAdminSession,
  };
});

import { POST } from "./route";

beforeEach(() => {
  requireAdminSession.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin artwork upload", () => {
  it("rejects unauthenticated uploads", async () => {
    requireAdminSession.mockRejectedValue(new AdminUnauthorizedError());
    const response = await POST(
      new Request("http://localhost:3011/api/admin/artwork", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Sign in to continue." });
  });
});
