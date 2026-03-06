import { clock, Clock, cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { VerificationCode } from "../../../../generated/prisma_client/client.js";
import { getVerificationCodeSecret } from "./getVerificationCodeSecret.js";

export class VerificationCodeChecker {
  constructor(
    private readonly _cryptoUtil: CryptoUtil,
    private readonly _clock: Clock,
  ) {}

  isLocked = (verificationCode: VerificationCode): boolean => {
    if (!verificationCode.lock_until) return false;
    return this._clock.now() <= verificationCode.lock_until.getTime();
  };

  isExpired = (verificationCode: VerificationCode): boolean => {
    return this._clock.now() > verificationCode.expires_at.getTime();
  };

  canResend = (verificationCode: VerificationCode): boolean => {
    return this._clock.now() > verificationCode.can_resend_at.getTime();
  };

  isValidHash = (rawCode: string, verificationCode: VerificationCode): boolean => {
    const hash = this._cryptoUtil.hmacSHA256(
      rawCode,
      getVerificationCodeSecret(verificationCode.type),
    );

    return verificationCode.code_hash === hash;
  };
}

const verificationCodeChecker = new VerificationCodeChecker(cryptoUtil, clock);

export default verificationCodeChecker;
