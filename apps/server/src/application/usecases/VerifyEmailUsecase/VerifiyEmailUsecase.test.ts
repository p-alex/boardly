import { Mocked, vi } from "vitest";
import { ValidateVerificationCodeService } from "../../services/verificationCode/ValidateVerificationCodeService";
import { VerifyEmailUsecase } from "./VerifyEmailUsecase";
import { RateLimitVerificationCodeService } from "../../services/verificationCode/RateLimitVerificationCodeService";
import { verificationCodeFixtures } from "../../../__fixtures__/index";
import { mockUser } from "../../../__fixtures__/user";
import ValidationException from "../../../exceptions/ValidationException";
import { VerificationCode } from "../../../../generated/prisma_client/client";

describe("VerifiyEmailUsecase.ts (unit)", () => {
  let verifyEmailUsecase: VerifyEmailUsecase;

  const prismaTsxMock = {
    user: {
      update: vi.fn(),
    },
    verificationCode: {
      delete: vi.fn(),
    },
  };

  let validateVerificationCodeService: Mocked<ValidateVerificationCodeService>;
  let rateLimitVerificationCodeService: Mocked<RateLimitVerificationCodeService>;

  beforeEach(async () => {
    validateVerificationCodeService = {
      execute: vi.fn().mockResolvedValue({
        isCodeValid: true,
        verificationCode: verificationCodeFixtures.verificationCodeMock,
        user: mockUser,
      }),
    } as unknown as Mocked<ValidateVerificationCodeService>;

    rateLimitVerificationCodeService = {
      execute: vi.fn(),
    } as unknown as Mocked<RateLimitVerificationCodeService>;

    vi.doMock("../../../prisma.js", () => ({
      prisma: { $transaction: vi.fn((cb) => cb(prismaTsxMock)) },
    }));

    const { VerifyEmailUsecase } = await import("./VerifyEmailUsecase");

    verifyEmailUsecase = new VerifyEmailUsecase(
      validateVerificationCodeService,
      rateLimitVerificationCodeService,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("validates verification code", async () => {
    await verifyEmailUsecase.execute({
      code: "123456",
      email: "email@email.com",
      code_type: "EMAIL_VERIFICATION",
    });

    expect(validateVerificationCodeService.execute).toHaveBeenCalledWith(prismaTsxMock, {
      email: "email@email.com",
      code: "123456",
      code_type: "EMAIL_VERIFICATION",
    });
  });

  it("rate limits the verification code if it is not valid", async () => {
    validateVerificationCodeService.execute.mockResolvedValue({
      isCodeValid: false,
      verificationCode: verificationCodeFixtures.verificationCodeMock,
      user: mockUser,
    });

    try {
      await verifyEmailUsecase.execute({
        code: "123456",
        email: "email@email.com",
        code_type: "EMAIL_VERIFICATION",
      });
    } catch (error) {
      expect(rateLimitVerificationCodeService.execute).toHaveBeenCalledWith(null, {
        verificationCode: verificationCodeFixtures.verificationCodeMock,
      });
    }
  });

  it("throws ValidationException if code is invalid", async () => {
    validateVerificationCodeService.execute.mockResolvedValue({
      isCodeValid: false,
      verificationCode: verificationCodeFixtures.verificationCodeMock,
      user: mockUser,
    });

    await expect(
      verifyEmailUsecase.execute({
        code: "123456",
        email: "email@email.com",
        code_type: "EMAIL_VERIFICATION",
      }),
    ).rejects.toThrow(ValidationException);

    await expect(
      verifyEmailUsecase.execute({
        code: "123456",
        email: "email@email.com",
        code_type: "EMAIL_VERIFICATION",
      }),
    ).rejects.toThrow("Invalid or expired code");
  });

  it("verifies email and deletes verificaton code if code is valid", async () => {
    await verifyEmailUsecase.execute({
      code: "123456",
      email: "email@email.com",
      code_type: "EMAIL_VERIFICATION",
    });

    expect(prismaTsxMock.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { email_verified: true },
    });

    expect(prismaTsxMock.verificationCode.delete).toHaveBeenCalledWith({
      where: { id: verificationCodeFixtures.verificationCodeMock.id },
    });
  });
});
