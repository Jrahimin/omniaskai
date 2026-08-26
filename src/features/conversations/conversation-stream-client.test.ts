import { describe, expect, it, vi } from "vitest";

import { encodeSseEvent } from "./conversation-sse";
import { readConversationTurnStream } from "./conversation-stream-client";

function responseFrom(events: string[]): Response {
  return new Response(events.join(""), {
    headers: { "Content-Type": "text/event-stream" },
  });
}

function handlers() {
  return {
    onConversation: vi.fn(),
    onToken: vi.fn(),
    onFinal: vi.fn(),
    onError: vi.fn(),
  };
}

describe("readConversationTurnStream", () => {
  it("marks an explicit error before conversation creation as retryable", async () => {
    const callbacks = handlers();

    await readConversationTurnStream(
      responseFrom([encodeSseEvent("error", {})]),
      callbacks,
    );

    expect(callbacks.onError).toHaveBeenCalledOnce();
    expect(callbacks.onError).toHaveBeenCalledWith(true);
  });

  it("marks an error after a continuation token as non-retryable", async () => {
    const callbacks = handlers();

    await readConversationTurnStream(
      responseFrom([
        encodeSseEvent("conversation", { continuationToken: "sealed" }),
        encodeSseEvent("error", {}),
      ]),
      callbacks,
    );

    expect(callbacks.onConversation).toHaveBeenCalledWith("sealed");
    expect(callbacks.onError).toHaveBeenCalledWith(false);
  });

  it("treats an abruptly ended stream as ambiguous", async () => {
    const callbacks = handlers();

    await readConversationTurnStream(responseFrom([]), callbacks);

    expect(callbacks.onError).toHaveBeenCalledWith(false);
  });
});
