import { describe, expect, it } from "vitest";

import { mapApeDoneToFinal } from "./ape-to-omni-mapper";
import { asApeDoneEvent, type ApeDoneEvent } from "./ape-stream-events";

const ASSISTANT_MESSAGE_ID = "aa0e8400-e29b-41d4-a716-446655440005";

const knowledgeCitation = {
  chunk_id: "770e8400-e29b-41d4-a716-446655440002",
  filename: "policy-handbook.pdf",
  source_title: "Income Tax Ordinance, 1984",
  source_kind: "knowledge" as const,
  excerpt: "Refunds are available within 30 days of purchase.",
  page_number: 4,
};

const webCitation = {
  filename: "",
  source_kind: "web" as const,
  web_title: "NBR briefing",
  web_url: "https://nbr.gov.bd/guide",
  web_retrieved_at: "2026-04-02T10:00:00Z",
  web_provider: "example-search",
  excerpt: "A resident is taxed on total income.",
};

function done(overrides: Partial<ApeDoneEvent> = {}): ApeDoneEvent {
  return {
    event: "done",
    assistant_message_id: ASSISTANT_MESSAGE_ID,
    citations: [],
    claims: [],
    grounded: true,
    insufficient_evidence_reason: null,
    source_provenance: "none",
    ...overrides,
  };
}

describe("mapApeDoneToFinal", () => {
  it("maps live knowledge/web fields and preserves source_provenance", () => {
    const mapped = mapApeDoneToFinal(
      "Refunds are available within 30 days of purchase.\n\nSee the briefing for residency.",
      done({
        citations: [knowledgeCitation, webCitation],
        claims: [
          {
            claim_id: "claim-1",
            text: "Refunds are available within 30 days of purchase.",
            grounded: true,
            verification: "supported",
            evidence: [{ citation_index: 1 }],
          },
        ],
        source_provenance: "knowledge_and_web",
      }),
      "answer-1",
    );

    expect(mapped.status).toBe("grounded");
    expect(mapped.sourceProvenance).toBe("knowledge_and_web");
    expect(mapped.sources).toHaveLength(2);
    expect(mapped.sources[0]?.kind).toBe("knowledge");
    expect(mapped.sources[0]?.href).toBeUndefined();
    expect(mapped.sources[1]).toMatchObject({
      id: "source:answer-1:2",
      href: "https://nbr.gov.bd/guide",
      kind: "web",
      publisher: "nbr.gov.bd",
      shortLabel: "nbr.gov.bd",
    });
    expect(mapped.sources[1]?.year).toBeUndefined();
    expect(mapped.sources[1]?.publisher).not.toBe("example-search");
    expect(webCitation).not.toHaveProperty("chunk_id");
    expect(webCitation).not.toHaveProperty("document_id");
    expect(webCitation).not.toHaveProperty("project_id");
    expect(mapped.blocks[0]).toMatchObject({
      type: "paragraph",
      citationIds: ["source:answer-1:1"],
    });
  });

  it("does not invent knowledge metadata", () => {
    const mapped = mapApeDoneToFinal(
      "A short note.",
      done({
        citations: [
          {
            chunk_id: "770e8400-e29b-41d4-a716-446655440002",
            filename: "note.pdf",
            source_kind: "knowledge",
          },
        ],
        source_provenance: "knowledge",
      }),
      "answer-1",
    );

    expect(mapped.sources[0]?.publisher).toBeUndefined();
    expect(mapped.sources[0]?.year).toBeUndefined();
    expect(mapped.sources[0]?.locator).toBeUndefined();
    expect(mapped.sources[0]?.excerpt).toBeUndefined();
    expect(mapped.sources[0]?.href).toBeUndefined();
  });

  it("classifies insufficient evidence from the reason field", () => {
    const mapped = mapApeDoneToFinal(
      "This library does not cover that film.",
      done({
        grounded: false,
        insufficient_evidence_reason: "no_retrieval_results",
        source_provenance: "none",
      }),
      "answer-1",
    );

    expect(mapped.status).toBe("insufficient");
    expect(mapped.blocks[0]).toMatchObject({
      type: "insufficient",
      title: "This library does not cover that film.",
    });
    expect(mapped.sourceIds).toEqual([]);
  });

  it("keeps conversational replies as completed answers", () => {
    const mapped = mapApeDoneToFinal(
      "Hello — ask whenever you are ready.",
      done({ grounded: false, source_provenance: "none" }),
      "answer-1",
    );

    expect(mapped.status).toBe("completed");
    expect(mapped.sourceProvenance).toBe("none");
    expect(mapped.sourceIds).toEqual([]);
    expect(mapped.blocks[0]).toMatchObject({
      type: "paragraph",
      text: "Hello — ask whenever you are ready.",
    });
  });

  it("skips ambiguous claim-to-paragraph citation chips", () => {
    const mapped = mapApeDoneToFinal(
      "Refunds are available within 30 days of purchase.\n\nRefunds are available within 30 days of purchase.",
      done({
        citations: [knowledgeCitation],
        claims: [
          {
            claim_id: "claim-1",
            text: "Refunds are available within 30 days of purchase.",
            grounded: true,
            verification: "supported",
            evidence: [{ citation_index: 1 }],
          },
        ],
        source_provenance: "knowledge",
      }),
      "answer-1",
    );

    expect(
      mapped.blocks[0]?.type === "paragraph" &&
        mapped.blocks[0].citationIds,
    ).toBeUndefined();
    expect(mapped.sourceIds).toEqual(["source:answer-1:1"]);
  });

  it("scopes identical citation URLs to their answer snapshots", () => {
    const first = mapApeDoneToFinal(
      "First answer.",
      done({ citations: [webCitation], source_provenance: "web" }),
      "answer-1",
    );
    const second = mapApeDoneToFinal(
      "Second answer.",
      done({
        citations: [{ ...webCitation, excerpt: "A newer snapshot." }],
        source_provenance: "web",
      }),
      "answer-2",
    );

    expect(first.sources[0]?.id).toBe("source:answer-1:1");
    expect(second.sources[0]?.id).toBe("source:answer-2:1");
    expect(second.sources[0]?.excerpt).toBe("A newer snapshot.");
  });

  it("classifies grounded vs completed from APE grounded", () => {
    const grounded = mapApeDoneToFinal(
      "A resident is taxed on total income.",
      done({
        grounded: true,
        citations: [knowledgeCitation],
        source_provenance: "knowledge",
      }),
      "answer-1",
    );
    const completed = mapApeDoneToFinal(
      "A resident is taxed on total income.",
      done({
        grounded: false,
        citations: [webCitation],
        source_provenance: "web",
      }),
      "answer-2",
    );
    const insufficientWins = mapApeDoneToFinal(
      "This library does not cover that film.",
      done({
        grounded: true,
        insufficient_evidence_reason: "no_retrieval_results",
        source_provenance: "none",
      }),
      "answer-3",
    );

    expect(grounded.status).toBe("grounded");
    expect(completed.status).toBe("completed");
    expect(completed.sources[0]?.publisher).toBe("nbr.gov.bd");
    expect(insufficientWins.status).toBe("insufficient");
  });

  it("accepts web citations that only carry web_* fields plus required filename", () => {
    expect("chunk_id" in webCitation).toBe(false);
    expect("document_id" in webCitation).toBe(false);
    expect("project_id" in webCitation).toBe(false);
    expect(
      asApeDoneEvent(
        done({
          citations: [webCitation],
          grounded: false,
          source_provenance: "web",
        }),
      )?.citations[0],
    ).toEqual(webCitation);
  });

  it("strips citation markers from displayed text after claim matching", () => {
    const mapped = mapApeDoneToFinal(
      "Refunds are available within 30 days of purchase.[1]",
      done({
        citations: [knowledgeCitation],
        claims: [
          {
            claim_id: "claim-1",
            text: "Refunds are available within 30 days of purchase.",
            grounded: true,
            verification: "supported",
            evidence: [{ citation_index: 1 }],
          },
        ],
        source_provenance: "knowledge",
      }),
      "answer-1",
    );

    expect(mapped.blocks[0]).toMatchObject({
      type: "paragraph",
      text: "Refunds are available within 30 days of purchase.",
      citationIds: ["source:answer-1:1"],
    });
    expect(mapped.blocks[0]?.type === "paragraph" && mapped.blocks[0].text).not.toContain("[1]");
  });
});
