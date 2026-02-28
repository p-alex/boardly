import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { VerificationCodeHashValidator } from "./VerificationCodeHashValidator";
import type { CryptoUtil } from "@boardly/shared/utils";
import { env } from "../../../config.js";

describe("VerificationCodeHashValidator", () => {
  let cryptoMock: CryptoUtil;
  let validator: VerificationCodeHashValidator;

  beforeEach(() => {
    // Mock cryptoUtil
    cryptoMock = {
      hmacSHA256: vi.fn(),
    } as unknown as CryptoUtil;

    validator = new VerificationCodeHashValidator(cryptoMock);
  });

  it("returns true if code_hash matches computed hash", () => {
    const code_raw = "123456";
    const code_type = "EMAIL" as keyof typeof env.HASH_SECRETS.VERIFICATION_CODES;
    const secret = env.HASH_SECRETS.VERIFICATION_CODES[code_type];
    const fakeHash = "fakehash123";

    // Mock the crypto function
    (cryptoMock.hmacSHA256 as Mock).mockReturnValue(fakeHash);

    const result = validator.isValid({
      code_raw,
      code_hash: fakeHash,
      code_type,
    });

    expect(cryptoMock.hmacSHA256).toHaveBeenCalledWith(code_raw, secret);
    expect(result).toBe(true);
  });

  it("returns false if code_hash does not match computed hash", () => {
    const code_raw = "123456";
    const code_type = "EMAIL" as keyof typeof env.HASH_SECRETS.VERIFICATION_CODES;
    const secret = env.HASH_SECRETS.VERIFICATION_CODES[code_type];
    const fakeHash = "fakehash123";

    (cryptoMock.hmacSHA256 as Mock).mockReturnValue(fakeHash);

    const result = validator.isValid({
      code_raw,
      code_hash: "wronghash",
      code_type,
    });

    expect(cryptoMock.hmacSHA256).toHaveBeenCalledWith(code_raw, secret);
    expect(result).toBe(false);
  });
});
