import { Mock, Mocked, vi } from "vitest";
import { Clock, CryptoUtil } from "@boardly/shared/utils";
import { VerificationCodeFactory } from "../factories/VerificationCodeFactory";
import { VerificationCode } from "../../../generated/prisma_client/client";

const EMAIL_CODE_EXPIRY_MS = 1000 * 60 * 10;
const EMAIL_CODE_RESEND_DEFAULT_MS = 1000 * 60 * 2;

describe("VerificationCodeFactory.ts", () => {
  const now = 1000;

  const clockMock = {
    now: vi.fn().mockReturnValue(now),
  } as Clock;

  let cryptoMock: Mocked<CryptoUtil>;

  let getVerificationCodeSecret: Mock;

  let verificationCodeFactory: VerificationCodeFactory;

  beforeEach(() => {
    getVerificationCodeSecret = vi.fn().mockReturnValue("secret");

    cryptoMock = {
      randomUUID: vi.fn().mockReturnValue("uuid"),
      hmacSHA256: vi.fn().mockReturnValue("hash"),
      generateCode: vi.fn().mockReturnValue("123456"),
    } as unknown as Mocked<CryptoUtil>;

    verificationCodeFactory = new VerificationCodeFactory(
      cryptoMock,
      getVerificationCodeSecret,
      clockMock,
    );
  });

  it("hashes the code", () => {
    verificationCodeFactory.create({ user_id: "user_id", type: "EMAIL_VERIFICATION" });

    expect(cryptoMock.hmacSHA256).toHaveBeenCalledWith("123456", "secret");
  });

  it("sets the expires_at to 10 minutes", () => {
    const { verificationCode } = verificationCodeFactory.create({
      user_id: "user_id",
      type: "EMAIL_VERIFICATION",
    });

    expect(verificationCode.expires_at.getTime()).toBe(
      new Date(now + EMAIL_CODE_EXPIRY_MS).getTime(),
    );
  });

  it("returns correctly", () => {
    const result = verificationCodeFactory.create({
      user_id: "user_id",
      type: "EMAIL_VERIFICATION",
    });

    expect(result).toEqual({
      rawCode: "123456",
      verificationCode: {
        id: "uuid",
        user_id: "user_id",
        code_hash: "hash",
        resend_code_count: 0,
        can_resend_at: new Date(now + EMAIL_CODE_RESEND_DEFAULT_MS),
        attempts: 0,
        last_attempt_at: null,
        expires_at: new Date(now + EMAIL_CODE_EXPIRY_MS),
        lock_until: null,
        type: "EMAIL_VERIFICATION",
      } as VerificationCode,
    });
  });

  it("returns expiration date correctly", () => {
    const date = verificationCodeFactory.getExpirationDate();

    expect(date.getTime()).toBe(now + EMAIL_CODE_EXPIRY_MS);
  });
});
