import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { env } from "../../config.js";
import { VerificationCode } from "../services/verificationCode/index.js";

export class VerificationCodeFactory {
  constructor(private readonly _cryptoUtil: CryptoUtil) {}

  create = (data: { user_id: string; code: string }): VerificationCode => {
    const now = Date.now();
    const expiresIn = 1000 * 60 * 10; // 10 minutes

    return {
      id: this._cryptoUtil.randomUUID(),
      user_id: data.user_id,
      code_hash: this._cryptoUtil.hmacSHA256(
        data.code,
        env.HASH_SECRETS.VERIFICATION_CODES.EMAIL_VERIFICATION,
      ),
      last_attempt_at: null,
      attempts: 0,
      expires_at: new Date(now + expiresIn),
      lock_until: null,
    };
  };
}

const verificationCodeFactory = new VerificationCodeFactory(cryptoUtil);

export default verificationCodeFactory;
