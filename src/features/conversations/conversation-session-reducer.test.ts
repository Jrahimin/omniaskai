import { describe, expect, it } from "vitest";

import {
  emptyWorkspaceSession,
  workspaceSessionReducer,
  type WorkspaceSessionState,
} from "./conversation-session-reducer";
import type { AssistantTurn } from "./conversation";

function submitState(): WorkspaceSessionState {
  return workspaceSessionReducer(emptyWorkspaceSession, {
    type: "submit",
    operationId: "1",
    conversationId: "c1",
    title: "What is taxable?",
    happenedAtLabel: "10:15",
    userTurn: {
      id: "u1",
      role: "user",
      text: "What is taxable?",
      createdAtLabel: "10:15",
    },
    pendingTurn: {
      id: "a1",
      role: "assistant",
      status: "pending",
      blocks: [],
      sourceIds: [],
      followUps: [],
    },
  });
}

describe("workspaceSessionReducer", () => {
  it("ignores stale token events from a previous operation", () => {
    const pending = submitState();
    const stale = workspaceSessionReducer(pending, {
      type: "token",
      operationId: "0",
      delta: "stale",
    });
    const live = workspaceSessionReducer(stale, {
      type: "token",
      operationId: "1",
      delta: "Heads of income",
    });
    const assistant = live.conversations[0]?.turns[1] as AssistantTurn;

    expect(assistant.status).toBe("streaming");
    expect(assistant.blocks[0]).toMatchObject({
      type: "paragraph",
      text: "Heads of income",
    });
  });

  it("blocks resubmission after create-success then error", () => {
    const afterCreate = workspaceSessionReducer(submitState(), {
      type: "conversation",
      operationId: "1",
      continuationToken: "sealed-token",
    });
    const afterError = workspaceSessionReducer(afterCreate, {
      type: "error",
      operationId: "1",
      retryable: false,
    });
    const assistant = afterError.conversations[0]?.turns[1] as AssistantTurn;
    const attemptedResubmit = workspaceSessionReducer(afterError, {
      type: "submit",
      operationId: "2",
      conversationId: "c1",
      title: "Try again",
      happenedAtLabel: "10:16",
      userTurn: {
        id: "u2",
        role: "user",
        text: "Try again",
        createdAtLabel: "10:16",
      },
      pendingTurn: {
        id: "a2",
        role: "assistant",
        status: "pending",
        blocks: [],
        sourceIds: [],
        followUps: [],
      },
    });

    expect(afterError.blockedConversationIds.c1).toBe(true);
    expect(afterError.continuationTokens.c1).toBe("sealed-token");
    expect(afterError.operationId).toBeNull();
    expect(assistant.status).toBe("error");
    expect(assistant.retryable).toBe(false);
    expect(attemptedResubmit).toBe(afterError);
  });

  it("allows a retry after a proven pre-acceptance failure", () => {
    const afterError = workspaceSessionReducer(submitState(), {
      type: "error",
      operationId: "1",
      retryable: true,
    });
    const retried = workspaceSessionReducer(afterError, {
      type: "submit",
      operationId: "2",
      conversationId: "c1",
      title: "What is taxable?",
      happenedAtLabel: "10:16",
      userTurn: {
        id: "u2",
        role: "user",
        text: "What is taxable?",
        createdAtLabel: "10:16",
      },
      pendingTurn: {
        id: "a2",
        role: "assistant",
        status: "pending",
        blocks: [],
        sourceIds: [],
        followUps: [],
      },
    });

    expect(afterError.blockedConversationIds.c1).toBeUndefined();
    expect(retried.operationId).toBe("2");
    expect(retried.conversations[0]?.turns).toHaveLength(4);
  });

  it("applies a final mapped answer onto the in-flight turn", () => {
    const streaming = workspaceSessionReducer(submitState(), {
      type: "token",
      operationId: "1",
      delta: "Hello",
    });
    const final = workspaceSessionReducer(streaming, {
      type: "final",
      operationId: "1",
      payload: {
        status: "grounded",
        blocks: [{ type: "paragraph", text: "Hello — ask whenever you are ready." }],
        sources: [],
        sourceIds: [],
        sourceProvenance: "none",
        followUps: [],
      },
    });
    const assistant = final.conversations[0]?.turns[1] as AssistantTurn;

    expect(assistant.status).toBe("grounded");
    expect(assistant.sourceProvenance).toBe("none");
    expect(final.operationId).toBeNull();
  });
});
