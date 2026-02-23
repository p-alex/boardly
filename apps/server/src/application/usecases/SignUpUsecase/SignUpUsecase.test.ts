import { vi, Mocked, Mock } from "vitest";
import { UserCreatorService } from "../../services/user/UserCreatorService";
import { UserEmailFinderService } from "../../services/user/UserEmailFinderService";
import { UserEmailRotationService } from "../../services/user/UserEmailRotationService";
import { SignUpUsecase } from "../SignUpUsecase/SignUpUsecase";
import { PrismaTsx } from "../../services/index.js";
import { PrismaClient } from "../../../../generated/prisma_client/client.js";
import { mockUser } from "../../../__fixtures__/user/mockUser.js";
import AlreadyExistsException from "../../../exceptions/AlreadyExistsException.js";
import { PwnedPasswordCheckerService } from "../../services/auth/PwnedPasswordCheckerService/PwnedPasswordCheckerService.js";
import ValidationException from "../../../exceptions/ValidationException.js";
import { EmailVerificationCodeCreatorService } from "../../services/emailVerificationCode/EmailVerificationCodeCreatorService.js";

describe("SignUpUsecase.ts (unit)", () => {
  let signUpUsecase: SignUpUsecase;

  let userCreatorServiceMock: Mocked<UserCreatorService>;
  let userEmailFinderServiceMock: UserEmailFinderService;
  let userEmailRotationServiceMock: UserEmailRotationService;
  let pwnedPasswordCheckerServiceMock: Mocked<PwnedPasswordCheckerService>;
  let emailVerificationCodeCreatorServiceMock: Mocked<EmailVerificationCodeCreatorService>;

  let prismaMock: Mocked<PrismaClient>;

  let prismaTsxMock: Mocked<PrismaTsx>;

  beforeEach(() => {
    prismaTsxMock = {
      user: {
        findUnique: vi.fn(),
      },
    } as unknown as Mocked<PrismaTsx>;

    prismaMock = {
      $transaction: vi.fn(async (callback) => callback(prismaTsxMock)),
    } as unknown as Mocked<PrismaClient>;

    userCreatorServiceMock = {
      execute: vi.fn().mockResolvedValue({ createdUser: mockUser }),
    } as unknown as Mocked<UserCreatorService>;

    userEmailFinderServiceMock = {
      execute: vi.fn(),
    } as unknown as Mocked<UserEmailFinderService>;

    userEmailRotationServiceMock = {
      execute: vi.fn(),
    } as unknown as Mocked<UserEmailRotationService>;

    pwnedPasswordCheckerServiceMock = {
      execute: vi.fn(),
    } as unknown as Mocked<PwnedPasswordCheckerService>;

    emailVerificationCodeCreatorServiceMock = {
      execute: vi.fn().mockResolvedValue({ code: "code" }),
    } as unknown as Mocked<EmailVerificationCodeCreatorService>;

    signUpUsecase = new SignUpUsecase(
      userCreatorServiceMock,
      userEmailFinderServiceMock,
      userEmailRotationServiceMock,
      pwnedPasswordCheckerServiceMock,
      emailVerificationCodeCreatorServiceMock,
      prismaMock,
    );
  });

  it("throws AlreadyExistsException if a user with the  same username already exists", async () => {
    (prismaTsxMock.user.findUnique as Mock).mockResolvedValue(mockUser);

    try {
      await signUpUsecase.execute({
        email: "email@email.com",
        password: "password",
        username: "username",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AlreadyExistsException);
      if (error instanceof AlreadyExistsException) {
        expect(error.message).toBe("A user with that username already exists.");
      }
    }

    expect(prismaTsxMock.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it("throws AlreadyExistsException if a user with the same email already exists", async () => {
    (userEmailFinderServiceMock.execute as Mock).mockResolvedValue({
      user: mockUser,
      foundWithInactiveSecret: false,
    });

    await expect(
      signUpUsecase.execute({
        email: "email@email.com",
        password: "password",
        username: "username",
      }),
    ).rejects.toThrow(AlreadyExistsException);

    expect(userEmailFinderServiceMock.execute).toHaveBeenCalledTimes(1);
  });

  it("rotates email hash and encryption if a user with that email was found with an inactive hash secret without using prisma transaction", async () => {
    (userEmailFinderServiceMock.execute as Mock).mockResolvedValue({
      user: mockUser,
      foundWithInactiveSecret: true,
    });

    try {
      await signUpUsecase.execute({
        email: "email@email.com",
        password: "password",
        username: "username",
      });
    } catch (error) {}

    expect(userEmailRotationServiceMock.execute).toHaveBeenCalledWith(null, {
      email: "email@email.com",
      userId: mockUser.id,
    });

    expect(userEmailRotationServiceMock.execute).toHaveBeenCalledTimes(1);
  });

  it("throws if password has been pwned", async () => {
    pwnedPasswordCheckerServiceMock.execute.mockResolvedValue(true);

    await expect(
      signUpUsecase.execute({
        email: "email@email.com",
        password: "password",
        username: "username",
      }),
    ).rejects.toThrow(ValidationException);
  });

  it("creates the user correctly", async () => {
    const data = {
      email: "email@email.com",
      password: "password",
      username: "username",
    };

    await signUpUsecase.execute(data);

    expect(userCreatorServiceMock.execute).toHaveBeenCalledWith(prismaTsxMock, data);
    expect(userCreatorServiceMock.execute).toHaveBeenCalledTimes(1);
  });

  it("returns null", async () => {
    const result = await signUpUsecase.execute({
      email: "email@email.com",
      password: "password",
      username: "username",
    });

    expect(result).toBeNull();
  });
});
