import { clock, Clock, cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { getVerificationCodeSecret } from "../services/verificationCode/getVerificationCodeSecret.js";
import { VerificationCode } from "../../../generated/prisma_client/client.js";

export class VerificationCodeFactory {
  private readonly _expiresInMs: number;
  private readonly _defaultCanResendInMs: number;

  constructor(
    private readonly _cryptoUtil: CryptoUtil,
    private readonly _getVerificationCodeSecret: typeof getVerificationCodeSecret,
    private readonly _clock: Clock,
  ) {
    this._expiresInMs = 1000 * 60 * 10; // 10 minutes
    this._defaultCanResendInMs = 1000 * 60 * 2; // 2 minutes
  }

  create = (data: {
    user_id: VerificationCode["user_id"];
    type: VerificationCode["type"];
  }): { verificationCode: VerificationCode; rawCode: string } => {
    const now = this._clock.now();

    const rawCode = this._cryptoUtil.generateCode(6);

    return {
      rawCode,
      verificationCode: {
        id: this._cryptoUtil.randomUUID(),
        user_id: data.user_id,
        code_hash: this._cryptoUtil.hmacSHA256(rawCode, this._getVerificationCodeSecret(data.type)),
        can_resend_at: new Date(now + this._defaultCanResendInMs),
        resend_code_count: 0,
        last_attempt_at: null,
        attempts: 0,
        expires_at: new Date(now + this._expiresInMs),
        lock_until: null,
        type: data.type,
      },
    };
  };

  getExpirationDate = () => {
    return new Date(this._clock.now() + this._expiresInMs);
  };
}

const verificationCodeFactory = new VerificationCodeFactory(
  cryptoUtil,
  getVerificationCodeSecret,
  clock,
);

export default verificationCodeFactory;
