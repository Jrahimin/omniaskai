import type { ReactNode } from "react";

export type AnswerSegment =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | {
      type: "list";
      ordered: boolean;
      items: { n?: string; text: string }[];
    }
  | { type: "table"; headers: string[]; rows: string[][] };

export function splitAnswerSegments(text: string): AnswerSegment[] {
  const segments: AnswerSegment[] = [];
  const lines = text.split("\n");
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: { n?: string; text: string }[] } | null =
    null;
  let index = 0;

  function flushParagraph() {
    const value = paragraph.join(" ").trim();
    paragraph = [];
    if (value) {
      segments.push({ type: "paragraph", text: value });
    }
  }

  function flushList() {
    if (list && list.items.length > 0) {
      segments.push({ type: "list", ordered: list.ordered, items: list.items });
    }
    list = null;
  }

  while (index < lines.length) {
    const table = consumeTable(lines, index);

    if (table) {
      flushParagraph();
      flushList();
      segments.push(table.segment);
      index = table.nextIndex;
      continue;
    }

    const raw = lines[index] ?? "";
    index += 1;

    for (const line of explodeLine(raw)) {
      const heading = line.match(/^#{1,3}\s+(.+)$/);
      if (heading?.[1]) {
        flushParagraph();
        flushList();
        segments.push({ type: "heading", text: heading[1].trim() });
        continue;
      }

      const numbered = line.match(/^(\d+)\.\s+(.+)$/);
      if (numbered?.[1] && numbered[2]) {
        flushParagraph();
        if (!list || !list.ordered) {
          flushList();
          list = { ordered: true, items: [] };
        }
        list.items.push({ n: numbered[1], text: numbered[2].trim() });
        continue;
      }

      const bullet = line.match(/^[-*]\s+(.+)$/);
      if (bullet?.[1]) {
        flushParagraph();
        if (!list || list.ordered) {
          flushList();
          list = { ordered: false, items: [] };
        }
        list.items.push({ text: bullet[1].trim() });
        continue;
      }

      if (line.trim() === "") {
        flushParagraph();
        flushList();
        continue;
      }

      flushList();
      paragraph.push(line.trim());
    }
  }

  flushParagraph();
  flushList();
  return segments;
}

export function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

export function AnswerRichText({
  text,
  after,
  leadLabel,
}: {
  text: string;
  after?: ReactNode;
  leadLabel?: ReactNode;
}) {
  const segments = splitAnswerSegments(text);

  if (segments.length === 0) {
    return after ? <>{after}</> : null;
  }

  return (
    <>
      {segments.map((segment, index) => {
        const suffix = index === segments.length - 1 ? after : null;

        if (segment.type === "heading") {
          return (
            <h2 key={index} className="workspace-answer-heading">
              {renderInlineMarkdown(segment.text)}
              {suffix}
            </h2>
          );
        }

        if (segment.type === "list") {
          const ListTag = segment.ordered ? "ol" : "ul";

          return (
            <ListTag key={index} className="workspace-answer-list">
              {segment.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {segment.ordered ? (
                    <span className="workspace-answer-index" aria-hidden="true">
                      {item.n}
                    </span>
                  ) : (
                    <span className="workspace-answer-bullet" aria-hidden="true" />
                  )}
                  <span>
                    {renderInlineMarkdown(item.text)}
                    {itemIndex === segment.items.length - 1 ? suffix : null}
                  </span>
                </li>
              ))}
            </ListTag>
          );
        }

        if (segment.type === "table") {
          return (
            <div key={index} className="workspace-answer-table-wrap">
              <table className="workspace-answer-table">
                <thead>
                  <tr>
                    {segment.headers.map((header, headerIndex) => (
                      <th key={headerIndex} scope="col">
                        {renderInlineMarkdown(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {segment.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{renderInlineMarkdown(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {suffix}
            </div>
          );
        }

        const copy = (
          <>
            {renderInlineMarkdown(segment.text)} {suffix}
          </>
        );

        if (leadLabel && index === 0 && segment.text.length < 280) {
          return (
            <div key={index} className="workspace-answer-lead">
              <p className="workspace-answer-lead-label">{leadLabel}</p>
              <p className="workspace-answer-copy">{copy}</p>
            </div>
          );
        }

        return (
          <p key={index} className="workspace-answer-copy">
            {copy}
          </p>
        );
      })}
    </>
  );
}

function consumeTable(
  lines: string[],
  start: number,
): { segment: Extract<AnswerSegment, { type: "table" }>; nextIndex: number } | null {
  if (!isPipeRow(lines[start])) {
    return null;
  }

  let end = start;
  while (end < lines.length && isPipeRow(lines[end])) {
    end += 1;
  }

  const block = lines.slice(start, end);
  if (block.length < 2) {
    return null;
  }

  const headers = splitCells(block[0] ?? "");
  const separator = block[1] && isTableSeparator(block[1]) ? 1 : 0;
  const body = block.slice(separator === 1 ? 2 : 1).filter((line) => !isTableSeparator(line));

  if (headers.length === 0 || (separator === 0 && body.length === 0)) {
    return null;
  }

  return {
    segment: {
      type: "table",
      headers,
      rows: body.map(splitCells),
    },
    nextIndex: end,
  };
}

function isPipeRow(line: string | undefined): boolean {
  if (!line) {
    return false;
  }

  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.includes("|", 1);
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  return /^\|?[\s:|-]+\|[\s:|-]+$/.test(trimmed) && /-{2,}/.test(trimmed);
}

function splitCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function explodeLine(line: string): string[] {
  const trimmed = line.trim();

  if (!trimmed) {
    return [""];
  }

  if (/^\d+\.\s/.test(trimmed) && /\s+\d+\.\s/.test(trimmed)) {
    return trimmed
      .split(/(?=\d+\.\s)/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [trimmed];
}
