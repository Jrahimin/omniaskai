import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

import {
  applyHiddenPasswordChunk,
  readHiddenTerminalPassword,
} from "./read-hidden-terminal-password";

describe("hidden terminal password", () => {
  it("accepts typing, paste, backspace, and submit without echoing characters", () => {
    expect(applyHiddenPasswordChunk("", "ab")).toEqual({ value: "ab", action: "continue" });
    expect(applyHiddenPasswordChunk("ab", "\u007f")).toEqual({ value: "a", action: "continue" });
    expect(applyHiddenPasswordChunk("", "secret-value\n")).toEqual({
      value: "secret-value",
      action: "submit",
    });
    expect(applyHiddenPasswordChunk("x", "\u0003")).toEqual({ value: "x", action: "cancel" });
  });

  it("does not echo input and restores raw mode after submit or cancel", async () => {
    async function run(chunk: string) {
      const stdin = Object.assign(new EventEmitter(), {
        isTTY: true,
        isRaw: false,
        setRawMode(mode: boolean) {
          this.isRaw = mode;
          return this;
        },
        setEncoding() {
          return this;
        },
        resume() {
          return this;
        },
        pause() {
          return this;
        },
      });
      const writes: string[] = [];
      const pending = readHiddenTerminalPassword({
        stdin,
        stderr: { write: (text) => writes.push(text) },
        label: "Password: ",
      });
      stdin.emit("data", chunk);
      return { pending, stdin, writes };
    }

    const submitted = await run("hunter2\n");
    await expect(submitted.pending).resolves.toBe("hunter2");
    expect(submitted.writes).toEqual(["Password: ", "\n"]);
    expect(submitted.stdin.isRaw).toBe(false);

    const cancelled = await run("\u0003");
    await expect(cancelled.pending).rejects.toThrow("Cancelled.");
    expect(cancelled.writes).toEqual(["Password: ", "\n"]);
    expect(cancelled.stdin.isRaw).toBe(false);
  });

  it("refuses a non-TTY stdin", async () => {
    await expect(
      readHiddenTerminalPassword({
        stdin: Object.assign(new EventEmitter(), { isTTY: false }),
        stderr: { write: vi.fn() },
        label: "Password: ",
      }),
    ).rejects.toThrow(/--password/);
  });
});
