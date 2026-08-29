import { describe, expect, it } from "vitest";

import type { ConversationSource } from "./conversation";
import {
  groupSourcesByDocument,
  sourceDocumentKey,
} from "./group-conversation-sources";

function source(
  overrides: Partial<ConversationSource> & Pick<ConversationSource, "id" | "index" | "title">,
): ConversationSource {
  return {
    shortLabel: overrides.shortLabel ?? overrides.title,
    ...overrides,
  };
}

describe("groupSourcesByDocument", () => {
  it("groups knowledge snapshots that share a document title", () => {
    const grouped = groupSourcesByDocument([
      source({
        id: "a",
        index: 1,
        title: "Income Tax Act 2023",
        locator: "p. 4",
        kind: "knowledge",
      }),
      source({
        id: "b",
        index: 4,
        title: "Income Tax Act 2023",
        locator: "p. 12",
        kind: "knowledge",
      }),
      source({
        id: "c",
        index: 2,
        title: "NBR SRO 2024",
        kind: "knowledge",
      }),
    ]);

    expect(grouped).toHaveLength(2);
    expect(grouped[0]?.title).toBe("Income Tax Act 2023");
    expect(grouped[0]?.references.map((item) => item.index)).toEqual([1, 4]);
    expect(grouped[1]?.references).toHaveLength(1);
  });

  it("groups web snapshots by href instead of title", () => {
    const grouped = groupSourcesByDocument([
      source({
        id: "w1",
        index: 1,
        title: "NBR briefing",
        href: "https://nbr.gov.bd/guide",
        kind: "web",
      }),
      source({
        id: "w2",
        index: 3,
        title: "A later title",
        href: "https://nbr.gov.bd/guide",
        kind: "web",
      }),
    ]);

    expect(grouped).toHaveLength(1);
    expect(sourceDocumentKey(grouped[0]!.references[0]!)).toBe(
      "web:https://nbr.gov.bd/guide",
    );
    expect(grouped[0]?.references).toHaveLength(2);
  });

  it("keeps distinct documents separate when titles differ", () => {
    const grouped = groupSourcesByDocument([
      source({ id: "a", index: 1, title: "Act A", kind: "knowledge" }),
      source({ id: "b", index: 2, title: "Act B", kind: "knowledge" }),
    ]);

    expect(grouped).toHaveLength(2);
  });
});
