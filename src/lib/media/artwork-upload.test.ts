import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  encodeUploadedArtwork,
  isSafeStorageKey,
  ArtworkUploadError,
} from "./artwork-upload";

describe("artwork upload", () => {
  it("rejects unsafe storage keys", () => {
    expect(isSafeStorageKey("../secret.webp")).toBe(false);
    expect(isSafeStorageKey("aa0e8400-e29b-41d4-a716-446655440088.webp")).toBe(true);
  });

  it("rejects invalid bytes", async () => {
    await expect(encodeUploadedArtwork(Buffer.from("not-an-image"))).rejects.toBeInstanceOf(
      ArtworkUploadError,
    );
  });

  it("rejects oversized files before decode", async () => {
    const huge = Buffer.alloc(5 * 1024 * 1024 + 1);
    await expect(encodeUploadedArtwork(huge)).rejects.toBeInstanceOf(ArtworkUploadError);
  });

  it("rejects gif input", async () => {
    const gif = await sharp({
      create: { width: 8, height: 8, channels: 3, background: "#334" },
    })
      .gif()
      .toBuffer();

    await expect(encodeUploadedArtwork(gif)).rejects.toBeInstanceOf(ArtworkUploadError);
  });

  it("re-encodes a jpeg as webp without animation", async () => {
    const jpeg = await sharp({
      create: { width: 8, height: 8, channels: 3, background: "#334" },
    })
      .jpeg()
      .toBuffer();

    const encoded = await encodeUploadedArtwork(jpeg);
    expect(encoded.width).toBe(8);
    expect(encoded.height).toBe(8);
    const metadata = await sharp(encoded.buffer).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.pages ?? 1).toBe(1);
  });
});
