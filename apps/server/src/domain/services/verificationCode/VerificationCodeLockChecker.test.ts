import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VerificationCodeLockChecker } from "./VerificationCodeLockChecker";

describe("VerificationCodeLockChecker", () => {
  const NOW = new Date("2026-02-25T12:00:00.000Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("getLockDuration returns a date 10 minutes in the future", () => {
    const checker = new VerificationCodeLockChecker();
    const result = checker.getLockDuration();

    const expected = new Date(NOW + 1000 * 60 * 10);
    expect(result.getTime()).toBe(expected.getTime());
  });
});
