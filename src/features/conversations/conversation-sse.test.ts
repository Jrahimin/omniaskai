import { describe, expect, it } from "vitest";

import {
  IncrementalSseParser,
  parseSseBlock,
  readDecodedSse,
} from "./conversation-sse";

describe("IncrementalSseParser", () => {
  it("reassembles frames split across chunks, including CRLF", () => {
    const parser = new IncrementalSseParser();

    expect(parser.push('event: token\ndata: {"delta":"Hel')).toEqual([]);
    expect(parser.push('lo"}\r\n\r\n')).toEqual([
      { event: "token", data: { delta: "Hello" } },
    ]);
  });

  it("reads event type from JSON when the SSE event field is absent", () => {
    const parser = new IncrementalSseParser();

    expect(
      parser.push('data: {"event":"done","grounded":true}\n\n'),
    ).toEqual([{ event: "done", data: { event: "done", grounded: true } }]);
  });

  it("ignores comment lines", () => {
    const parser = new IncrementalSseParser();

    expect(parser.push(": keep-alive\n\n")).toEqual([]);
  });
});

describe("Bangla UTF-8 chunk fragmentation", () => {
  it("decodes a token split in the middle of a UTF-8 sequence", async () => {
    const json = JSON.stringify({ event: "token", delta: "বাংলা" });
    const frame = `data: ${json}\n\n`;
    const bytes = new TextEncoder().encode(frame);
    const splitAt = findMidCodeUnitIndex(bytes);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, splitAt));
        controller.enqueue(bytes.slice(splitAt));
        controller.close();
      },
    });
    const frames: { event: string; data: unknown }[] = [];

    await readDecodedSse(stream, (frameEvent) => {
      frames.push(frameEvent);
    });

    expect(frames).toEqual([
      { event: "token", data: { event: "token", delta: "বাংলা" } },
    ]);
  });
});

describe("parseSseBlock", () => {
  it("joins multiline data fields", () => {
    expect(
      parseSseBlock('event: token\ndata: {"delta":"a"}\n'),
    ).toEqual({ event: "token", data: { delta: "a" } });
  });
});

function findMidCodeUnitIndex(bytes: Uint8Array): number {
  for (let index = 1; index < bytes.length; index += 1) {
    const unit = bytes[index];

    if (unit !== undefined && (unit & 0b1100_0000) === 0b1000_0000) {
      return index;
    }
  }

  return Math.floor(bytes.length / 2);
}
