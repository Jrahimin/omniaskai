export type ConversationSource = {
  id: string;
  index: number;
  title: string;
  shortLabel: string;
  publisher: string;
  year?: string;
  locator: string;
  excerpt: string;
  href?: string;
};

export type AnswerListIcon =
  | "briefcase"
  | "wallet"
  | "home"
  | "trend"
  | "book"
  | "film";

export type AnswerListItem = {
  icon?: AnswerListIcon;
  title: string;
  body: string;
  citationIds?: string[];
};

export type AnswerBlock =
  | { type: "paragraph"; text: string; citationIds?: string[] }
  | { type: "heading"; text: string }
  | { type: "list"; items: AnswerListItem[] }
  | { type: "callout"; text: string }
  | { type: "formula"; text: string }
  | { type: "insufficient"; title: string; body: string };

export type UserTurn = {
  id: string;
  role: "user";
  text: string;
  createdAtLabel: string;
};

export type AssistantStatus = "grounded" | "insufficient" | "error" | "pending";

export type AssistantTurn = {
  id: string;
  role: "assistant";
  status: AssistantStatus;
  blocks: AnswerBlock[];
  sourceIds: string[];
  followUps: string[];
};

export type ConversationTurn = UserTurn | AssistantTurn;

export type ConversationBucket = "today" | "previous7Days";

export type Conversation = {
  id: string;
  title: string;
  bucket: ConversationBucket;
  happenedAtLabel: string;
  turns: ConversationTurn[];
};

export type TopicWorkspace = {
  topicSlug: string;
  defaultConversationId: string;
  conversations: Conversation[];
  sources: ConversationSource[];
  exploreItemIds: string[];
  starterQuestions: string[];
  cannedReply: Omit<AssistantTurn, "id">;
};

export function isAssistantTurn(
  turn: ConversationTurn,
): turn is AssistantTurn {
  return turn.role === "assistant";
}

export function isUserTurn(turn: ConversationTurn): turn is UserTurn {
  return turn.role === "user";
}

export function getLatestAssistantTurn(
  turns: ConversationTurn[],
): AssistantTurn | undefined {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];

    if (turn && isAssistantTurn(turn) && turn.status !== "pending") {
      return turn;
    }
  }

  return undefined;
}

export function getActiveAssistantTurn(
  turns: ConversationTurn[],
  activeAnswerId: string | null,
): AssistantTurn | undefined {
  if (activeAnswerId) {
    const match = turns.find(
      (turn) => isAssistantTurn(turn) && turn.id === activeAnswerId,
    );

    if (match && isAssistantTurn(match)) {
      return match;
    }
  }

  return getLatestAssistantTurn(turns);
}

export function getConversationSourceIds(turns: ConversationTurn[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const turn of turns) {
    if (!isAssistantTurn(turn)) {
      continue;
    }

    for (const sourceId of turn.sourceIds) {
      if (!seen.has(sourceId)) {
        seen.add(sourceId);
        ids.push(sourceId);
      }
    }
  }

  return ids;
}

export function sourcesForIds(
  catalog: ConversationSource[],
  ids: string[],
): ConversationSource[] {
  return ids.flatMap((id) => {
    const source = catalog.find((item) => item.id === id);
    return source ? [source] : [];
  });
}

export function sourceById(
  catalog: ConversationSource[],
  id: string,
): ConversationSource | undefined {
  return catalog.find((item) => item.id === id);
}

export function collectAnswerText(turn: AssistantTurn): string {
  return turn.blocks
    .map((block) => {
      if (block.type === "paragraph" || block.type === "heading") {
        return block.text;
      }

      if (block.type === "callout" || block.type === "formula") {
        return block.text;
      }

      if (block.type === "insufficient") {
        return `${block.title}\n${block.body}`;
      }

      return block.items
        .map((item) => `${item.title}. ${item.body}`)
        .join("\n");
    })
    .join("\n\n");
}
