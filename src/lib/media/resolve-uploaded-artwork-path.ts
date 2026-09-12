import { join } from "node:path";

import { isSafeStorageKey } from "./artwork-upload";
import { getMediaStorageDir } from "./media-storage-env";

export function resolveUploadedArtworkPath(storageKey: string): string | undefined {
  if (!isSafeStorageKey(storageKey)) {
    return undefined;
  }

  return join(getMediaStorageDir(), storageKey);
}
