import { afterEach, describe, expect, it, vi } from "vitest";

import { createApeConversation } from "./ape-api-client.server";
import type { ApeRuntimeConfig } from "./ape-config.server";

const config: ApeRuntimeConfig = {
  baseUrl: "https://ape.example",
  orgKey: "org-key",
  tokenKey: Buffer.alloc(32),
};

const PROJECT_ID = "660e8400-e29b-41d4-a716-446655440001";

describe("createApeConversation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("logs HTTP status and request/trace ids when create fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("{}", {
            status: 401,
            headers: {
              "X-Request-ID": "req-401",
              "X-Trace-ID": "trace-401",
            },
          }),
      ),
    );

    await expect(
      createApeConversation(config, PROJECT_ID, new AbortController().signal),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      "APE upstream request failed",
      expect.objectContaining({
        operation: "create_conversation",
        status: 401,
        requestId: "req-401",
        traceId: "trace-401",
      }),
    );
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("org-key");
  });

  it("logs a generic create failure when the upstream fetch throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    await expect(
      createApeConversation(config, PROJECT_ID, new AbortController().signal),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      "APE upstream request failed",
      expect.objectContaining({
        operation: "create_conversation",
        status: undefined,
        requestId: undefined,
        traceId: undefined,
      }),
    );
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("fetch failed");
  });
});
