import { vi } from "vitest";
import { CryptoUtil } from "@boardly/shared/utils";
import { VerificationCodeChecker } from "./VerificationCodeChecker";
import { verificationCodeMock } from "../../../__fixtures__/verificationCode";

vi.mock("./getVerificationCodeSecret", () => ({
  getVerificationCodeSecret: vi.fn(() => "secret"),
}));

describe("VerificationCodeChecker.ts (unit)", () => {
  let cryptoMock: CryptoUtil;

  const clockMock = {
    now: vi.fn().mockReturnValue(1000),
  };

  let verificationCodeChecker: VerificationCodeChecker;

  beforeEach(() => {
    cryptoMock = {
      hmacSHA256: vi.fn().mockReturnValue("hash"),
    } as unknown as CryptoUtil;

    verificationCodeChecker = new VerificationCodeChecker(cryptoMock, clockMock);
  });

  describe("isLocked", () => {
    it("returns false if verification code has no lock date", () => {
      const result = verificationCodeChecker.isLocked({
        ...verificationCodeMock,
        lock_until: null,
      });
      expect(result).toBe(false);
    });

    it("returns true if locked", () => {
      const result = verificationCodeChecker.isLocked({
        ...verificationCodeMock,
        lock_until: new Date(2000),
      });
      expect(result).toBe(true);
    });

    it("returns false if not locked", () => {
      const result = verificationCodeChecker.isLocked({
        ...verificationCodeMock,
        lock_until: new Date(100),
      });
      expect(result).toBe(false);
    });
  });

  describe("isExpired", () => {
    it("returns true if expired", () => {
      const result = verificationCodeChecker.isExpired({
        ...verificationCodeMock,
        expires_at: new Date(100),
      });
      expect(result).toBe(true);
    });

    it("returns false if not expired", () => {
      const result = verificationCodeChecker.isExpired({
        ...verificationCodeMock,
        expires_at: new Date(2000),
      });
      expect(result).toBe(false);
    });
  });

  describe("canResend", () => {
    it("returns false if the code cannot be resent", () => {
      const result = verificationCodeChecker.canResend({
        ...verificationCodeMock,
        can_resend_at: new Date(2000),
      });
      expect(result).toBe(false);
    });

    it("returns true if the code can be resent", () => {
      const result = verificationCodeChecker.canResend({
        ...verificationCodeMock,
        can_resend_at: new Date(100),
      });
      expect(result).toBe(true);
    });
  });

  describe("isValidHash", () => {
    it("checks if hash is valid", () => {
      const result = verificationCodeChecker.isValidHash("123456", verificationCodeMock);
      expect(cryptoMock.hmacSHA256).toHaveBeenCalledWith("123456", "secret");
      expect(typeof result).toBe("boolean");
    });
  });
});
