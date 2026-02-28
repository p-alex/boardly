import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VerificationCodeRateLimiter } from "./VerificationCodeRateLimiter";
import type { VerificationCode } from "./index.js";

describe("VerificationCodeRateLimiter", () => {
  const NOW = new Date("2026-02-25T12:00:00.000Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const makeCode = (attempts: number): VerificationCode =>
    ({
      attempts,
    }) as VerificationCode;

  it("does not lock if attempts are below threshold", () => {
    const limiter = new VerificationCodeRateLimiter();
    const code = makeCode(3); // below default threshold 5

    const result = limiter.limit(code);

    expect(result.lock_until).toBeUndefined();
  });

  it("locks if attempts equal threshold", () => {
    const limiter = new VerificationCodeRateLimiter();
    const code = makeCode(5); // at threshold

    const result = limiter.limit(code);

    expect(result.lock_until).toBeInstanceOf(Date);
    expect(result.lock_until?.getTime()).toBe(NOW + 1000 * 60 * 10);
  });

  it("locks if attempts above threshold", () => {
    const limiter = new VerificationCodeRateLimiter();
    const code = makeCode(7); // above threshold

    const result = limiter.limit(code);

    expect(result.lock_until).toBeInstanceOf(Date);
    expect(result.lock_until?.getTime()).toBe(NOW + 1000 * 60 * 10);
  });

  it("respects custom threshold and duration", () => {
    const limiter = new VerificationCodeRateLimiter();
    const code = makeCode(2);

    const customThreshold = 2;
    const customDuration = 1000 * 60 * 5; // 5 minutes

    const result = limiter.limit(code, customThreshold, customDuration);

    expect(result.lock_until).toBeInstanceOf(Date);
    expect(result.lock_until?.getTime()).toBe(NOW + customDuration);
  });
});
