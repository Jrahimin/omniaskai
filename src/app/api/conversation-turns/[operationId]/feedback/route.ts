import { NextResponse } from "next/server";
import { z } from "zod";

import { ConversationFeedbackError, upsertAnswerFeedback } from "@/features/conversations/server/conversation-feedback";
import { getApeRuntimeConfig } from "@/features/conversations/server/ape-config.server";
import { isUuid } from "@/features/topics/topic-validation-schema";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  continuationToken: z.string().min(1),
  rating: z.union([z.literal("up"), z.literal("down"), z.null()]),
});

type FeedbackRouteProps = {
  params: Promise<{ operationId: string }>;
};

export async function POST(request: Request, { params }: FeedbackRouteProps) {
  const { operationId } = await params;

  if (!isUuid(operationId)) {
    return NextResponse.json({ error: "This answer is not available." }, { status: 404 });
  }

  const config = getApeRuntimeConfig();

  if (!config) {
    return NextResponse.json({ error: "Feedback is unavailable." }, { status: 503 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Feedback could not be saved." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Feedback could not be saved." }, { status: 400 });
  }

  try {
    const result = await upsertAnswerFeedback({
      operationId,
      continuationToken: parsed.data.continuationToken,
      rating: parsed.data.rating,
      tokenKey: config.tokenKey,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ConversationFeedbackError) {
      const status =
        error.code === "not_found"
          ? 404
          : error.code === "forbidden"
            ? 403
            : error.code === "not_completed"
              ? 409
              : 400;

      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: "Feedback could not be saved." }, { status: 500 });
  }
}
