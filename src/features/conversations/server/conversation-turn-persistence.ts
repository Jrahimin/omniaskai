import { and, desc, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db/database";
import {
  conversationReference,
  conversationTurnOperation,
  topic,
  topicKnowledgeMapping,
} from "@/lib/db/schema";
import { newId } from "@/features/topics/server/topic-catalog-read";
import type { PublishedTopicExecution } from "@/features/topics/server/topic-catalog-read";
import { APE_REQUEST_TIMEOUT_MS } from "./ape-api-client.server";

export const STREAM_DEADLINE_MS = APE_REQUEST_TIMEOUT_MS;

export class ConversationBusyError extends Error {
  constructor() {
    super("A turn is already running for this conversation.");
    this.name = "ConversationBusyError";
  }
}

export class ConversationBlockedError extends Error {
  constructor() {
    super("This conversation can no longer continue.");
    this.name = "ConversationBlockedError";
  }
}

export class ConversationPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversationPersistenceError";
  }
}

export type ReservedConversationTurn = {
  conversationReferenceId: string;
  operationId: string;
  apeConversationId: string | null;
  apeProjectId: string;
};

type Database = ReturnType<typeof getDatabase>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

type ReserveOutcome =
  | { status: "reserved"; value: ReservedConversationTurn }
  | { status: "expired" }
  | { status: "busy" }
  | { status: "blocked" };

export async function reserveConversationTurn(input: {
  topic: PublishedTopicExecution;
  conversationReferenceId?: string;
}): Promise<ReservedConversationTurn> {
  const db = getDatabase();
  const now = new Date();

  try {
    const outcome = await db.transaction(async (tx): Promise<ReserveOutcome> => {
      const publication = await lockCurrentPublication(tx, input.topic.topicId);

      if (!publication) {
        return { status: "blocked" };
      }

      if (!input.conversationReferenceId) {
        const conversationReferenceId = newId();
        const operationId = newId();

        await tx.insert(conversationReference).values({
          id: conversationReferenceId,
          topicId: publication.topicId,
          startingPublishedRevisionId: publication.liveRevisionId,
          capturedApeProjectId: publication.apeProjectId,
          capturedApeConversationId: null,
          capturedConversationEpoch: publication.conversationEpoch,
          executionState: "open",
          createdAt: now,
          lastActivityAt: now,
        });

        await tx.insert(conversationTurnOperation).values({
          id: operationId,
          conversationId: conversationReferenceId,
          sequence: 1,
          state: "running",
          resultClassification: null,
          apeAssistantMessageId: null,
          startedAt: now,
          finishedAt: null,
        });

        return {
          status: "reserved",
          value: {
            conversationReferenceId,
            operationId,
            apeConversationId: null,
            apeProjectId: publication.apeProjectId,
          },
        };
      }

      const refs = await tx
        .select()
        .from(conversationReference)
        .where(eq(conversationReference.id, input.conversationReferenceId))
        .for("update");
      const reference = refs[0];

      if (!reference || reference.topicId !== publication.topicId) {
        return { status: "blocked" };
      }

      if (reference.executionState !== "open") {
        return { status: "blocked" };
      }

      if (reference.capturedConversationEpoch !== publication.conversationEpoch) {
        return { status: "blocked" };
      }

      if (reference.capturedApeProjectId !== publication.apeProjectId) {
        return { status: "blocked" };
      }

      const runningRows = await tx
        .select()
        .from(conversationTurnOperation)
        .where(
          and(
            eq(conversationTurnOperation.conversationId, reference.id),
            eq(conversationTurnOperation.state, "running"),
          ),
        )
        .limit(1);
      const running = runningRows[0];

      if (running) {
        if (now.getTime() - running.startedAt.getTime() > STREAM_DEADLINE_MS) {
          await tx
            .update(conversationTurnOperation)
            .set({
              state: "unknown",
              resultClassification: "error",
              finishedAt: now,
            })
            .where(eq(conversationTurnOperation.id, running.id));
          await tx
            .update(conversationReference)
            .set({ executionState: "blocked", lastActivityAt: now })
            .where(eq(conversationReference.id, reference.id));
          return { status: "expired" };
        }

        return { status: "busy" };
      }

      const lastRows = await tx
        .select({
          sequence: conversationTurnOperation.sequence,
          state: conversationTurnOperation.state,
        })
        .from(conversationTurnOperation)
        .where(eq(conversationTurnOperation.conversationId, reference.id))
        .orderBy(desc(conversationTurnOperation.sequence))
        .limit(1);
      const last = lastRows[0];

      if (last && (last.state === "failed" || last.state === "unknown")) {
        return { status: "blocked" };
      }

      if (!reference.capturedApeConversationId) {
        return { status: "blocked" };
      }

      const operationId = newId();

      try {
        await tx.insert(conversationTurnOperation).values({
          id: operationId,
          conversationId: reference.id,
          sequence: (last?.sequence ?? 0) + 1,
          state: "running",
          resultClassification: null,
          apeAssistantMessageId: null,
          startedAt: now,
          finishedAt: null,
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          return { status: "busy" };
        }

        throw error;
      }

      await tx
        .update(conversationReference)
        .set({ lastActivityAt: now })
        .where(eq(conversationReference.id, reference.id));

      return {
        status: "reserved",
        value: {
          conversationReferenceId: reference.id,
          operationId,
          apeConversationId: reference.capturedApeConversationId,
          apeProjectId: reference.capturedApeProjectId,
        },
      };
    });

    if (outcome.status === "reserved") {
      return outcome.value;
    }

    if (outcome.status === "busy") {
      throw new ConversationBusyError();
    }

    throw new ConversationBlockedError();
  } catch (error) {
    if (
      error instanceof ConversationBlockedError ||
      error instanceof ConversationBusyError
    ) {
      throw error;
    }

    throw new ConversationPersistenceError("Could not reserve a conversation turn.");
  }
}

export async function persistCreatedApeConversation(input: {
  conversationReferenceId: string;
  apeConversationId: string;
}): Promise<void> {
  const db = getDatabase();
  const now = new Date();

  try {
    const updated = await db
      .update(conversationReference)
      .set({
        capturedApeConversationId: input.apeConversationId,
        lastActivityAt: now,
      })
      .where(
        and(
          eq(conversationReference.id, input.conversationReferenceId),
          eq(conversationReference.executionState, "open"),
          sql`${conversationReference.capturedApeConversationId} IS NULL`,
        ),
      )
      .returning({ id: conversationReference.id });

    if (updated.length === 0) {
      throw new ConversationPersistenceError(
        "Could not store the APE conversation id.",
      );
    }
  } catch (error) {
    if (error instanceof ConversationPersistenceError) {
      throw error;
    }

    throw new ConversationPersistenceError(
      "Could not store the APE conversation id.",
    );
  }
}

export async function completeTurnOperation(input: {
  conversationReferenceId: string;
  operationId: string;
  classification: "grounded" | "completed" | "insufficient";
  apeAssistantMessageId: string | null;
}): Promise<"recorded" | "unrecorded"> {
  const db = getDatabase();
  const now = new Date();

  try {
    return await db.transaction(async (tx) => {
      const refs = await tx
        .select()
        .from(conversationReference)
        .where(eq(conversationReference.id, input.conversationReferenceId))
        .for("update");
      const reference = refs[0];

      if (!reference || reference.executionState !== "open") {
        return "unrecorded";
      }

      const updated = await tx
        .update(conversationTurnOperation)
        .set({
          state: "succeeded",
          resultClassification: input.classification,
          apeAssistantMessageId: input.apeAssistantMessageId,
          finishedAt: now,
        })
        .where(
          and(
            eq(conversationTurnOperation.id, input.operationId),
            eq(conversationTurnOperation.conversationId, reference.id),
            eq(conversationTurnOperation.state, "running"),
          ),
        )
        .returning({ id: conversationTurnOperation.id });

      if (updated.length === 0) {
        return "unrecorded";
      }

      await tx
        .update(conversationReference)
        .set({ lastActivityAt: now })
        .where(eq(conversationReference.id, reference.id));

      return "recorded";
    });
  } catch {
    console.error("Conversation persistence failed", {
      operation: "complete_turn",
    });
    await failTurnOperation({
      conversationReferenceId: input.conversationReferenceId,
      operationId: input.operationId,
      state: "unknown",
      blockConversation: true,
    });
    return "unrecorded";
  }
}

export async function failTurnOperation(input: {
  conversationReferenceId: string;
  operationId: string;
  state: "failed" | "unknown";
  blockConversation: boolean;
}): Promise<void> {
  const db = getDatabase();
  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      const refs = await tx
        .select()
        .from(conversationReference)
        .where(eq(conversationReference.id, input.conversationReferenceId))
        .for("update");
      const reference = refs[0];

      if (!reference) {
        return;
      }

      const updated = await tx
        .update(conversationTurnOperation)
        .set({
          state: input.state,
          resultClassification: "error",
          finishedAt: now,
        })
        .where(
          and(
            eq(conversationTurnOperation.id, input.operationId),
            eq(conversationTurnOperation.conversationId, reference.id),
            eq(conversationTurnOperation.state, "running"),
          ),
        )
        .returning({ id: conversationTurnOperation.id });

      if (updated.length === 0) {
        return;
      }

      if (input.blockConversation) {
        await tx
          .update(conversationReference)
          .set({ executionState: "blocked", lastActivityAt: now })
          .where(eq(conversationReference.id, reference.id));
        return;
      }

      await tx
        .update(conversationReference)
        .set({ lastActivityAt: now })
        .where(eq(conversationReference.id, reference.id));
    });
  } catch {
    console.error("Conversation persistence failed", {
      operation: "fail_turn",
    });
  }
}

async function lockCurrentPublication(
  tx: Transaction,
  topicId: string,
): Promise<PublishedTopicExecution | undefined> {
  const topics = await tx
    .select({
      topicId: topic.id,
      slug: topic.slug,
      conversationEpoch: topic.conversationEpoch,
      liveRevisionId: topic.liveRevisionId,
    })
    .from(topic)
    .where(eq(topic.id, topicId))
    .for("update");
  const current = topics[0];

  if (!current?.liveRevisionId) {
    return undefined;
  }

  const mappings = await tx
    .select({ apeProjectId: topicKnowledgeMapping.apeProjectId })
    .from(topicKnowledgeMapping)
    .where(eq(topicKnowledgeMapping.revisionId, current.liveRevisionId))
    .limit(1);
  const mapping = mappings[0];

  if (!mapping) {
    return undefined;
  }

  return {
    topicId: current.topicId,
    slug: current.slug,
    conversationEpoch: current.conversationEpoch,
    liveRevisionId: current.liveRevisionId,
    apeProjectId: mapping.apeProjectId,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}
