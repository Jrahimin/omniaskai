import type {
  AssistantTurn,
  Conversation,
  ConversationSource,
  ConversationTurn,
  ConversationTurnFinal,
} from "./conversation";
import { isAssistantTurn, mergeConversationSources } from "./conversation";

export type WorkspaceSessionState = {
  conversations: Conversation[];
  sources: ConversationSource[];
  activeConversationId: string | null;
  continuationTokens: Record<string, string>;
  blockedConversationIds: Record<string, true>;
  operationId: string | null;
  inFlightAssistantId: string | null;
};

export const emptyWorkspaceSession: WorkspaceSessionState = {
  conversations: [],
  sources: [],
  activeConversationId: null,
  continuationTokens: {},
  blockedConversationIds: {},
  operationId: null,
  inFlightAssistantId: null,
};

export type WorkspaceSessionAction =
  | {
      type: "submit";
      operationId: string;
      conversationId: string;
      title: string;
      happenedAtLabel: string;
      userTurn: ConversationTurn;
      pendingTurn: AssistantTurn;
    }
  | { type: "conversation"; operationId: string; continuationToken: string }
  | { type: "token"; operationId: string; delta: string }
  | { type: "final"; operationId: string; payload: ConversationTurnFinal }
  | { type: "error"; operationId: string; retryable: boolean }
  | { type: "select-conversation"; conversationId: string }
  | { type: "new-conversation" };

export function workspaceSessionReducer(
  state: WorkspaceSessionState,
  action: WorkspaceSessionAction,
): WorkspaceSessionState {
  switch (action.type) {
    case "submit":
      return submitTurn(state, action);
    case "conversation":
      if (action.operationId !== state.operationId) {
        return state;
      }

      if (!state.activeConversationId) {
        return state;
      }

      return {
        ...state,
        continuationTokens: {
          ...state.continuationTokens,
          [state.activeConversationId]: action.continuationToken,
        },
      };
    case "token":
      if (action.operationId !== state.operationId) {
        return state;
      }

      return mapInFlightAssistant(state, (turn) => appendStreamingDelta(turn, action.delta));
    case "final":
      if (action.operationId !== state.operationId) {
        return state;
      }

      return {
        ...mapInFlightAssistant(state, (turn) => ({
          ...turn,
          status: action.payload.status,
          blocks: action.payload.blocks,
          sourceIds: action.payload.sourceIds,
          followUps: action.payload.followUps,
          sourceProvenance: action.payload.sourceProvenance,
          retryable: undefined,
        })),
        sources: mergeConversationSources(state.sources, action.payload.sources),
        operationId: null,
        inFlightAssistantId: null,
      };
    case "error":
      if (action.operationId !== state.operationId) {
        return state;
      }

      return failInFlight(state, action.retryable);
    case "select-conversation":
      return {
        ...failInFlight(state, false),
        activeConversationId: action.conversationId,
        operationId: null,
        inFlightAssistantId: null,
      };
    case "new-conversation":
      return {
        ...failInFlight(state, false),
        activeConversationId: null,
        operationId: null,
        inFlightAssistantId: null,
      };
    default:
      return state;
  }
}

function submitTurn(
  state: WorkspaceSessionState,
  action: Extract<WorkspaceSessionAction, { type: "submit" }>,
): WorkspaceSessionState {
  if (state.blockedConversationIds[action.conversationId]) {
    return state;
  }

  const existing = state.conversations.find(
    (item) => item.id === action.conversationId,
  );
  const turns = [
    ...(existing?.turns ?? []),
    action.userTurn,
    action.pendingTurn,
  ];
  const conversation: Conversation = existing
    ? {
        ...existing,
        turns,
        happenedAtLabel: action.happenedAtLabel,
      }
    : {
        id: action.conversationId,
        title: truncateTitle(action.title),
        bucket: "today",
        happenedAtLabel: action.happenedAtLabel,
        turns,
      };
  const conversations = existing
    ? state.conversations.map((item) =>
        item.id === conversation.id ? conversation : item,
      )
    : [conversation, ...state.conversations];

  return {
    ...state,
    conversations,
    activeConversationId: action.conversationId,
    operationId: action.operationId,
    inFlightAssistantId: action.pendingTurn.id,
  };
}

function failInFlight(
  state: WorkspaceSessionState,
  retryable: boolean,
): WorkspaceSessionState {
  if (!state.operationId || !state.inFlightAssistantId) {
    return {
      ...state,
      operationId: null,
      inFlightAssistantId: null,
    };
  }

  const activeConversationId = state.activeConversationId;

  return {
    ...mapInFlightAssistant(state, (turn) => ({
      ...turn,
      status: "error",
      blocks: [],
      sourceIds: [],
      followUps: [],
      retryable,
    })),
    blockedConversationIds:
      !retryable && activeConversationId
        ? {
            ...state.blockedConversationIds,
            [activeConversationId]: true,
          }
        : state.blockedConversationIds,
    operationId: null,
    inFlightAssistantId: null,
  };
}

function mapInFlightAssistant(
  state: WorkspaceSessionState,
  update: (turn: AssistantTurn) => AssistantTurn,
): WorkspaceSessionState {
  const assistantId = state.inFlightAssistantId;

  if (!assistantId || !state.activeConversationId) {
    return state;
  }

  return {
    ...state,
    conversations: state.conversations.map((conversation) => {
      if (conversation.id !== state.activeConversationId) {
        return conversation;
      }

      return {
        ...conversation,
        turns: conversation.turns.map((turn) => {
          if (!isAssistantTurn(turn) || turn.id !== assistantId) {
            return turn;
          }

          return update(turn);
        }),
      };
    }),
  };
}

function appendStreamingDelta(turn: AssistantTurn, delta: string): AssistantTurn {
  const current =
    turn.blocks[0]?.type === "paragraph" ? turn.blocks[0].text : "";

  return {
    ...turn,
    status: "streaming",
    blocks: [{ type: "paragraph", text: current + delta }],
    sourceIds: [],
    followUps: [],
    retryable: undefined,
  };
}

function truncateTitle(title: string): string {
  const trimmed = title.trim();

  if (trimmed.length <= 80) {
    return trimmed;
  }

  return `${trimmed.slice(0, 79)}…`;
}
