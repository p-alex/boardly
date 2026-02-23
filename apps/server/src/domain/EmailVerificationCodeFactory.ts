import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { EmailVerificationCode } from "../../generated/prisma_client/client.js";
import { env } from "../config.js";

export class EmailVerificationCodeFactory {
  constructor(private readonly _cryptoUtil: CryptoUtil) {}

  create = (data: { user_id: string; code: string }): EmailVerificationCode => {
    const now = Date.now();
    const expiresIn = 1000 * 60 * 10; // 10 minutes

    return {
      id: this._cryptoUtil.randomUUID(),
      user_id: data.user_id,
      code_hash: this._cryptoUtil.hmacSHA256(data.code, env.HASH_SECRETS.EMAIL_VERIFICATION_CODE),
      last_attempt_at: null,
      attempts: 0,
      expires_at: new Date(now + expiresIn),
      lock_until: null,
    };
  };
}

const emailVerificationCodeFactory = new EmailVerificationCodeFactory(cryptoUtil);

export default emailVerificationCodeFactory;
