import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

import { getDatabase } from "@/lib/db/database";
import { mediaAsset } from "@/lib/db/schema";
import { newId } from "@/features/topics/server/topic-catalog-read";

import { getMediaStorageDir } from "./media-storage-env";

export const MAX_ARTWORK_BYTES = 5 * 1024 * 1024;
export const MAX_ARTWORK_PIXELS = 20_000_000;
const ALLOWED_INPUT_FORMATS = new Set(["jpeg", "png", "webp"]);

export class ArtworkUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArtworkUploadError";
  }
}

export type UploadedArtwork = {
  assetId: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  byteSize: number;
};

export function isSafeStorageKey(storageKey: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i.test(
    storageKey,
  );
}

export async function storeUploadedArtwork(input: Buffer): Promise<UploadedArtwork> {
  const decoded = await encodeUploadedArtwork(input);
  const assetId = newId();
  const storageKey = `${assetId}.webp`;
  const directory = getMediaStorageDir();
  await mkdir(directory, { recursive: true });
  const path = join(directory, storageKey);
  await writeFile(path, decoded.buffer, { flag: "wx" });

  const now = new Date();
  await getDatabase().insert(mediaAsset).values({
    id: assetId,
    storageKind: "uploaded",
    storageKey,
    mimeType: "image/webp",
    width: decoded.width,
    height: decoded.height,
    byteSize: decoded.buffer.byteLength,
    createdAt: now,
  });

  return {
    assetId,
    mimeType: "image/webp",
    width: decoded.width,
    height: decoded.height,
    byteSize: decoded.buffer.byteLength,
  };
}

export async function encodeUploadedArtwork(input: Buffer): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
}> {
  if (input.byteLength === 0) {
    throw new ArtworkUploadError("The image file is empty.");
  }

  if (input.byteLength > MAX_ARTWORK_BYTES) {
    throw new ArtworkUploadError("Artwork must be 5 MB or smaller.");
  }

  let metadata;

  try {
    metadata = await sharp(input, {
      animated: true,
      limitInputPixels: MAX_ARTWORK_PIXELS,
    }).metadata();
  } catch {
    throw new ArtworkUploadError("The image could not be decoded.");
  }

  if (!metadata.format || !ALLOWED_INPUT_FORMATS.has(metadata.format)) {
    throw new ArtworkUploadError("Artwork must be a JPEG, PNG, or WebP image.");
  }

  if ((metadata.pages ?? 1) > 1) {
    throw new ArtworkUploadError("Animated images are not allowed.");
  }

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width < 1 || height < 1) {
    throw new ArtworkUploadError("The image could not be decoded.");
  }

  if (width * height > MAX_ARTWORK_PIXELS) {
    throw new ArtworkUploadError("Artwork must be 20 megapixels or smaller.");
  }

  try {
    const buffer = await sharp(input, { limitInputPixels: MAX_ARTWORK_PIXELS })
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const encoded = await sharp(buffer).metadata();

    return {
      buffer,
      width: encoded.width ?? width,
      height: encoded.height ?? height,
    };
  } catch (error) {
    if (error instanceof ArtworkUploadError) {
      throw error;
    }

    throw new ArtworkUploadError("The image could not be processed.");
  }
}
