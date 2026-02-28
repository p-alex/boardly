import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidateVerificationCodeService } from "./ValidateVerificationCodeService";
import type { UserEmailFinderService } from "../user/UserEmailFinderService.js";
import type { UserLockChecker } from "../../../domain/services/user/UserLockChecker/UserLockChecker.js";
import type { VerificationCodePolicy } from "../../../domain/services/verificationCode/VerificationCodePolicy.js";
import type { VerificationCodeHashValidator } from "../../../domain/services/verificationCode/VerificationCodeHashValidator.js";
import ValidationException from "../../../exceptions/ValidationException.js";
import TooManyRequestsException from "../../../exceptions/TooManyRequestsException.js";

describe("ValidateVerificationCodeService", () => {
  let userEmailFinderServiceMock: UserEmailFinderService;
  let userLockCheckerMock: UserLockChecker;
  let verificationCodePolicyMock: VerificationCodePolicy;
  let verificationCodeHashValidatorMock: VerificationCodeHashValidator;
  let service: ValidateVerificationCodeService;

  const mockUser = { id: "user-1", hard_lock_until: null };
  const mockCode = { code_hash: "hash123", expires_at: new Date(Date.now() + 1000 * 60) };

  beforeEach(() => {
    // Mock dependencies
    userEmailFinderServiceMock = {
      execute: vi.fn().mockResolvedValue({ user: mockUser }),
    } as unknown as UserEmailFinderService;

    userLockCheckerMock = {
      isLocked: vi.fn().mockReturnValue(false),
    } as unknown as UserLockChecker;

    verificationCodePolicyMock = {
      validateExistenceAndStatus: vi.fn(),
    } as unknown as VerificationCodePolicy;

    verificationCodeHashValidatorMock = {
      isValid: vi.fn().mockReturnValue(true),
    } as unknown as VerificationCodeHashValidator;

    service = new ValidateVerificationCodeService(
      userEmailFinderServiceMock,
      userLockCheckerMock,
      verificationCodePolicyMock,
      verificationCodeHashValidatorMock,
    );
  });

  it("throws ValidationException if user not found", async () => {
    (userEmailFinderServiceMock.execute as any).mockResolvedValue({ user: null });

    await expect(
      service.execute(null, {
        email: "test@example.com",
        code: "123456",
        code_type: "emailVerificationCode",
      }),
    ).rejects.toThrowError(ValidationException);
  });

  it("throws TooManyRequestsException if user is locked", async () => {
    (userLockCheckerMock.isLocked as any).mockReturnValue(true);

    await expect(
      service.execute(null, {
        email: "test@example.com",
        code: "123456",
        code_type: "emailVerificationCode",
      }),
    ).rejects.toThrowError(TooManyRequestsException);
  });

  it("throws ValidationException if verification code not found", async () => {
    const dbMock = { emailVerificationCode: { findUnique: vi.fn().mockResolvedValue(null) } };

    await expect(
      service.execute(dbMock as any, {
        email: "test@example.com",
        code: "123456",
        code_type: "emailVerificationCode",
      }),
    ).rejects.toThrowError(ValidationException);
  });

  it("calls VerificationCodePolicy.validateExistenceAndStatus", async () => {
    const dbMock = {
      emailVerificationCode: { findUnique: vi.fn().mockResolvedValue(mockCode) },
    };

    await service.execute(dbMock as any, {
      email: "test@example.com",
      code: "123456",
      code_type: "emailVerificationCode",
    });

    expect(verificationCodePolicyMock.validateExistenceAndStatus).toHaveBeenCalledWith(mockCode);
  });

  it("returns correct values if all checks pass", async () => {
    const dbMock = {
      emailVerificationCode: { findUnique: vi.fn().mockResolvedValue(mockCode) },
    };

    const result = await service.execute(dbMock as any, {
      email: "test@example.com",
      code: "123456",
      code_type: "emailVerificationCode",
    });

    expect(result.user).toEqual(mockUser);
    expect(result.verificationCode).toEqual(mockCode);
    expect(result.isCodeValid).toBe(true);
    expect(verificationCodeHashValidatorMock.isValid).toHaveBeenCalledWith({
      code_hash: mockCode.code_hash,
      code_raw: "123456",
      code_type: "EMAIL_VERIFICATION",
    });
  });
});
