import { eq } from "drizzle-orm";

import { openConversationToken } from "@/features/conversations/server/ape-conversation-token";
import { getDatabase } from "@/lib/db/database";
import { answerFeedback, conversationReference, conversationTurnOperation } from "@/lib/db/schema";

export class ConversationFeedbackError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_found"
      | "forbidden"
      | "invalid"
      | "unavailable"
      | "not_completed",
  ) {
    super(message);
    this.name = "ConversationFeedbackError";
  }
}

export async function upsertAnswerFeedback(input: {
  operationId: string;
  continuationToken: string;
  rating: "up" | "down" | null;
  tokenKey: Buffer;
}): Promise<{ rating: "up" | "down" | null }> {
  const db = getDatabase();
  const operationRows = await db
    .select({
      id: conversationTurnOperation.id,
      conversationId: conversationTurnOperation.conversationId,
      state: conversationTurnOperation.state,
      topicId: conversationReference.topicId,
    })
    .from(conversationTurnOperation)
    .innerJoin(
      conversationReference,
      eq(conversationTurnOperation.conversationId, conversationReference.id),
    )
    .where(eq(conversationTurnOperation.id, input.operationId))
    .limit(1);

  const operation = operationRows[0];

  if (!operation) {
    throw new ConversationFeedbackError("This answer is not available.", "not_found");
  }

  const opened = openConversationToken(
    input.tokenKey,
    input.continuationToken,
    operation.topicId,
  );

  if (!opened || opened.conversationReferenceId !== operation.conversationId) {
    throw new ConversationFeedbackError("This answer is not available.", "forbidden");
  }

  if (operation.state !== "succeeded") {
    throw new ConversationFeedbackError(
      "Feedback is only available for a completed answer.",
      "not_completed",
    );
  }

  const now = new Date();

  if (input.rating === null) {
    await db
      .delete(answerFeedback)
      .where(eq(answerFeedback.operationId, operation.id));
    return { rating: null };
  }

  await db
    .insert(answerFeedback)
    .values({
      operationId: operation.id,
      rating: input.rating,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: answerFeedback.operationId,
      set: {
        rating: input.rating,
        updatedAt: now,
      },
    });

  return { rating: input.rating };
}
