import { NextResponse } from "next/server";

import { isAdminUnauthorizedError, requireAdminSession } from "@/features/admin/require-admin-session";
import { ArtworkUploadError, MAX_ARTWORK_BYTES, storeUploadedArtwork } from "@/lib/media/artwork-upload";
import { MediaStorageConfigurationError } from "@/lib/media/media-storage-env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (isAdminUnauthorizedError(error)) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    throw error;
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a JPEG, PNG, or WebP image." }, { status: 400 });
  }

  if (file.size > MAX_ARTWORK_BYTES) {
    return NextResponse.json({ error: "Artwork must be 5 MB or smaller." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const stored = await storeUploadedArtwork(buffer);
    return NextResponse.json(stored);
  } catch (error) {
    if (error instanceof ArtworkUploadError || error instanceof MediaStorageConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "The image could not be stored." }, { status: 500 });
  }
}
