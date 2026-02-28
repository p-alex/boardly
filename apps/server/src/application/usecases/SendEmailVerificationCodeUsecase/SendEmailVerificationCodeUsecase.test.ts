import { describe, it, expect, vi, beforeEach } from "vitest";
import { SendEmailVerificationCodeUsecase } from "./SendEmailVerificationCodeUsecase.js";
import NotFoundException from "../../../exceptions/NotFoundException.js";
import AlreadyExistsException from "../../../exceptions/AlreadyExistsException.js";
import { mockUser } from "../../../__fixtures__/user/mockUser.js";

// Mock dependencies
const prismaMock = {
  $transaction: vi.fn(),
};

const userEmailFinderServiceMock = {
  execute: vi.fn(),
};

const emailVerificationCodeCreatorServiceMock = {
  execute: vi.fn(),
};

const mailerMock = {
  send: vi.fn(),
};

const getEmailVerificationTemplateMock = vi.fn();

let usecase: SendEmailVerificationCodeUsecase;

beforeEach(() => {
  vi.clearAllMocks();
  usecase = new SendEmailVerificationCodeUsecase(
    prismaMock as any,
    userEmailFinderServiceMock as any,
    emailVerificationCodeCreatorServiceMock as any,
    mailerMock as any,
    getEmailVerificationTemplateMock as any,
  );
});

describe("SendEmailVerificationCodeUsecase", () => {
  it("should return true if user does not exist", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({ user: null });
    prismaMock.$transaction.mockImplementation(async (cb: any) => cb(prismaMock));

    const result = await usecase.execute({ email: "test@example.com" });

    expect(result).toBe(true);

    expect(userEmailFinderServiceMock.execute).toHaveBeenCalledWith(prismaMock, {
      email: "test@example.com",
    });
  });

  it("should return true if email is already verified", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: { ...mockUser, email_verified: true },
    });
    prismaMock.$transaction.mockImplementation(async (cb: any) => cb(prismaMock));

    const result = await usecase.execute({ email: "test@example.com" });

    expect(result).toBe(true);
  });

  it("should create verification code, send email, and return true", async () => {
    userEmailFinderServiceMock.execute.mockResolvedValue({
      user: mockUser,
    });

    emailVerificationCodeCreatorServiceMock.execute.mockResolvedValue({
      code: "123456",
    });

    getEmailVerificationTemplateMock.mockReturnValue("template content");

    prismaMock.$transaction.mockImplementation(async (cb: any) => cb(prismaMock));

    const result = await usecase.execute({ email: "test@example.com" });

    expect(result).toBe(true);
    expect(emailVerificationCodeCreatorServiceMock.execute).toHaveBeenCalledWith(prismaMock, {
      user_id: "id",
      code_type: "emailVerificationCode",
    });
    expect(mailerMock.send).toHaveBeenCalledWith("template content", "test@example.com");
  });
});
