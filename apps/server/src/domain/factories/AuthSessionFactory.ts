import { clock, Clock, cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { AuthSession, User } from "../../../generated/prisma_client/client.js";
import { env } from "../../config.js";

export const SESSION_EXPIRES_AT = 1000 * 60 * 60 * 24 * 7; // 7 days

export class AuthSessionFactory {
  private readonly _expiresAt: number;

  constructor(
    private readonly _cryptoUtil: CryptoUtil,
    private readonly _clock: Clock,
  ) {
    this._expiresAt = SESSION_EXPIRES_AT;
  }

  create = (data: { id: string; user_id: User["id"]; token: string }): AuthSession => {
    const now = this._clock.now();

    return {
      id: data.id,
      token_hash: this._cryptoUtil.hmacSHA256(data.token, env.HASH_SECRETS.SESSION_TOKEN),
      token_family: this._cryptoUtil.randomUUID(),
      is_revoked: false,
      user_id: data.user_id,
      created_at: new Date(now),
      expires_at: new Date(now + this._expiresAt),
    };
  };
}

const authSessionFactory = new AuthSessionFactory(cryptoUtil, clock);

export default authSessionFactory;
