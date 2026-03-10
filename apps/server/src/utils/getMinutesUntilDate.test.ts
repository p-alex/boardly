import { vi } from "vitest";
import getMinutesUntilDate from "./getMinutesUntilDate";

describe("getMinutesUntilDate.ts (unit)", () => {
  it("returns correctly", () => {
    const now = 5000;

    vi.spyOn(Date, "now").mockReturnValue(now);

    const result = getMinutesUntilDate(new Date(now + 1000 * 60 * 2));

    expect(result).toBe(2);
  });
});
