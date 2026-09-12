import { describe, expect, it } from "vitest";

import { parseApeTranscriptMessages, parseApeTranscriptPage } from "./ape-api-client.server";

describe("APE transcript parse", () => {
  it("parses an items envelope", () => {
    const messages = parseApeTranscriptMessages({
      items: [
        {
          id: "aa0e8400-e29b-41d4-a716-446655440001",
          role: "user",
          content: "What is taxable?",
          created_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "aa0e8400-e29b-41d4-a716-446655440002",
          role: "assistant",
          text: "Income from salary.",
        },
      ],
    });

    expect(messages).toEqual([
      {
        id: "aa0e8400-e29b-41d4-a716-446655440001",
        role: "user",
        content: "What is taxable?",
        createdAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440002",
        role: "assistant",
        content: "Income from salary.",
        createdAt: null,
      },
    ]);
  });

  it("rejects malformed messages", () => {
    expect(
      parseApeTranscriptMessages({
        items: [{ id: "not-a-uuid", role: "user", content: "Hi" }],
      }),
    ).toBeUndefined();
  });

  it("preserves pagination metadata from a history page", () => {
    const first = parseApeTranscriptPage(
      {
        items: [
          {
            id: "aa0e8400-e29b-41d4-a716-446655440001",
            role: "user",
            content: "Page one",
          },
        ],
        total: 3,
        limit: 1,
        offset: 0,
      },
      1,
      0,
    );

    expect(first).toMatchObject({
      status: "ok",
      total: 3,
      limit: 1,
      offset: 0,
    });
    expect(first?.messages).toHaveLength(1);

    expect(
      parseApeTranscriptPage(
        {
          items: [
            {
              id: "not-a-uuid",
              role: "user",
              content: "Bad page",
            },
          ],
          total: 3,
        },
        1,
        1,
      ),
    ).toBeUndefined();
  });
});
