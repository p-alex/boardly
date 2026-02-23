import { Mocked, vi } from "vitest";
import { CryptoUtil } from "@boardly/shared/utils";
import { EmailVerificationCodeFactory } from "./EmailVerificationCodeFactory";
import { EmailVerificationCode } from "../../generated/prisma_client/client";

const EMAIL_CODE_EXPIRY_MS = 1000 * 60 * 10;

vi.mock("../config", () => ({ env: { HASH_SECRETS: { EMAIL_VERIFICATION_CODE: "hash secret" } } }));

describe("EmailVerificationCodeFactory.ts", () => {
  let emailVerificationCodeFactory: EmailVerificationCodeFactory;

  let cryptoMock: Mocked<CryptoUtil>;

  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(1000);

    cryptoMock = {
      randomUUID: vi.fn().mockReturnValue("uuid"),
      hmacSHA256: vi.fn().mockReturnValue("hash"),
    } as unknown as Mocked<CryptoUtil>;

    emailVerificationCodeFactory = new EmailVerificationCodeFactory(cryptoMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hashes the code", () => {
    emailVerificationCodeFactory.create({ user_id: "user_id", code: "123456" });

    expect(cryptoMock.hmacSHA256).toHaveBeenCalledWith("123456", "hash secret");
  });

  it("sets the expires_at to 10 minutes", () => {
    const { expires_at } = emailVerificationCodeFactory.create({
      user_id: "user_id",
      code: "123456",
    });

    expect(expires_at.getTime()).toBe(new Date(1000 + EMAIL_CODE_EXPIRY_MS).getTime());
  });

  it("returns correctly", () => {
    const result = emailVerificationCodeFactory.create({
      user_id: "user_id",
      code: "123456",
    });

    expect(result).toEqual({
      id: "uuid",
      user_id: "user_id",
      code_hash: "hash",
      attempts: 0,
      last_attempt_at: null,
      expires_at: new Date(1000 + EMAIL_CODE_EXPIRY_MS),
      lock_until: null,
    } as EmailVerificationCode);
  });
});
