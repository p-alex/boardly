import { vi } from "vitest";
import { verificationCodeMock } from "../../../__fixtures__/verificationCode";
import { VerificationCodeFactory } from "../../../domain/factories/VerificationCodeFactory";
import { prisma } from "../../../prisma.js";

vi.mock("../../../prisma.js", () => ({
  prisma: {
    verificationCode: {
      create: vi.fn(),
    },
  },
}));

import { CreateVerificationCodeService } from "./CreateVerificationCodeService";
import { PrismaTsx } from "../index.js";

describe("CreateVerificationCodeService.ts (unit)", () => {
  let createVerificationCodeService: CreateVerificationCodeService;

  let verificationCodeFactory: VerificationCodeFactory;

  beforeEach(async () => {
    verificationCodeFactory = {
      create: vi
        .fn()
        .mockReturnValue({ rawCode: "123456", verificationCode: verificationCodeMock }),
    } as unknown as VerificationCodeFactory;

    createVerificationCodeService = new CreateVerificationCodeService(verificationCodeFactory);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("creates a new verification code", async () => {
    await createVerificationCodeService.execute(null, {
      code_type: "EMAIL_VERIFICATION",
      user_id: "user_id",
    });

    expect(verificationCodeFactory.create).toHaveBeenCalledWith({
      user_id: "user_id",
      type: "EMAIL_VERIFICATION",
    });
  });

  it("inserts the new verification code into the database", async () => {
    await createVerificationCodeService.execute(null, {
      code_type: "EMAIL_VERIFICATION",
      user_id: "user_id",
    });

    expect(prisma.verificationCode.create).toHaveBeenCalledWith({ data: verificationCodeMock });
  });

  it("returns correctly", async () => {
    const result = await createVerificationCodeService.execute(null, {
      code_type: "EMAIL_VERIFICATION",
      user_id: "user_id",
    });
    expect(result).toEqual({ rawCode: "123456", verificationCode: verificationCodeMock });
  });

  it("uses prisma transaction if provided", async () => {
    const tsxMock = { verificationCode: { create: vi.fn() } } as unknown as PrismaTsx;

    await createVerificationCodeService.execute(tsxMock, {
      code_type: "EMAIL_VERIFICATION",
      user_id: "user_id",
    });

    expect(tsxMock.verificationCode.create).toHaveBeenCalled();
  });
});
