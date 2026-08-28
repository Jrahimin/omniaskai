import { afterEach, describe, expect, it, vi } from "vitest";

import { createTokenDeltaBatcher } from "./conversation-token-batcher";

describe("createTokenDeltaBatcher", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("flushes concatenated deltas once on the fallback interval", () => {
    vi.useFakeTimers();
    const emit = vi.fn();
    const batcher = createTokenDeltaBatcher(emit);

    batcher.push("A ");
    batcher.push("resident");

    expect(emit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(40);

    expect(emit).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith("A resident");
  });

  it("flushes immediately when the stream settles", () => {
    const emit = vi.fn();
    const batcher = createTokenDeltaBatcher(emit);

    batcher.push("Hello");
    batcher.flush();

    expect(emit).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith("Hello");
  });
});
