import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoUtil } from "@boardly/shared/utils";
import { prisma } from "../../../prisma.js";
import { verificationCodeFixtures } from "../../../__fixtures__/index.js";
import { VerificationCodeFactory } from "../../../domain/factories/VerificationCodeFactory.js";
import { CreateVerificationCodeService } from "./CreateVerificationCodeService.js";

vi.mock("../../../prisma", () => ({
  prisma: {
    emailVerificationCode: {
      create: vi.fn(),
    },
  },
}));

describe("CreateVerificationCodeService.ts (unit)", () => {
  let cryptoUtil: CryptoUtil;
  let factory: VerificationCodeFactory;
  let service: CreateVerificationCodeService;

  beforeEach(() => {
    cryptoUtil = {
      generateCode: vi.fn(),
    } as unknown as CryptoUtil;

    factory = {
      create: vi.fn(),
    } as unknown as VerificationCodeFactory;

    service = new CreateVerificationCodeService(cryptoUtil, factory);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should generate code, create entity, persist it and return result", async () => {
    const user_id = "user-123";
    const generatedCode = "ABCDEFGH";

    vi.mocked(cryptoUtil.generateCode).mockReturnValue(generatedCode);
    vi.mocked(factory.create).mockReturnValue(verificationCodeFixtures.verificationCodeMock);
    vi.mocked(prisma.emailVerificationCode.create).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock as any,
    );

    const result = await service.execute(null, { user_id, code_type: "emailVerificationCode" });

    expect(cryptoUtil.generateCode).toHaveBeenCalledWith(6);

    expect(factory.create).toHaveBeenCalledWith({
      user_id,
      code: generatedCode,
    });

    expect(prisma.emailVerificationCode.create).toHaveBeenCalledWith({
      data: verificationCodeFixtures.verificationCodeMock,
    });

    expect(result).toEqual({
      code: generatedCode,
      verificationCode: verificationCodeFixtures.verificationCodeMock,
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

    await service.execute(tx as any, { user_id, code_type: "emailVerificationCode" });

    expect(tx.emailVerificationCode.create).toHaveBeenCalled();
    expect(prisma.emailVerificationCode.create).not.toHaveBeenCalled();
  });
});
