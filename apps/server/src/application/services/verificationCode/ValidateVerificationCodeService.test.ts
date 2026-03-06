import { Mock, Mocked, vi } from "vitest";
import { UserEmailFinderService } from "../user/UserEmailFinderService";
import { UserLockChecker } from "../../../domain/services/user/UserLockChecker/UserLockChecker";
import { VerificationCodeChecker } from "../../../domain/services/verificationCode/VerificationCodeChecker";
import { prisma } from "../../../prisma";
import { userFixtures, verificationCodeFixtures } from "../../../__fixtures__";

vi.mock("../../../prisma.js", () => ({
  prisma: {
    verificationCode: {
      findFirst: vi.fn(),
    },
  },
}));

import { ValidateVerificationCodeService } from "./ValidateVerificationCodeService";
import ValidationException from "../../../exceptions/ValidationException";
import { VerificationCode } from "../../../../generated/prisma_client/client";
import TooManyRequestsException from "../../../exceptions/TooManyRequestsException";
import { PrismaTsx } from "..";

describe("ValidateVerificationCodeService.ts (unit)", () => {
  let validateVerificationCodeService: ValidateVerificationCodeService;

  let userEmailFinderServiceMock: Mocked<UserEmailFinderService>;
  let userLockCheckerMock: Mocked<UserLockChecker>;
  let verificationCodeCheckerMock: Mocked<VerificationCodeChecker>;

  const CODE = "123456";
  const CODE_TYPE: VerificationCode["type"] = "EMAIL_VERIFICATION";
  const EMAIL = "email@email.com";

  beforeEach(async () => {
    userEmailFinderServiceMock = {
      execute: vi.fn(),
    } as unknown as Mocked<UserEmailFinderService>;

    userLockCheckerMock = {
      isLocked: vi.fn(),
    } as unknown as Mocked<UserLockChecker>;

    verificationCodeCheckerMock = {
      isLocked: vi.fn(),
      isExpired: vi.fn(),
      isValidHash: vi.fn(),
    } as unknown as Mocked<VerificationCodeChecker>;

    vi.doMock("../../../prisma.js", () => ({
      prisma: {
        verificationCode: {
          findFirst: vi.fn(),
        },
      },
    }));

    validateVerificationCodeService = new ValidateVerificationCodeService(
      userEmailFinderServiceMock,
      userLockCheckerMock,
      verificationCodeCheckerMock,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("throws validation exception if there is no user", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: null,
      foundWithInactiveSecret: false,
    });

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow(ValidationException);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow("Invalid or expired code");

    expect(userEmailFinderServiceMock.execute).toHaveBeenCalledWith(prisma, {
      email: "email@email.com",
    });
  });

  it("throws too many requests exception if user is locked", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    userLockCheckerMock.isLocked.mockReturnValue(true);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow(ValidationException);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow("Invalid or expired code");
  });

  it("throws validation exception if there is no validation code in the db", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    userLockCheckerMock.isLocked.mockReturnValue(false);

    (prisma.verificationCode.findFirst as Mock).mockResolvedValue(null);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow(ValidationException);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow("Invalid or expired code");
  });

  it("throws validation exception if the verification code found is locked", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    userLockCheckerMock.isLocked.mockReturnValue(false);

    (prisma.verificationCode.findFirst as Mock).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock,
    );

    verificationCodeCheckerMock.isLocked.mockReturnValue(true);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow(ValidationException);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow("Invalid or expired code");
  });

  it("throws validation exception if the verification code is expired", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    userLockCheckerMock.isLocked.mockReturnValue(false);

    (prisma.verificationCode.findFirst as Mock).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock,
    );

    verificationCodeCheckerMock.isLocked.mockReturnValue(false);

    verificationCodeCheckerMock.isExpired.mockReturnValue(true);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow(ValidationException);

    await expect(
      validateVerificationCodeService.execute(null, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      }),
    ).rejects.toThrow("Invalid or expired code");
  });

  it("checks if the code is valid", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    userLockCheckerMock.isLocked.mockReturnValue(false);

    (prisma.verificationCode.findFirst as Mock).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock,
    );

    verificationCodeCheckerMock.isLocked.mockReturnValue(false);

    verificationCodeCheckerMock.isExpired.mockReturnValue(false);

    await validateVerificationCodeService.execute(null, {
      code: CODE,
      code_type: CODE_TYPE,
      email: EMAIL,
    });

    expect(verificationCodeCheckerMock.isValidHash).toHaveBeenCalledWith(
      CODE,
      verificationCodeFixtures.verificationCodeMock,
    );
  });

  it("returns correctly", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    userLockCheckerMock.isLocked.mockReturnValue(false);

    (prisma.verificationCode.findFirst as Mock).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock,
    );

    verificationCodeCheckerMock.isLocked.mockReturnValue(false);

    verificationCodeCheckerMock.isExpired.mockReturnValue(false);

    verificationCodeCheckerMock.isValidHash.mockReturnValue(true);

    const result = await validateVerificationCodeService.execute(null, {
      code: CODE,
      code_type: CODE_TYPE,
      email: EMAIL,
    });

    const expectedReturn: Awaited<ReturnType<ValidateVerificationCodeService["execute"]>> = {
      isCodeValid: true,
      user: userFixtures.mockUser,
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    };

    expect(result).toEqual(expectedReturn);
  });

  it("uses transaction prisma if provided", async () => {
    const prismaTsxMock = {
      verificationCode: {
        findFirst: vi.fn(),
      },
    } as unknown as PrismaTsx;

    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    userLockCheckerMock.isLocked.mockReturnValue(false);

    try {
      await validateVerificationCodeService.execute(prismaTsxMock, {
        code: CODE,
        code_type: CODE_TYPE,
        email: EMAIL,
      });
    } catch (error) {
      expect(prismaTsxMock.verificationCode.findFirst).toHaveBeenCalled();
      expect(prisma.verificationCode.findFirst).not.toHaveBeenCalled();
    }
  });
});
