import { describe, expect, it } from "vitest";

import { formatAdminTimestamp } from "./admin-timestamp";

describe("formatAdminTimestamp", () => {
  it("formats the same UTC instant regardless of local timezone", () => {
    expect(formatAdminTimestamp("2026-09-11T10:52:08.000Z")).toBe("2026-09-11 10:52:08 UTC");
  });
});
