import { NextResponse } from "next/server";

import { loadAdminConversationTranscriptPage } from "@/features/admin/admin-conversation-read";
import { isAdminUnauthorizedError, requireAdminSession } from "@/features/admin/require-admin-session";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (isAdminUnauthorizedError(error)) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    throw error;
  }

  const { conversationId } = await context.params;
  const offset = Number(new URL(request.url).searchParams.get("offset") ?? "0");

  if (!Number.isInteger(offset) || offset < 0) {
    return NextResponse.json({ error: "offset must be a non-negative integer." }, { status: 400 });
  }

  const transcript = await loadAdminConversationTranscriptPage(conversationId, offset);

  if (!transcript) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json(transcript);
}
