import type { ConversationSource, SourceKind } from "./conversation";

export type SourceDocumentGroup = {
  key: string;
  title: string;
  kind?: SourceKind;
  href?: string;
  publisher?: string;
  references: ConversationSource[];
};

export function sourceDocumentKey(source: ConversationSource): string {
  if (source.kind === "web") {
    return `web:${source.href ?? source.title}`;
  }

  return `knowledge:${source.title}`;
}

export function groupSourcesByDocument(
  sources: ConversationSource[],
): SourceDocumentGroup[] {
  const groups: SourceDocumentGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const source of sources) {
    const key = sourceDocumentKey(source);
    const existing = indexByKey.get(key);

    if (existing === undefined) {
      indexByKey.set(key, groups.length);
      groups.push({
        key,
        title: source.title,
        kind: source.kind,
        href: source.href,
        publisher: source.publisher,
        references: [source],
      });
      continue;
    }

    groups[existing]?.references.push(source);
  }

  return groups;
}
