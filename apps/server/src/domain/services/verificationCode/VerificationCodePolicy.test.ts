import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VerificationCodePolicy } from "./VerificationCodePolicy";
import ValidationException from "../../../exceptions/ValidationException.js";
import type { VerificationCode } from "./index.js";

describe("VerificationCodePolicy", () => {
  const NOW = new Date("2026-02-25T12:00:00.000Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const makeCode = (overrides?: Partial<VerificationCode>): VerificationCode =>
    ({
      lock_until: null,
      expires_at: new Date(NOW + 60_000), // default expires 1 min in future
      ...overrides,
    }) as VerificationCode;

  it("throws if code is null", () => {
    const policy = new VerificationCodePolicy();

    expect(() => policy.validateExistenceAndStatus(null)).toThrowError(ValidationException);
    expect(() => policy.validateExistenceAndStatus(null)).toThrow("Invalid or expired code");
  });

  it("throws if code is locked (lock_until in the future)", () => {
    const policy = new VerificationCodePolicy();
    const code = makeCode({ lock_until: new Date(NOW + 60_000) }); // locked 1 min ahead

    expect(() => policy.validateExistenceAndStatus(code)).toThrowError(ValidationException);
    expect(() => policy.validateExistenceAndStatus(code)).toThrow(
      "Too many failed attempts. Wait before retrying this code",
    );
  });

  it("throws if code is expired", () => {
    const policy = new VerificationCodePolicy();
    const code = makeCode({ expires_at: new Date(NOW - 60_000) }); // expired 1 min ago

    expect(() => policy.validateExistenceAndStatus(code)).toThrowError(ValidationException);
    expect(() => policy.validateExistenceAndStatus(code)).toThrow("Invalid or expired code");
  });

  it("does not throw if code is valid and not locked", () => {
    const policy = new VerificationCodePolicy();
    const code = makeCode(); // expires in future, no lock

    expect(() => policy.validateExistenceAndStatus(code)).not.toThrow();
  });
});
