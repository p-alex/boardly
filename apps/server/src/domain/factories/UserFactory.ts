import { User } from "../../../generated/prisma_client/client.js";
import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { env } from "../../config.js";

export class UserFactory {
  constructor(private readonly _cryptoUtil: CryptoUtil) {}

  create = (data: { username: string; email: string }): User => {
    const emailHashSecretVersion = env.ENCRYPTION_SECRETS.EMAIL.ACTIVE_VERSION;
    const emailEncryptionSecretVersion = env.ENCRYPTION_SECRETS.EMAIL.ACTIVE_VERSION;

    return {
      id: this._cryptoUtil.randomUUID(),
      username: data.username,
      hashed_email: this._cryptoUtil.hmacSHA256(
        data.email,
        env.HASH_SECRETS.EMAIL[emailHashSecretVersion],
      ),
      encrypted_email: this._cryptoUtil.encrypt(
        data.email,
        env.ENCRYPTION_SECRETS.EMAIL[emailEncryptionSecretVersion],
      ),
      email_encryption_secret_version: emailEncryptionSecretVersion,
      email_hash_secret_version: emailHashSecretVersion,
      email_verified: false,
      updated_at: new Date(Date.now()),
      created_at: new Date(Date.now()),
      hard_lock_until: null,
    };
  };
}

const userFactory = new UserFactory(cryptoUtil);

export default userFactory;
