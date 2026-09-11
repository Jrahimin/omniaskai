import { asc, desc, eq, sql } from "drizzle-orm";

import {
  APE_TRANSCRIPT_MAX_OFFSET,
  APE_TRANSCRIPT_PAGE_SIZE,
  getApeConversationMessages,
  type ApeTranscriptMessage,
} from "@/features/conversations/server/ape-api-client.server";
import { getApeRuntimeConfig } from "@/features/conversations/server/ape-config.server";
import { getDatabase } from "@/lib/db/database";
import {
  answerFeedback,
  conversationReference,
  conversationTurnOperation,
  topic,
  topicRevisionTranslation,
} from "@/lib/db/schema";

export type AdminConversationSummary = {
  id: string;
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  executionState: "open" | "blocked";
  createdAt: string;
  lastActivityAt: string;
};

export type AdminConversationOperation = {
  id: string;
  sequence: number;
  state: "running" | "succeeded" | "failed" | "unknown";
  resultClassification: "grounded" | "completed" | "insufficient" | "error" | null;
  apeAssistantMessageId: string | null;
  startedAt: string;
  finishedAt: string | null;
  rating: "up" | "down" | null;
};

export type AdminConversationDetail = {
  id: string;
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  executionState: "open" | "blocked";
  createdAt: string;
  lastActivityAt: string;
  operations: AdminConversationOperation[];
  transcript:
    | {
        status: "ok";
        messages: ApeTranscriptMessage[];
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      }
    | { status: "unavailable"; reason: string }
    | { status: "missing" };
};

export async function listAdminConversations(input: {
  topicId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: AdminConversationSummary[]; total: number }> {
  const db = getDatabase();
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
  const offset = Math.max(input.offset ?? 0, 0);
  const topicFilter = input.topicId?.trim();

  const where = topicFilter ? eq(conversationReference.topicId, topicFilter) : undefined;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(conversationReference)
    .where(where);

  const rows = await db
    .select({
      id: conversationReference.id,
      topicId: conversationReference.topicId,
      topicSlug: topic.slug,
      executionState: conversationReference.executionState,
      createdAt: conversationReference.createdAt,
      lastActivityAt: conversationReference.lastActivityAt,
      title: topicRevisionTranslation.title,
    })
    .from(conversationReference)
    .innerJoin(topic, eq(conversationReference.topicId, topic.id))
    .leftJoin(
      topicRevisionTranslation,
      sql`${topicRevisionTranslation.revisionId} = coalesce(${topic.liveRevisionId}, ${topic.draftRevisionId})
        and ${topicRevisionTranslation.locale} = 'en'`,
    )
    .where(where)
    .orderBy(desc(conversationReference.lastActivityAt), desc(conversationReference.id))
    .limit(limit)
    .offset(offset);

  return {
    total: countRow?.count ?? 0,
    items: rows.map((row) => ({
      id: row.id,
      topicId: row.topicId,
      topicSlug: row.topicSlug,
      topicTitle: row.title || row.topicSlug,
      executionState: row.executionState,
      createdAt: row.createdAt.toISOString(),
      lastActivityAt: row.lastActivityAt.toISOString(),
    })),
  };
}

export async function getAdminConversationDetail(
  conversationId: string,
): Promise<AdminConversationDetail | undefined> {
  const db = getDatabase();
  const rows = await db
    .select({
      id: conversationReference.id,
      topicId: conversationReference.topicId,
      topicSlug: topic.slug,
      executionState: conversationReference.executionState,
      createdAt: conversationReference.createdAt,
      lastActivityAt: conversationReference.lastActivityAt,
      capturedApeProjectId: conversationReference.capturedApeProjectId,
      capturedApeConversationId: conversationReference.capturedApeConversationId,
      title: topicRevisionTranslation.title,
    })
    .from(conversationReference)
    .innerJoin(topic, eq(conversationReference.topicId, topic.id))
    .leftJoin(
      topicRevisionTranslation,
      sql`${topicRevisionTranslation.revisionId} = coalesce(${topic.liveRevisionId}, ${topic.draftRevisionId})
        and ${topicRevisionTranslation.locale} = 'en'`,
    )
    .where(eq(conversationReference.id, conversationId))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return undefined;
  }

  const operations = await db
    .select({
      id: conversationTurnOperation.id,
      sequence: conversationTurnOperation.sequence,
      state: conversationTurnOperation.state,
      resultClassification: conversationTurnOperation.resultClassification,
      apeAssistantMessageId: conversationTurnOperation.apeAssistantMessageId,
      startedAt: conversationTurnOperation.startedAt,
      finishedAt: conversationTurnOperation.finishedAt,
      rating: answerFeedback.rating,
    })
    .from(conversationTurnOperation)
    .leftJoin(
      answerFeedback,
      eq(answerFeedback.operationId, conversationTurnOperation.id),
    )
    .where(eq(conversationTurnOperation.conversationId, conversationId))
    .orderBy(asc(conversationTurnOperation.sequence));

  const transcript = await loadTranscript(
    row.capturedApeProjectId,
    row.capturedApeConversationId,
  );

  return {
    id: row.id,
    topicId: row.topicId,
    topicSlug: row.topicSlug,
    topicTitle: row.title || row.topicSlug,
    executionState: row.executionState,
    createdAt: row.createdAt.toISOString(),
    lastActivityAt: row.lastActivityAt.toISOString(),
    operations: operations.map((operation) => ({
      id: operation.id,
      sequence: operation.sequence,
      state: operation.state,
      resultClassification: operation.resultClassification,
      apeAssistantMessageId: operation.apeAssistantMessageId,
      startedAt: operation.startedAt.toISOString(),
      finishedAt: operation.finishedAt?.toISOString() ?? null,
      rating: operation.rating ?? null,
    })),
    transcript,
  };
}

export async function loadAdminConversationTranscriptPage(
  conversationId: string,
  offset: number,
): Promise<AdminConversationDetail["transcript"] | null> {
  if (offset < 0 || offset > APE_TRANSCRIPT_MAX_OFFSET) {
    return {
      status: "unavailable",
      reason: "The transcript could not be loaded from APE.",
    };
  }

  const db = getDatabase();
  const rows = await db
    .select({
      capturedApeProjectId: conversationReference.capturedApeProjectId,
      capturedApeConversationId: conversationReference.capturedApeConversationId,
    })
    .from(conversationReference)
    .where(eq(conversationReference.id, conversationId))
    .limit(1);
  const row = rows[0];

  if (!row) {
    return null;
  }

  return loadTranscript(row.capturedApeProjectId, row.capturedApeConversationId, offset);
}

async function loadTranscript(
  projectId: string,
  conversationId: string | null,
  offset = 0,
): Promise<AdminConversationDetail["transcript"]> {
  if (!conversationId) {
    return { status: "missing" };
  }

  const config = getApeRuntimeConfig();

  if (!config) {
    return {
      status: "unavailable",
      reason: "The transcript is unavailable because APE is not configured.",
    };
  }

  const result = await getApeConversationMessages(config, projectId, conversationId, {
    limit: APE_TRANSCRIPT_PAGE_SIZE,
    offset,
  });

  if (result.status !== "ok") {
    return {
      status: "unavailable",
      reason: "The transcript could not be loaded from APE.",
    };
  }

  return {
    status: "ok",
    messages: result.messages,
    total: result.total,
    limit: result.limit,
    offset: result.offset,
    hasMore: result.offset + result.messages.length < result.total && result.offset < APE_TRANSCRIPT_MAX_OFFSET,
  };
}
