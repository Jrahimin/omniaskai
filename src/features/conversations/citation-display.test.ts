import { describe, expect, it } from "vitest";

import { citationDisplayById } from "./conversation";

describe("citationDisplayById", () => {
  it("numbers each answer's citations from 1 without changing ids", () => {
    const first = citationDisplayById(["source:a:1", "source:a:2", "source:a:1"]);
    const second = citationDisplayById(["source:b:1", "source:b:2"]);

    expect(first.get("source:a:1")).toBe(1);
    expect(first.get("source:a:2")).toBe(2);
    expect(second.get("source:b:1")).toBe(1);
    expect(second.get("source:b:2")).toBe(2);
  });
});
