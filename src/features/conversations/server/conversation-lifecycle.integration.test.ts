import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  ConversationBlockedError,
  ConversationBusyError,
  ConversationPersistenceError,
  STREAM_DEADLINE_MS,
  persistCreatedApeConversation,
  reserveConversationTurn,
  completeTurnOperation,
  failTurnOperation,
} from "@/features/conversations/server/conversation-turn-persistence";
import { loadPublishedTopicExecution } from "@/features/topics/server/topic-catalog-read";
import {
  createTopic,
  publishTopic,
  saveTopicDraft,
  unpublishTopic,
  type ApeProjectLookup,
} from "@/features/topics/server/topic-operations";
import { getDatabase } from "@/lib/db/database";
import {
  closePostgresForIntegrationTests,
  preparePostgresForIntegrationTests,
  resetProductTables,
} from "@/lib/db/postgres-test-database";
import {
  conversationReference,
  conversationTurnOperation,
  topic,
} from "@/lib/db/schema";

const PROJECT_ONE = "660e8400-e29b-41d4-a716-446655440001";
const PROJECT_TWO = "660e8400-e29b-41d4-a716-446655440002";
const APE_CONVERSATION_ID = "880e8400-e29b-41d4-a716-446655440003";

const validReadProject: ApeProjectLookup = async (projectId) => ({
  status: "ok",
  project: {
    id: projectId,
    name: "Test project",
    description: null,
    isActive: true,
    deletedAt: null,
  },
});

function english(title: string) {
  return {
    title,
    landingDescription: `${title} landing`,
    workspaceSubtitle: `${title} workspace`,
    aboutDescription: `${title} about`,
    sourceDescription: `${title} sources`,
    artworkAlt: `${title} artwork`,
    composerPlaceholder: `Ask about ${title}…`,
    starterQuestions: [`What is ${title}?`],
  };
}

async function publishedExecution() {
  await createTopic({
    id: "topic_income_tax",
    slug: "income-tax",
    themeKey: "tax",
    apeProjectId: PROJECT_ONE,
    translations: { en: english("Income Tax") },
  });
  await publishTopic({
    topicId: "topic_income_tax",
    expectedVersion: 1,
    readProject: validReadProject,
  });

  const execution = await loadPublishedTopicExecution("income-tax");

  if (!execution) {
    throw new Error("Expected a published topic execution.");
  }

  return execution;
}

describe.sequential("conversation lifecycle persistence", () => {
  beforeAll(async () => {
    await preparePostgresForIntegrationTests();
  });

  beforeEach(async () => {
    await resetProductTables();
  });

  afterAll(async () => {
    await closePostgresForIntegrationTests();
  });

  it("preserves continuation across content-only publication and invalidates after remap or unpublish", async () => {
    const execution = await publishedExecution();
    const reserved = await reserveConversationTurn({ topic: execution });
    await persistCreatedApeConversation({
      conversationReferenceId: reserved.conversationReferenceId,
      apeConversationId: APE_CONVERSATION_ID,
    });
    await completeTurnOperation({
      conversationReferenceId: reserved.conversationReferenceId,
      operationId: reserved.operationId,
      classification: "grounded",
      apeAssistantMessageId: null,
    });

    const current = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_income_tax"))
      .limit(1);
    await saveTopicDraft({
      topicId: "topic_income_tax",
      expectedVersion: current[0]!.version,
      translations: { en: english("Income Tax updated") },
    });
    const afterDraft = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_income_tax"))
      .limit(1);
    const contentPublish = await publishTopic({
      topicId: "topic_income_tax",
      expectedVersion: afterDraft[0]!.version,
      readProject: validReadProject,
    });
    expect(contentPublish.conversationEpoch).toBe(execution.conversationEpoch);

    const afterContent = await loadPublishedTopicExecution("income-tax");
    await expect(
      reserveConversationTurn({
        topic: afterContent!,
        conversationReferenceId: reserved.conversationReferenceId,
      }),
    ).resolves.toMatchObject({
      conversationReferenceId: reserved.conversationReferenceId,
    });
    await completeTurnOperation({
      conversationReferenceId: reserved.conversationReferenceId,
      operationId: (await getDatabase()
        .select()
        .from(conversationTurnOperation)
        .where(eq(conversationTurnOperation.conversationId, reserved.conversationReferenceId)))
        .find((row) => row.state === "running")!.id,
      classification: "completed",
      apeAssistantMessageId: null,
    });

    const beforeRemap = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_income_tax"))
      .limit(1);
    await saveTopicDraft({
      topicId: "topic_income_tax",
      expectedVersion: beforeRemap[0]!.version,
      apeProjectId: PROJECT_TWO,
    });
    const remapDraft = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_income_tax"))
      .limit(1);
    const remapped = await publishTopic({
      topicId: "topic_income_tax",
      expectedVersion: remapDraft[0]!.version,
      readProject: validReadProject,
    });
    expect(remapped.conversationEpoch).toBe(execution.conversationEpoch + 1);

    const afterRemap = await loadPublishedTopicExecution("income-tax");
    await expect(
      reserveConversationTurn({
        topic: afterRemap!,
        conversationReferenceId: reserved.conversationReferenceId,
      }),
    ).rejects.toBeInstanceOf(ConversationBlockedError);

    await createTopic({
      id: "topic_history",
      slug: "bangladesh-history",
      themeKey: "history",
      apeProjectId: PROJECT_TWO,
      translations: { en: english("History") },
    });
    await publishTopic({
      topicId: "topic_history",
      expectedVersion: 1,
      readProject: validReadProject,
    });
    const history = await loadPublishedTopicExecution("bangladesh-history");
    const historyTurn = await reserveConversationTurn({ topic: history! });
    await persistCreatedApeConversation({
      conversationReferenceId: historyTurn.conversationReferenceId,
      apeConversationId: "880e8400-e29b-41d4-a716-446655440004",
    });
    const historyTopic = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_history"))
      .limit(1);
    await unpublishTopic({
      topicId: "topic_history",
      expectedVersion: historyTopic[0]!.version,
    });
    await expect(
      reserveConversationTurn({
        topic: {
          ...history!,
          conversationEpoch: historyTopic[0]!.conversationEpoch + 1,
        },
        conversationReferenceId: historyTurn.conversationReferenceId,
      }),
    ).rejects.toBeInstanceOf(ConversationBlockedError);
  });

  it("rejects a second running operation on the same conversation", async () => {
    const execution = await publishedExecution();
    const first = await reserveConversationTurn({ topic: execution });
    await persistCreatedApeConversation({
      conversationReferenceId: first.conversationReferenceId,
      apeConversationId: APE_CONVERSATION_ID,
    });

    await expect(
      reserveConversationTurn({
        topic: execution,
        conversationReferenceId: first.conversationReferenceId,
      }),
    ).rejects.toBeInstanceOf(ConversationBusyError);
  });

  it("treats an expired running operation as unknown and blocks continuation", async () => {
    const execution = await publishedExecution();
    const reserved = await reserveConversationTurn({ topic: execution });
    await persistCreatedApeConversation({
      conversationReferenceId: reserved.conversationReferenceId,
      apeConversationId: APE_CONVERSATION_ID,
    });

    await getDatabase()
      .update(conversationTurnOperation)
      .set({
        startedAt: new Date(Date.now() - STREAM_DEADLINE_MS - 1_000),
      })
      .where(eq(conversationTurnOperation.id, reserved.operationId));

    await expect(
      reserveConversationTurn({
        topic: execution,
        conversationReferenceId: reserved.conversationReferenceId,
      }),
    ).rejects.toBeInstanceOf(ConversationBlockedError);

    const blocked = await getDatabase()
      .select()
      .from(conversationTurnOperation)
      .where(eq(conversationTurnOperation.id, reserved.operationId));
    const reference = await getDatabase()
      .select()
      .from(conversationReference)
      .where(eq(conversationReference.id, reserved.conversationReferenceId));

    expect(blocked[0]?.state).toBe("unknown");
    expect(reference[0]?.executionState).toBe("blocked");
    await expect(
      completeTurnOperation({
        conversationReferenceId: reserved.conversationReferenceId,
        operationId: reserved.operationId,
        classification: "grounded",
        apeAssistantMessageId: null,
      }),
    ).resolves.toBe("unrecorded");
    const afterLateComplete = await getDatabase()
      .select()
      .from(conversationTurnOperation)
      .where(eq(conversationTurnOperation.id, reserved.operationId));
    expect(afterLateComplete[0]?.state).toBe("unknown");
  });

  it("rejects a new turn after unpublish even when the caller still holds a stale publication snapshot", async () => {
    const execution = await publishedExecution();
    const current = await getDatabase()
      .select()
      .from(topic)
      .where(eq(topic.id, "topic_income_tax"))
      .limit(1);
    await unpublishTopic({
      topicId: "topic_income_tax",
      expectedVersion: current[0]!.version,
    });

    await expect(reserveConversationTurn({ topic: execution })).rejects.toBeInstanceOf(
      ConversationBlockedError,
    );

    const references = await getDatabase().select().from(conversationReference);
    expect(references).toHaveLength(0);
  });

  it("rejects continuation after an uncertain failed turn even if the conversation is still open", async () => {
    const execution = await publishedExecution();
    const reserved = await reserveConversationTurn({ topic: execution });
    await persistCreatedApeConversation({
      conversationReferenceId: reserved.conversationReferenceId,
      apeConversationId: APE_CONVERSATION_ID,
    });
    await failTurnOperation({
      conversationReferenceId: reserved.conversationReferenceId,
      operationId: reserved.operationId,
      state: "failed",
      blockConversation: false,
    });

    await expect(
      reserveConversationTurn({
        topic: execution,
        conversationReferenceId: reserved.conversationReferenceId,
      }),
    ).rejects.toBeInstanceOf(ConversationBlockedError);
  });

  it("refuses to persist an APE conversation id after a blocked failure", async () => {
    const execution = await publishedExecution();
    const reserved = await reserveConversationTurn({ topic: execution });
    await failTurnOperation({
      conversationReferenceId: reserved.conversationReferenceId,
      operationId: reserved.operationId,
      state: "unknown",
      blockConversation: true,
    });

    await expect(
      persistCreatedApeConversation({
        conversationReferenceId: reserved.conversationReferenceId,
        apeConversationId: APE_CONVERSATION_ID,
      }),
    ).rejects.toBeInstanceOf(ConversationPersistenceError);
  });
});
