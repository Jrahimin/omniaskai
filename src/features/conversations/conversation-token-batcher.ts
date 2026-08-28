const FALLBACK_FLUSH_MS = 40;

export function createTokenDeltaBatcher(emit: (delta: string) => void) {
  let buffer = "";
  let cancel: (() => void) | undefined;

  function runFlush() {
    cancel = undefined;

    if (!buffer) {
      return;
    }

    const delta = buffer;
    buffer = "";
    emit(delta);
  }

  return {
    push(delta: string) {
      if (!delta) {
        return;
      }

      buffer += delta;

      if (cancel) {
        return;
      }

      if (typeof requestAnimationFrame === "function") {
        const id = requestAnimationFrame(runFlush);
        cancel = () => cancelAnimationFrame(id);
        return;
      }

      const id = setTimeout(runFlush, FALLBACK_FLUSH_MS);
      cancel = () => clearTimeout(id);
    },
    flush() {
      cancel?.();
      runFlush();
    },
  };
}
