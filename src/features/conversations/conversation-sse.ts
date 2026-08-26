export type SseFrame = {
  event: string;
  data: unknown;
};

export class IncrementalSseParser {
  private buffer = "";

  push(chunk: string): SseFrame[] {
    this.buffer += chunk;
    return this.consume(false);
  }

  flush(): SseFrame[] {
    return this.consume(true);
  }

  private consume(flush: boolean): SseFrame[] {
    const frames: SseFrame[] = [];

    while (true) {
      const lfIndex = this.buffer.indexOf("\n\n");
      const crlfIndex = this.buffer.indexOf("\r\n\r\n");

      if (lfIndex === -1 && crlfIndex === -1) {
        break;
      }

      const useCrlf =
        crlfIndex !== -1 && (lfIndex === -1 || crlfIndex < lfIndex);
      const separator = useCrlf ? "\r\n\r\n" : "\n\n";
      const index = useCrlf ? crlfIndex : lfIndex;
      const block = this.buffer.slice(0, index);
      this.buffer = this.buffer.slice(index + separator.length);
      const frame = parseSseBlock(block);

      if (frame) {
        frames.push(frame);
      }
    }

    if (flush && this.buffer.trim()) {
      const frame = parseSseBlock(this.buffer);
      this.buffer = "";

      if (frame) {
        frames.push(frame);
      }
    }

    return frames;
  }
}

export function parseSseBlock(block: string): SseFrame | undefined {
  const lines = block.split(/\r?\n/);
  let event = "";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  if (dataLines.length === 0) {
    return undefined;
  }

  let data: unknown;

  try {
    data = JSON.parse(dataLines.join("\n"));
  } catch {
    return undefined;
  }

  const named =
    event ||
    (typeof data === "object" &&
    data !== null &&
    "event" in data &&
    typeof data.event === "string"
      ? data.event
      : "");

  if (!named) {
    return undefined;
  }

  return { event: named, data };
}

export function encodeSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function readDecodedSse(
  body: ReadableStream<Uint8Array>,
  onFrame: (frame: SseFrame) => void | Promise<void>,
  signal?: AbortSignal,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const parser = new IncrementalSseParser();

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }

      const { done, value } = await reader.read();

      if (done) {
        const tail = decoder.decode();
        const frames = [
          ...parser.push(tail),
          ...parser.flush(),
        ];

        for (const frame of frames) {
          await onFrame(frame);
        }

        return;
      }

      const text = decoder.decode(value, { stream: true });

      for (const frame of parser.push(text)) {
        await onFrame(frame);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
