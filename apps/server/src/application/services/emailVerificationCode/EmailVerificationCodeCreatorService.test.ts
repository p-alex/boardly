import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailVerificationCodeCreatorService } from "./EmailVerificationCodeCreatorService";
import type { CryptoUtil } from "@boardly/shared/utils";
import type { EmailVerificationCodeFactory } from "../../../domain/EmailVerificationCodeFactory";
import { prisma } from "../../../prisma";
import { emailVerificationFixtures } from "../../../__fixtures__/index.js";

vi.mock("../../../prisma", () => ({
  prisma: {
    emailVerificationCode: {
      create: vi.fn(),
    },
  },
}));

describe("EmailVerificationCodeCreatorService", () => {
  let cryptoUtil: CryptoUtil;
  let factory: EmailVerificationCodeFactory;
  let service: EmailVerificationCodeCreatorService;

  beforeEach(() => {
    cryptoUtil = {
      generateCode: vi.fn(),
    } as unknown as CryptoUtil;

    factory = {
      create: vi.fn(),
    } as unknown as EmailVerificationCodeFactory;

    service = new EmailVerificationCodeCreatorService(cryptoUtil, factory);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should generate code, create entity, persist it and return result", async () => {
    const user_id = "user-123";
    const generatedCode = "ABCDEFGH";

    vi.mocked(cryptoUtil.generateCode).mockReturnValue(generatedCode);
    vi.mocked(factory.create).mockReturnValue(emailVerificationFixtures.emailVerificationCodeMock);
    vi.mocked(prisma.emailVerificationCode.create).mockResolvedValue(
      emailVerificationFixtures.emailVerificationCodeMock as any,
    );

    const result = await service.execute(null, { user_id });

    expect(cryptoUtil.generateCode).toHaveBeenCalledWith(8);

    expect(factory.create).toHaveBeenCalledWith({
      user_id,
      code: generatedCode,
    });

    expect(prisma.emailVerificationCode.create).toHaveBeenCalledWith({
      data: emailVerificationFixtures.emailVerificationCodeMock,
    });

    expect(result).toEqual({
      code: generatedCode,
      emailVerificationCode: emailVerificationFixtures.emailVerificationCodeMock,
    });
  });

  it("should use provided transaction client instead of prisma", async () => {
    const tx = {
      emailVerificationCode: {
        create: vi.fn(),
      },
    };

    const user_id = "user-123";
    const generatedCode = "ABCDEFGH";

    vi.mocked(cryptoUtil.generateCode).mockReturnValue(generatedCode);
    vi.mocked(factory.create).mockReturnValue({ test: true } as any);

    await service.execute(tx as any, { user_id });

    expect(tx.emailVerificationCode.create).toHaveBeenCalled();
    expect(prisma.emailVerificationCode.create).not.toHaveBeenCalled();
  });
});
