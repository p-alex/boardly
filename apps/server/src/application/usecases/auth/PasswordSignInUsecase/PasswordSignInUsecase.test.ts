import { describe, it, expect, vi, Mocked, Mock } from "vitest";
import { PasswordSignInUsecase } from "./PasswordSignInUsecase";
import ValidationException from "../../../../exceptions/ValidationException";
import LockException from "../../../../exceptions/LockException";
import { UserBuilder } from "../../../../__testEntityBuilders__";
import { userPasswordAuthFixtures, authSessionFixture } from "../../../../__fixtures__";
import { PrismaTsx } from "../../../services";
import { PrismaClient } from "../../../../../generated/prisma_client/client";
import { UserEmailFinderService } from "../../../services/user/UserEmailFinderService";
import { UserPasswordValidatorService } from "../../../services/auth/UserPasswordValidatorService/UserPasswordValidatorService";
import { RotatePasswordPepperService } from "../../../services/auth/RotatePasswordPepperService/RotatePasswordPepperService";
import { CreateAuthSessionService } from "../../../services/authSession/CreateAuthSessionService/CreateAuthSessionService";
import { UserLockChecker } from "../../../../domain/services/user/UserLockChecker/UserLockChecker";

const input = { email: "email@email.com", password: "password" };

function createSut() {
  const prismaTsx = {
    userPasswordAuth: {
      findUnique: vi.fn().mockResolvedValue(userPasswordAuthFixtures.mockUserPasswordAuthMock),
    },
  } as unknown as Mocked<PrismaTsx>;

  const prisma = {
    $transaction: vi.fn((cb) => cb(prismaTsx)),
  } as unknown as Mocked<PrismaClient>;

  const userEmailFinderService = {
    execute: vi.fn().mockResolvedValue({
      user: new UserBuilder().build(),
      foundWithInactiveSecret: false,
    }),
  } as unknown as Mocked<UserEmailFinderService>;

  const userPasswordValidatorService = {
    validate: vi.fn().mockResolvedValue({ success: true, validPepperVersion: "V2" }),
  } as unknown as Mocked<UserPasswordValidatorService>;

  const rotatePasswordPepperService = {
    execute: vi.fn(),
  } as unknown as Mocked<RotatePasswordPepperService>;

  const createAuthSessionService = {
    execute: vi.fn().mockResolvedValue({
      authSession: authSessionFixture,
      refreshToken: "refreshToken",
    }),
  } as unknown as Mocked<CreateAuthSessionService>;

  const userLockChecker = {
    isLocked: vi.fn().mockReturnValue(false),
  } as unknown as Mocked<UserLockChecker>;

  const getMinutesUntilDate = vi.fn().mockReturnValue(10);

  const usecase = new PasswordSignInUsecase(
    prisma,
    userEmailFinderService,
    userPasswordValidatorService,
    rotatePasswordPepperService,
    createAuthSessionService,
    userLockChecker,
    getMinutesUntilDate,
  );

  return {
    usecase,
    prismaTsx,
    userEmailFinderService,
    userPasswordValidatorService,
    rotatePasswordPepperService,
    createAuthSessionService,
    userLockChecker,
  };
}

describe("PasswordSignInUsecase", () => {
  it("throws if user not found", async () => {
    const { usecase, userEmailFinderService } = createSut();

    userEmailFinderService.execute.mockResolvedValue({
      user: null,
      foundWithInactiveSecret: false,
    });

    await expect(usecase.execute(input)).rejects.toThrow(ValidationException);
  });

  it("throws if user is locked", async () => {
    const { usecase, userEmailFinderService, userLockChecker } = createSut();

    userEmailFinderService.execute.mockResolvedValue({
      user: new UserBuilder().withLockedAccount(new Date()).build(),
      foundWithInactiveSecret: false,
    });

    userLockChecker.isLocked.mockReturnValue(true);

    await expect(usecase.execute(input)).rejects.toThrow(LockException);
  });

  it("returns verify flag when email not verified", async () => {
    const { usecase, userEmailFinderService } = createSut();

    userEmailFinderService.execute.mockResolvedValue({
      user: new UserBuilder().withUnverifiedEmail().build(),
      foundWithInactiveSecret: false,
    });

    const result = await usecase.execute(input);

    expect(result).toEqual({
      refreshToken: "",
      shouldVerifyEmail: true,
    });
  });

  it("throws if password invalid", async () => {
    const { usecase, userPasswordValidatorService } = createSut();

    userPasswordValidatorService.validate.mockResolvedValue({ success: false });

    await expect(usecase.execute(input)).rejects.toThrow(ValidationException);
  });

  it("throws if user password auth is not found", async () => {
    const { usecase, prismaTsx } = createSut();

    (prismaTsx.userPasswordAuth.findUnique as Mock).mockResolvedValue(null);

    await expect(usecase.execute(input)).rejects.toThrow(Error);
  });

  it("returns refresh token on success", async () => {
    const { usecase } = createSut();

    const result = await usecase.execute(input);

    expect(result).toEqual({
      refreshToken: "refreshToken",
      shouldVerifyEmail: false,
    });
  });
});
