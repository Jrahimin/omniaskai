export type HiddenPasswordAction = "continue" | "submit" | "cancel";

export function applyHiddenPasswordChunk(
  current: string,
  chunk: string,
): { value: string; action: HiddenPasswordAction } {
  let value = current;

  for (const char of chunk) {
    if (char === "\n" || char === "\r" || char === "\u0004") {
      return { value, action: "submit" };
    }

    if (char === "\u0003") {
      return { value, action: "cancel" };
    }

    if (char === "\u007f" || char === "\b") {
      value = value.slice(0, -1);
      continue;
    }

    if (char === "\u0015") {
      value = "";
      continue;
    }

    if (char < " " && char !== "\t") {
      continue;
    }

    value += char;
  }

  return { value, action: "continue" };
}

type HiddenPasswordStdin = {
  isTTY?: boolean;
  isRaw?: boolean;
  setRawMode?: (mode: boolean) => unknown;
  setEncoding?: (encoding: BufferEncoding) => unknown;
  resume?: () => unknown;
  pause?: () => unknown;
  on: (event: "data", listener: (chunk: string | Buffer) => void) => unknown;
  off: (event: "data", listener: (chunk: string | Buffer) => void) => unknown;
};

export async function readHiddenTerminalPassword(input: {
  stdin: HiddenPasswordStdin;
  stderr: { write: (chunk: string) => unknown };
  label: string;
}): Promise<string> {
  const { stdin, stderr, label } = input;

  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Password must be provided with --password when input is not a terminal.");
  }

  const wasRaw = Boolean(stdin.isRaw);
  stderr.write(label);
  stdin.setEncoding?.("utf8");
  stdin.setRawMode(true);
  stdin.resume?.();

  return new Promise((resolve, reject) => {
    let value = "";

    const restore = () => {
      stdin.off("data", onData);

      try {
        stdin.setRawMode?.(wasRaw);
      } catch {
        stdin.setRawMode?.(false);
      }

      stdin.pause?.();
    };

    const onData = (chunk: string | Buffer) => {
      const text = typeof chunk === "string" ? chunk : chunk.toString("utf8");
      const next = applyHiddenPasswordChunk(value, text);
      value = next.value;

      if (next.action === "continue") {
        return;
      }

      restore();
      stderr.write("\n");

      if (next.action === "cancel") {
        reject(new Error("Cancelled."));
        return;
      }

      resolve(value);
    };

    stdin.on("data", onData);
  });
}
