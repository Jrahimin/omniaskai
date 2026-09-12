import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { getAdminConversationDetail } from "@/features/admin/admin-conversation-read";
import { sealConversationToken } from "@/features/conversations/server/ape-conversation-token";
import { upsertAnswerFeedback } from "@/features/conversations/server/conversation-feedback";
import {
  completeTurnOperation,
  persistCreatedApeConversation,
  reserveConversationTurn,
} from "@/features/conversations/server/conversation-turn-persistence";
import { loadPublishedTopicExecution } from "@/features/topics/server/topic-catalog-read";
import { createTopic, publishTopic, saveTopicDraft } from "@/features/topics/server/topic-operations";
import {
  closePostgresForIntegrationTests,
  preparePostgresForIntegrationTests,
  resetProductTables,
} from "@/lib/db/postgres-test-database";

const PROJECT_ONE = "660e8400-e29b-41d4-a716-446655440001";
const PROJECT_TWO = "660e8400-e29b-41d4-a716-446655440002";
const APE_CONVERSATION_ID = "880e8400-e29b-41d4-a716-446655440003";
const ASSISTANT_MESSAGE_ID = "aa0e8400-e29b-41d4-a716-446655440005";
const TOKEN_KEY = randomBytes(32);

describe.sequential("answer feedback and inspection", () => {
  beforeAll(async () => {
    await preparePostgresForIntegrationTests();
  });

  beforeEach(async () => {
    await resetProductTables();
  });

  afterAll(async () => {
    await closePostgresForIntegrationTests();
  });

  it("stores feedback on the owning operation and keeps captured project after remap", async () => {
    await createTopic({
      id: "topic_income_tax",
      slug: "income-tax",
      themeKey: "tax",
      apeProjectId: PROJECT_ONE,
      translations: {
        en: {
          title: "Income Tax",
          landingDescription: "Landing",
          workspaceSubtitle: "Workspace",
          aboutDescription: "About",
          sourceDescription: "Sources",
          artworkAlt: "Alt",
          composerPlaceholder: "Ask…",
          starterQuestions: ["What is taxable?"],
        },
      },
    });
    await publishTopic({
      topicId: "topic_income_tax",
      expectedVersion: 1,
      readProject: async (projectId) => ({
        status: "ok",
        project: {
          id: projectId,
          name: "Tax",
          description: null,
          isActive: true,
          deletedAt: null,
        },
      }),
    });

    const execution = await loadPublishedTopicExecution("income-tax");

    if (!execution) {
      throw new Error("missing execution");
    }

    const reserved = await reserveConversationTurn({ topic: execution });
    await persistCreatedApeConversation({
      conversationReferenceId: reserved.conversationReferenceId,
      apeConversationId: APE_CONVERSATION_ID,
    });
    await completeTurnOperation({
      conversationReferenceId: reserved.conversationReferenceId,
      operationId: reserved.operationId,
      classification: "grounded",
      apeAssistantMessageId: ASSISTANT_MESSAGE_ID,
    });

    const token = sealConversationToken(
      TOKEN_KEY,
      "topic_income_tax",
      reserved.conversationReferenceId,
    );

    await expect(
      upsertAnswerFeedback({
        operationId: reserved.operationId,
        continuationToken: token,
        rating: "up",
        tokenKey: TOKEN_KEY,
      }),
    ).resolves.toEqual({ rating: "up" });

    await expect(
      upsertAnswerFeedback({
        operationId: reserved.operationId,
        continuationToken: token,
        rating: "down",
        tokenKey: TOKEN_KEY,
      }),
    ).resolves.toEqual({ rating: "down" });

    await expect(
      upsertAnswerFeedback({
        operationId: reserved.operationId,
        continuationToken: token,
        rating: null,
        tokenKey: TOKEN_KEY,
      }),
    ).resolves.toEqual({ rating: null });

    const expired = sealConversationToken(
      TOKEN_KEY,
      "topic_income_tax",
      reserved.conversationReferenceId,
      Date.now() - 13 * 60 * 60 * 1000,
    );
    await expect(
      upsertAnswerFeedback({
        operationId: reserved.operationId,
        continuationToken: expired,
        rating: "up",
        tokenKey: TOKEN_KEY,
      }),
    ).rejects.toMatchObject({ code: "forbidden" });

    await saveTopicDraft({
      topicId: "topic_income_tax",
      expectedVersion: 2,
      apeProjectId: PROJECT_TWO,
    });
    await publishTopic({
      topicId: "topic_income_tax",
      expectedVersion: 3,
      readProject: async (projectId) => ({
        status: "ok",
        project: {
          id: projectId,
          name: "Tax remapped",
          description: null,
          isActive: true,
          deletedAt: null,
        },
      }),
    });

    const detail = await getAdminConversationDetail(reserved.conversationReferenceId);
    expect(detail?.operations[0]?.rating).toBeNull();
    expect(detail?.transcript.status).not.toBe("ok");

    const { conversationReference } = await import("@/lib/db/schema");
    const { getDatabase } = await import("@/lib/db/database");
    const { eq } = await import("drizzle-orm");
    const rows = await getDatabase()
      .select()
      .from(conversationReference)
      .where(eq(conversationReference.id, reserved.conversationReferenceId));
    expect(rows[0]?.capturedApeProjectId).toBe(PROJECT_ONE);
  });
});
