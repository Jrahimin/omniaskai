import { stripCitationMarkers } from "../citation-markers";
import type {
  AnswerBlock,
  ConversationSource,
  ConversationTurnFinal,
} from "../conversation";
import type {
  ApeAnswerClaim,
  ApeCitationSnapshot,
  ApeDoneEvent,
  ApeSourceKind,
} from "./ape-stream-events";

export function mapApeDoneToFinal(
  content: string,
  done: ApeDoneEvent,
  sourceScope: string,
): ConversationTurnFinal {
  const sourceProvenance = done.source_provenance;

  if (done.insufficient_evidence_reason) {
    const trimmed = stripCitationMarkers(content);
    const breakIndex = trimmed.indexOf("\n");
    const title =
      breakIndex === -1 ? trimmed : trimmed.slice(0, breakIndex).trim();
    const body = breakIndex === -1 ? "" : trimmed.slice(breakIndex + 1).trim();

    return {
      status: "insufficient",
      blocks: [
        {
          type: "insufficient",
          title: title || trimmed,
          body,
        },
      ],
      sources: [],
      sourceIds: [],
      sourceProvenance,
      followUps: [],
    };
  }

  const citations = done.citations;
  const { sources, sourceByCitationIndex } = mapCitations(
    citations,
    sourceScope,
  );
  const blocks = mapContentBlocks(
    content,
    done.claims,
    sourceByCitationIndex,
  );

  return {
    status: done.grounded === true ? "grounded" : "completed",
    blocks,
    sources,
    sourceIds: sources.map((source) => source.id),
    sourceProvenance,
    followUps: [],
  };
}

function citationKind(citation: ApeCitationSnapshot): ApeSourceKind {
  return citation.source_kind ?? "knowledge";
}

function mapCitations(
  citations: ApeCitationSnapshot[],
  sourceScope: string,
): {
  sources: ConversationSource[];
  sourceByCitationIndex: (string | undefined)[];
} {
  const sources: ConversationSource[] = [];
  const sourceByCitationIndex: (string | undefined)[] = [];

  for (const [offset, citation] of citations.entries()) {
    const index = offset + 1;
    const mapped = mapCitation(
      citation,
      index,
      `source:${sourceScope}:${index}`,
    );

    sourceByCitationIndex.push(mapped?.id);

    if (!mapped) {
      continue;
    }

    sources.push(mapped);
  }

  return { sources, sourceByCitationIndex };
}

function mapCitation(
  citation: ApeCitationSnapshot,
  index: number,
  id: string,
): ConversationSource | undefined {
  const kind = citationKind(citation);

  if (kind === "web") {
    const href = safeHttpUrl(citation.web_url);
    const title =
      present(citation.web_title) ??
      hostnameOf(href) ??
      present(citation.source_title) ??
      present(citation.filename);

    if (!title && !href) {
      return undefined;
    }

    const hostname = hostnameOf(href);

    return {
      id,
      index,
      title: title ?? href ?? "Web source",
      shortLabel: hostname ?? shorten(title ?? "Web"),
      publisher: hostname,
      excerpt: present(citation.excerpt),
      href,
      kind: "web",
    };
  }

  const title =
    present(citation.source_title) ??
    present(citation.filename);

  if (!title && !citation.chunk_id) {
    return undefined;
  }

  const resolvedTitle = title ?? "Source";
  return {
    id,
    index,
    title: resolvedTitle,
    shortLabel: shorten(resolvedTitle),
    year: yearFromDate(citation.source_published_date),
    locator:
      typeof citation.page_number === "number"
        ? `p. ${citation.page_number}`
        : undefined,
    excerpt: present(citation.excerpt),
    kind: "knowledge",
  };
}

function mapContentBlocks(
  content: string,
  claims: ApeAnswerClaim[],
  sourceByCitationIndex: (string | undefined)[],
): AnswerBlock[] {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const texts = paragraphs.length > 0 ? paragraphs : content.trim() ? [content.trim()] : [];

  if (texts.length === 0) {
    return [];
  }

  return texts.map((text) => {
    const citationIds = citationIdsForParagraph(
      text,
      texts,
      claims,
      sourceByCitationIndex,
    );

    return {
      type: "paragraph" as const,
      text: stripCitationMarkers(text),
      citationIds: citationIds.length > 0 ? citationIds : undefined,
    };
  });
}

function citationIdsForParagraph(
  text: string,
  allParagraphs: string[],
  claims: ApeAnswerClaim[],
  sourceByCitationIndex: (string | undefined)[],
): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const claim of claims) {
    if (claim.grounded !== true) {
      continue;
    }

    if (claim.verification !== "supported") {
      continue;
    }

    const claimText = present(claim.text);

    if (!claimText || !text.includes(claimText)) {
      continue;
    }

    const matches = allParagraphs.filter((paragraph) =>
      paragraph.includes(claimText),
    );

    if (matches.length !== 1) {
      continue;
    }

    for (const evidence of claim.evidence ?? []) {
      const index = evidence.citation_index;

      if (typeof index !== "number" || index < 1) {
        continue;
      }

      const sourceId = sourceByCitationIndex[index - 1];

      if (!sourceId || seen.has(sourceId)) {
        continue;
      }

      seen.add(sourceId);
      ids.push(sourceId);
    }
  }

  return ids;
}

function present(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function yearFromDate(value: string | null | undefined): string | undefined {
  const raw = present(value);

  if (!raw) {
    return undefined;
  }

  const match = raw.match(/^(\d{4})/);
  return match?.[1];
}

function safeHttpUrl(value: string | null | undefined): string | undefined {
  const raw = present(value);

  if (!raw) {
    return undefined;
  }

  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function hostnameOf(href: string | undefined): string | undefined {
  if (!href) {
    return undefined;
  }

  try {
    return new URL(href).hostname;
  } catch {
    return undefined;
  }
}

function shorten(value: string): string {
  if (value.length <= 28) {
    return value;
  }

  return `${value.slice(0, 27)}…`;
}
