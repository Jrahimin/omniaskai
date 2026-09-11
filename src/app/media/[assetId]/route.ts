import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

import { eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db/database";
import { mediaAsset } from "@/lib/db/schema";
import { resolveUploadedArtworkPath } from "@/lib/media/resolve-uploaded-artwork-path";
import { isUuid } from "@/features/topics/topic-validation-schema";

export const dynamic = "force-dynamic";

type MediaRouteProps = {
  params: Promise<{ assetId: string }>;
};

export async function GET(_request: Request, { params }: MediaRouteProps) {
  const { assetId } = await params;

  if (!isUuid(assetId)) {
    return new Response("Not found", { status: 404 });
  }

  const rows = await getDatabase()
    .select()
    .from(mediaAsset)
    .where(eq(mediaAsset.id, assetId))
    .limit(1);
  const asset = rows[0];

  if (!asset || asset.storageKind !== "uploaded") {
    return new Response("Not found", { status: 404 });
  }

  const path = resolveUploadedArtworkPath(asset.storageKey);

  if (!path) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const info = await stat(path);

    if (!info.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const stream = Readable.toWeb(createReadStream(path)) as ReadableStream;

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
