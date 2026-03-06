import { Mock, Mocked, vi } from "vitest";

import { VerificationCodeFactory } from "../../../domain/factories/VerificationCodeFactory";
import { VerificationCodeChecker } from "../../../domain/services/verificationCode/VerificationCodeChecker";
import { prisma } from "../../../prisma.js";
import { verificationCodeFixtures } from "../../../__fixtures__";

vi.mock("../../../prisma.js", () => ({
  prisma: {
    verificationCode: {
      update: vi.fn(),
    },
  },
}));

import { RefreshVerificationCodeService } from "./RefreshVerificationCodeService";
import { PrismaTsx } from "../index.js";
import ValidationException from "../../../exceptions/ValidationException.js";
import { VerificationCode } from "../../../../generated/prisma_client/client.js";

describe("RefreshVerificationCodeService.ts (unit)", () => {
  let refreshVerificationCodeService: RefreshVerificationCodeService;

  let prismaTsxMock: Mocked<PrismaTsx>;

  let verificationCodeFactory: Mocked<VerificationCodeFactory>;
  let verificationCodeChecker: Mocked<VerificationCodeChecker>;

  beforeEach(() => {
    verificationCodeFactory = {
      create: vi.fn(),
    } as unknown as Mocked<VerificationCodeFactory>;

    verificationCodeChecker = {
      isLocked: vi.fn(),
      canResend: vi.fn(),
    } as unknown as Mocked<VerificationCodeChecker>;

    refreshVerificationCodeService = new RefreshVerificationCodeService(
      verificationCodeFactory,
      verificationCodeChecker,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("throws validation exception if code is locked", async () => {
    verificationCodeChecker.isLocked.mockReturnValue(true);

    await expect(
      refreshVerificationCodeService.execute(null, {
        user_id: "user_id",
        verificationCode: verificationCodeFixtures.verificationCodeMock,
      }),
    ).rejects.toThrow(ValidationException);

    expect(verificationCodeChecker.isLocked).toHaveBeenCalledWith(
      verificationCodeFixtures.verificationCodeMock,
    );
  });

  it("throws validation exception if code can't be resent", async () => {
    verificationCodeChecker.isLocked.mockReturnValue(false);
    verificationCodeChecker.canResend.mockReturnValue(false);

    await expect(
      refreshVerificationCodeService.execute(null, {
        user_id: "user_id",
        verificationCode: verificationCodeFixtures.verificationCodeMock,
      }),
    ).rejects.toThrow(ValidationException);

    expect(verificationCodeChecker.canResend).toHaveBeenCalledWith(
      verificationCodeFixtures.verificationCodeMock,
    );
  });

  it("creates a new verification code", async () => {
    verificationCodeChecker.isLocked.mockReturnValue(false);
    verificationCodeChecker.canResend.mockReturnValue(true);

    verificationCodeFactory.create.mockReturnValue({
      rawCode: "123456",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    await refreshVerificationCodeService.execute(null, {
      user_id: "user_id",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    expect(verificationCodeFactory.create).toHaveBeenCalledWith({
      user_id: "user_id",
      type: verificationCodeFixtures.verificationCodeMock.type,
    });

    expect(verificationCodeFactory.create).toHaveBeenCalledTimes(1);
  });

  it("updates the old verification code in the database", async () => {
    verificationCodeChecker.isLocked.mockReturnValue(false);
    verificationCodeChecker.canResend.mockReturnValue(true);

    verificationCodeFactory.create.mockReturnValue({
      rawCode: "123456",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    await refreshVerificationCodeService.execute(null, {
      user_id: "user_id",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    expect(prisma.verificationCode.update).toHaveBeenCalledWith({
      data: {
        attempts: verificationCodeFixtures.verificationCodeMock.attempts,
        code_hash: verificationCodeFixtures.verificationCodeMock.code_hash,
        expires_at: verificationCodeFixtures.verificationCodeMock.expires_at,
        last_attempt_at: verificationCodeFixtures.verificationCodeMock.last_attempt_at,
        resend_code_count: { increment: 1 },
        can_resend_at: verificationCodeFixtures.verificationCodeMock.can_resend_at,
      } as Partial<VerificationCode & { resend_code_count: { increment: number } }>,
      where: { id: verificationCodeFixtures.verificationCodeMock.id },
    });
    expect(prisma.verificationCode.update).toHaveBeenCalledTimes(1);
  });

  it("returns correctly", async () => {
    verificationCodeChecker.isLocked.mockReturnValue(false);
    verificationCodeChecker.canResend.mockReturnValue(true);

    verificationCodeFactory.create.mockReturnValue({
      rawCode: "123456",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    (prisma.verificationCode.update as Mock).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock,
    );

    const result = await refreshVerificationCodeService.execute(null, {
      user_id: "user_id",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    const expectedResult: Awaited<ReturnType<RefreshVerificationCodeService["execute"]>> = {
      rawCode: "123456",
      refreshedVerificationCode: verificationCodeFixtures.verificationCodeMock,
    };

    expect(result).toEqual(expectedResult);
  });

  it("uses tsx if provided", async () => {
    verificationCodeChecker.isLocked.mockReturnValue(false);
    verificationCodeChecker.canResend.mockReturnValue(true);

    verificationCodeFactory.create.mockReturnValue({
      rawCode: "123456",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    (prisma.verificationCode.update as Mock).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock,
    );

    prismaTsxMock = {
      verificationCode: {
        update: vi.fn(),
      },
    } as unknown as Mocked<PrismaTsx>;

    await refreshVerificationCodeService.execute(prismaTsxMock, {
      user_id: "user_id",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    expect(prismaTsxMock.verificationCode.update).toHaveBeenCalled();
    expect(prisma.verificationCode.update).not.toHaveBeenCalled();
  });
});
