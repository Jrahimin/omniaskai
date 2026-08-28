import { describe, expect, it } from "vitest";

import { stripCitationMarkers } from "./citation-markers";

describe("stripCitationMarkers", () => {
  it("removes numbered APE citation markers without touching the rest", () => {
    expect(
      stripCitationMarkers("A resident is taxed on total income.[1] See the briefing.[2]"),
    ).toBe("A resident is taxed on total income. See the briefing.");
  });

  it("collapses leftover spaces around removed markers", () => {
    expect(stripCitationMarkers("Refunds [1] are available.")).toBe(
      "Refunds are available.",
    );
  });
});
