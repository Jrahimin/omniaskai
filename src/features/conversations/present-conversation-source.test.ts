import { describe, expect, it } from "vitest";

import { presentConversationSource } from "./present-conversation-source";

describe("presentConversationSource", () => {
  it("keeps a readable title and passage", () => {
    const presented = presentConversationSource({
      title: "Income Tax Ordinance, 1984",
      excerpt: "Salary is one head of income.",
      fallbackTitle: "Source document",
    });

    expect(presented.title).toBe("Income Tax Ordinance, 1984");
    expect(presented.excerpt).toBe("Salary is one head of income.");
    expect(presented.titleUnclear).toBe(false);
    expect(presented.excerptUnclear).toBe(false);
  });

  it("removes document-editor export labels from source titles", () => {
    const presented = presentConversationSource({
      title: "Microsoft Word - 3190-SRO-404",
      fallbackTitle: "Source document",
    });

    expect(presented.title).toBe("3190-SRO-404");
  });

  it("replaces a garbled title and strips tool metadata from the passage", () => {
    const presented = presentConversationSource({
      title: "†iwR÷vW© bs wW G-1",
      excerpt:
        "Basic pay is taxable. [wordlim: 200] citeturn0search12",
      href: "https://nbr.gov.bd/example.pdf",
      fallbackTitle: "Source document",
    });

    expect(presented.title).toBe("nbr.gov.bd");
    expect(presented.titleUnclear).toBe(true);
    expect(presented.excerpt).toBe("Basic pay is taxable.");
    expect(presented.excerptUnclear).toBe(false);
  });

  it("drops search age metadata and an unfinished sentence", () => {
    const presented = presentConversationSource({
      title: "Salary income note",
      excerpt:
        "Published: 1.1 years ago Salary is one head of income. Allowances that are",
      fallbackTitle: "Source document",
    });

    expect(presented.excerpt).toBe("Salary is one head of income.");
    expect(presented.excerptUnclear).toBe(false);
  });

  it("hides a passage that never becomes a complete sentence", () => {
    const presented = presentConversationSource({
      title: "Salary income note",
      excerpt: "Published: 1.1 years ago Basic pay is taxa",
      fallbackTitle: "Source document",
    });

    expect(presented.excerpt).toBeUndefined();
    expect(presented.excerptUnclear).toBe(true);
  });

  it("does not disguise a passage that is only extraction noise", () => {
    const presented = presentConversationSource({
      title: "https://nbr.gov.bd/circular",
      excerpt: "[wordlim: 200] turn0search12",
      fallbackTitle: "Source document",
    });

    expect(presented.title).toBe("Source document");
    expect(presented.excerpt).toBeUndefined();
    expect(presented.excerptUnclear).toBe(true);
  });
});
