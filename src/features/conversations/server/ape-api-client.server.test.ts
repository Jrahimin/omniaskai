import { afterEach, describe, expect, it, vi } from "vitest";

import {
  APE_REQUEST_TIMEOUT_MS,
  classifyApeProjectForPublish,
  createApeConversation,
  getApeProject,
  parseApeProjectRecord,
  streamApeMessage,
} from "./ape-api-client.server";
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

describe("APE project records", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const projectJson = {
    id: PROJECT_ID,
    name: "Income Tax",
    description: null,
    is_active: true,
    deleted_at: null,
  };

  it("parses an active project and classifies it as valid", () => {
    const project = parseApeProjectRecord(projectJson);

    expect(project).toEqual({
      id: PROJECT_ID,
      name: "Income Tax",
      description: null,
      isActive: true,
      deletedAt: null,
    });
    expect(
      classifyApeProjectForPublish({ status: "ok", project: project! }),
    ).toBe("valid");
  });

  it("classifies inactive, deleted, missing, and inaccessible projects", () => {
    const project = parseApeProjectRecord(projectJson)!;

    expect(
      classifyApeProjectForPublish({
        status: "ok",
        project: { ...project, isActive: false },
      }),
    ).toBe("inactive");
    expect(
      classifyApeProjectForPublish({
        status: "ok",
        project: { ...project, deletedAt: "2026-01-01T00:00:00Z" },
      }),
    ).toBe("deleted");
    expect(classifyApeProjectForPublish({ status: "missing" })).toBe("missing");
    expect(classifyApeProjectForPublish({ status: "inaccessible" })).toBe(
      "inaccessible",
    );
    expect(classifyApeProjectForPublish({ status: "unreachable" })).toBe(
      "inaccessible",
    );
  });

  it("sends the shared request deadline on project reads", async () => {
    const fetchMock = vi.fn(
      async (_url: string, init?: { signal?: AbortSignal }) => {
        expect(init?.signal).toBeInstanceOf(AbortSignal);
        expect(init?.signal?.aborted).toBe(false);
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: PROJECT_ID,
              name: "Income Tax",
              description: null,
              is_active: true,
              deleted_at: null,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getApeProject(config, PROJECT_ID);

    expect(result.status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("streamApeMessage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses the same 120s deadline as admin reads and conversation creates", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const controller = new AbortController();
    const conversationId = "880e8400-e29b-41d4-a716-446655440003";
    let streamSignal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: { signal?: AbortSignal }) => {
        if (url.endsWith("/messages/stream")) {
          streamSignal = init?.signal;
          return new Response("", { status: 200 });
        }

        if (url.endsWith("/conversations")) {
          return new Response(
            JSON.stringify({ success: true, data: { id: conversationId } }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: PROJECT_ID,
              name: "Income Tax",
              description: null,
              is_active: true,
              deleted_at: null,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    await getApeProject(config, PROJECT_ID);
    await createApeConversation(config, PROJECT_ID, controller.signal);
    await streamApeMessage(
      config,
      PROJECT_ID,
      conversationId,
      "What income sources are taxable?",
      controller.signal,
    );

    expect(APE_REQUEST_TIMEOUT_MS).toBe(120_000);
    expect(timeout.mock.calls.map(([ms]) => ms)).toEqual([
      120_000,
      120_000,
      120_000,
    ]);
    controller.abort();
    expect(streamSignal?.aborted).toBe(true);
  });
});
