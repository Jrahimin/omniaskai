export type SourceKind = "knowledge" | "web";

export type SourceProvenance =
  | "knowledge"
  | "web"
  | "knowledge_and_web"
  | "none";

export type ConversationSource = {
  id: string;
  index: number;
  title: string;
  shortLabel: string;
  publisher?: string;
  year?: string;
  locator?: string;
  excerpt?: string;
  href?: string;
  kind?: SourceKind;
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

export type AssistantStatus =
  | "grounded"
  | "completed"
  | "insufficient"
  | "error"
  | "pending"
  | "streaming";

export type AssistantTurn = {
  id: string;
  role: "assistant";
  status: AssistantStatus;
  blocks: AnswerBlock[];
  sourceIds: string[];
  followUps: string[];
  sourceProvenance?: SourceProvenance;
  retryable?: boolean;
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

export type ConversationTurnFinal = {
  status: "grounded" | "completed" | "insufficient";
  blocks: AnswerBlock[];
  sources: ConversationSource[];
  sourceIds: string[];
  sourceProvenance: SourceProvenance;
  followUps: [];
};

export type TopicWorkspace = {
  topicSlug: string;
  exploreItemIds: string[];
  starterQuestions: string[];
};

export function isAssistantTurn(
  turn: ConversationTurn,
): turn is AssistantTurn {
  return turn.role === "assistant";
}

export function isUserTurn(turn: ConversationTurn): turn is UserTurn {
  return turn.role === "user";
}

export function isOpenAssistantTurn(turn: AssistantTurn): boolean {
  return turn.status === "pending" || turn.status === "streaming";
}

export function getLatestAssistantTurn(
  turns: ConversationTurn[],
): AssistantTurn | undefined {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];

    if (turn && isAssistantTurn(turn) && !isOpenAssistantTurn(turn)) {
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

export function citationDisplayById(sourceIds: string[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const id of sourceIds) {
    if (!map.has(id)) {
      map.set(id, map.size + 1);
    }
  }

  return map;
}

export function sourceById(
  catalog: ConversationSource[],
  id: string,
): ConversationSource | undefined {
  return catalog.find((item) => item.id === id);
}

export function mergeConversationSources(
  catalog: ConversationSource[],
  incoming: ConversationSource[],
): ConversationSource[] {
  const next = [...catalog];
  const seen = new Set(catalog.map((source) => source.id));

  for (const source of incoming) {
    if (seen.has(source.id)) {
      continue;
    }

    seen.add(source.id);
    next.push({ ...source, index: next.length + 1 });
  }

  return next;
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
        return [block.title, block.body].filter(Boolean).join("\n");
      }

      return block.items
        .map((item) => `${item.title}. ${item.body}`)
        .join("\n");
    })
    .join("\n\n");
}
