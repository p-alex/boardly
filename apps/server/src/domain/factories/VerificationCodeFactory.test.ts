import { Mocked, vi } from "vitest";
import { CryptoUtil } from "@boardly/shared/utils";
import { VerificationCodeFactory } from "../factories/VerificationCodeFactory";
import { VerificationCode } from "../services/verificationCode";
import { IEnv } from "../../config";

const EMAIL_CODE_EXPIRY_MS = 1000 * 60 * 10;
const EMAIL_CODE_RESEND_DEFAULT_MS = 1000 * 60 * 1;

vi.mock("../../config.js", () => ({
  env: {
    HASH_SECRETS: {
      VERIFICATION_CODES: {
        EMAIL_VERIFICATION: "hash secret",
      },
    },
  } as IEnv,
}));

describe("VerificationCodeFactory.ts", () => {
  let verificationCodeFactory: VerificationCodeFactory;

  let cryptoMock: Mocked<CryptoUtil>;

  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(1000);

    cryptoMock = {
      randomUUID: vi.fn().mockReturnValue("uuid"),
      hmacSHA256: vi.fn().mockReturnValue("hash"),
    } as unknown as Mocked<CryptoUtil>;

    verificationCodeFactory = new VerificationCodeFactory(cryptoMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hashes the code", () => {
    verificationCodeFactory.create({ user_id: "user_id", code: "123456" });

    expect(cryptoMock.hmacSHA256).toHaveBeenCalledWith("123456", "hash secret");
  });

  it("sets the expires_at to 10 minutes", () => {
    const { expires_at } = verificationCodeFactory.create({
      user_id: "user_id",
      code: "123456",
    });

    expect(expires_at.getTime()).toBe(new Date(1000 + EMAIL_CODE_EXPIRY_MS).getTime());
  });

  it("returns correctly", () => {
    const result = verificationCodeFactory.create({
      user_id: "user_id",
      code: "123456",
    });

    expect(result).toEqual({
      id: "uuid",
      user_id: "user_id",
      code_hash: "hash",
      resend_code_count: 0,
      can_resend_at: new Date(1000 + EMAIL_CODE_RESEND_DEFAULT_MS),
      attempts: 0,
      last_attempt_at: null,
      expires_at: new Date(1000 + EMAIL_CODE_EXPIRY_MS),
      lock_until: null,
    } as VerificationCode);
  });
});
