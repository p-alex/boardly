import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UserLockChecker } from "./UserLockChecker";
import type { User } from "../../../../../generated/prisma_client/client.js";

describe("UserLockChecker", () => {
  const NOW = new Date("2026-02-25T12:00:00.000Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createUser = (hardLockUntil: Date | null): User =>
    ({
      hard_lock_until: hardLockUntil,
    }) as User;

  describe("isLocked()", () => {
    it("returns false if hard_lock_until is null", () => {
      const checker = new UserLockChecker();
      const user = createUser(null);

      expect(checker.isLocked(user)).toBe(false);
    });

    it("returns true if hard_lock_until is in the future", () => {
      const checker = new UserLockChecker();
      const user = createUser(new Date(NOW + 60_000)); // +1 min

      expect(checker.isLocked(user)).toBe(true);
    });

    it("returns false if hard_lock_until is in the past", () => {
      const checker = new UserLockChecker();
      const user = createUser(new Date(NOW - 60_000)); // -1 min

      expect(checker.isLocked(user)).toBe(false);
    });
  });

  describe("getHardLockDate()", () => {
    it("returns a date exactly 24h in the future", () => {
      const checker = new UserLockChecker();

      const result = checker.getHardLockDate();

      const expected = NOW + 1000 * 60 * 60 * 24;

      expect(result.getTime()).toBe(expected);
    });
  });
});
