import { describe, expect, it } from "vitest";

import { splitAnswerSegments } from "./conversation-answer-text";

describe("splitAnswerSegments", () => {
  it("keeps a plain paragraph intact", () => {
    expect(splitAnswerSegments("A resident is taxed on total income.")).toEqual([
      { type: "paragraph", text: "A resident is taxed on total income." },
    ]);
  });

  it("splits markdown headings, numbered items, and bullets", () => {
    const segments = splitAnswerSegments(
      "Intro sentence.\n\n### Scope by taxpayer status\n\n- Resident person: worldwide income\n- Non-resident person: Bangladesh-source income",
    );

    expect(segments).toEqual([
      { type: "paragraph", text: "Intro sentence." },
      { type: "heading", text: "Scope by taxpayer status" },
      {
        type: "list",
        ordered: false,
        items: [
          { text: "Resident person: worldwide income" },
          { text: "Non-resident person: Bangladesh-source income" },
        ],
      },
    ]);
  });

  it("splits numbered heads packed onto one line", () => {
    const segments = splitAnswerSegments(
      "1. **Income from employment** 2. **Income from rent** 3. **Income from agriculture**",
    );

    expect(segments[0]?.type).toBe("list");
    expect(segments[0] && segments[0].type === "list" ? segments[0].items.length : 0).toBe(3);
  });

  it("parses a markdown table instead of leaving pipe syntax", () => {
    const segments = splitAnswerSegments(
      [
        "Rates:",
        "",
        "| Head | Rate |",
        "| --- | --- |",
        "| Employment | 0–25% |",
        "| Business | **slab** |",
      ].join("\n"),
    );

    expect(segments[0]).toEqual({ type: "paragraph", text: "Rates:" });
    expect(segments[1]).toEqual({
      type: "table",
      headers: ["Head", "Rate"],
      rows: [
        ["Employment", "0–25%"],
        ["Business", "**slab**"],
      ],
    });
    expect(JSON.stringify(segments)).not.toContain("| ---");
  });

  it("leaves an incomplete pipe row as a paragraph while streaming", () => {
    expect(splitAnswerSegments("| Head | Rate |")).toEqual([
      { type: "paragraph", text: "| Head | Rate |" },
    ]);
  });
});
