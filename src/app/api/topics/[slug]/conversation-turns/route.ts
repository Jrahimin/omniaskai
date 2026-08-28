import { NextRequest } from "next/server";

import { isConversationTopicSlug } from "@/features/conversations/conversation-language";
import {
  isSameOriginRequest,
  readJsonBodyWithinLimit,
  streamTopicConversationTurn,
  validateConversationTurnRequest,
} from "@/features/conversations/server/stream-conversation-turn.server";

export const maxDuration = 120;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: true }, { status: 403 });
  }

  const { slug } = await context.params;

  if (!isConversationTopicSlug(slug)) {
    return Response.json({ error: true }, { status: 404 });
  }

  const bodyResult = await readJsonBodyWithinLimit(request);

  if (!bodyResult.ok) {
    return Response.json({ error: true }, { status: 400 });
  }

  const parsed = validateConversationTurnRequest(bodyResult.value);

  if (!parsed) {
    return Response.json({ error: true }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) => {
        controller.enqueue(encoder.encode(chunk));
      };

      try {
        await streamTopicConversationTurn({
          slug,
          question: parsed.question,
          continuationToken: parsed.continuationToken,
          signal: request.signal,
          enqueue,
        });
      } catch {
        enqueue("event: error\ndata: {}\n\n");
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
