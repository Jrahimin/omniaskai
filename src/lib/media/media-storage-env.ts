import { isAbsolute, join } from "node:path";

export class MediaStorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaStorageConfigurationError";
  }
}

export function getMediaStorageDir(): string {
  const raw = process.env.MEDIA_STORAGE_DIR?.trim();

  if (!raw) {
    throw new MediaStorageConfigurationError("MEDIA_STORAGE_DIR is required.");
  }

  if (isAbsolute(raw)) {
    return raw;
  }

  return join(/* turbopackIgnore: true */ process.cwd(), raw);
}
