import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { RateLimitVerificationCodeService } from "./RateLimitVerificationCodeService";
import type { UserLockChecker } from "../../../domain/services/user/UserLockChecker/UserLockChecker.js";
import type { VerificationCodeLockChecker } from "../../../domain/services/verificationCode/VerificationCodeLockChecker.js";
import type { VerificationCode } from "../../../domain/services/verificationCode/index.js";
import { prisma } from "../../../prisma.js";

vi.mock("../../../prisma.js", () => ({
  prisma: {
    emailVerificationCode: {
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

describe("RateLimitVerificationCodeService", () => {
  const NOW = new Date("2026-02-25T12:00:00.000Z").getTime();
  let userLockCheckerMock: UserLockChecker;
  let verificationCodeLockCheckerMock: VerificationCodeLockChecker;
  let service: RateLimitVerificationCodeService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    // Reset mocks
    vi.clearAllMocks();

    userLockCheckerMock = {
      getHardLockDate: vi.fn().mockReturnValue(new Date(NOW + 1000 * 60 * 60 * 24)),
    } as unknown as UserLockChecker;

    verificationCodeLockCheckerMock = {
      getLockDuration: vi.fn().mockReturnValue(new Date(NOW + 1000 * 60 * 10)),
    } as unknown as VerificationCodeLockChecker;

    service = new RateLimitVerificationCodeService(
      userLockCheckerMock,
      verificationCodeLockCheckerMock,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const makeVerificationCode = (overrides?: Partial<VerificationCode>) =>
    ({
      id: "code-1",
      user_id: "user-1",
      attempts: 0,
      last_attempt_at: new Date(NOW),
      lock_until: null,
      ...overrides,
    }) as VerificationCode;

  it("increments attempts without locking if below threshold", async () => {
    const code = makeVerificationCode({ attempts: 3 });
    (prisma.emailVerificationCode.update as Mock).mockResolvedValueOnce({ ...code, attempts: 4 });

    const result = await service.execute(prisma as any, {
      verificationCode: code,
      code_type: "emailVerificationCode",
    });

    expect(prisma.emailVerificationCode.update).toHaveBeenCalledTimes(1);
    expect(result.updatedVerificationCode.attempts).toBe(4);
  });

  it("locks verification code if attempts reach code threshold", async () => {
    const code = makeVerificationCode({ attempts: 5 });
    (prisma.emailVerificationCode.update as Mock)
      .mockResolvedValueOnce({ ...code, attempts: 6 }) // first increment
      .mockResolvedValueOnce({ ...code, attempts: 6, lock_until: new Date(NOW + 1000 * 60 * 10) }); // lock applied

    const result = await service.execute(prisma as any, {
      verificationCode: code,
      code_type: "emailVerificationCode",
    });

    expect(verificationCodeLockCheckerMock.getLockDuration).toHaveBeenCalled();
    expect(result.updatedVerificationCode.lock_until?.getTime()).toBe(NOW + 1000 * 60 * 10);
  });

  it("locks user if attempts reach user threshold", async () => {
    const code = makeVerificationCode({ attempts: 10 });
    (prisma.emailVerificationCode.update as Mock)
      .mockResolvedValueOnce({ ...code, attempts: 11 }) // increment
      .mockResolvedValueOnce({ ...code, attempts: 11, lock_until: new Date(NOW + 1000 * 60 * 10) }); // code lock applied

    (prisma.user.update as Mock).mockResolvedValueOnce({
      id: "user-1",
      hard_lock_until: new Date(NOW + 1000 * 60 * 60 * 24),
    });

    await service.execute(prisma as any, {
      verificationCode: code,
      code_type: "emailVerificationCode",
    });

    expect(userLockCheckerMock.getHardLockDate).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      data: { hard_lock_until: new Date(NOW + 1000 * 60 * 60 * 24) },
      where: { id: "user-1" },
    });
  });
});
