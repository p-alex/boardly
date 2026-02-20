import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { IService, PrismaTsx } from "../index.js";
import { env } from "../../../config.js";
import { prisma } from "../../../prisma.js";

export class UserEmailRotationService implements IService {
  constructor(private readonly _cryptoUtil: CryptoUtil) {}

  execute = async (tsx: PrismaTsx | null, data: { userId: string; email: string }) => {
    const dbClient = tsx ? tsx : prisma;

    const activeHashSecret = env.HASH_SECRETS.EMAIL[env.HASH_SECRETS.EMAIL.ACTIVE_VERSION];

    const activeEncryptionSecret =
      env.ENCRYPTION_SECRETS.EMAIL[env.ENCRYPTION_SECRETS.EMAIL.ACTIVE_VERSION];

    const newHashedEmail = this._cryptoUtil.hmacSHA256(data.email, activeHashSecret);

    let newEncryptedEmail = this._cryptoUtil.encrypt(data.email, activeEncryptionSecret);

    const updatedUser = await dbClient.user.update({
      data: {
        hashed_email: newHashedEmail,
        encrypted_email: newEncryptedEmail,
        email_hash_secret_version: env.HASH_SECRETS.EMAIL.ACTIVE_VERSION,
        email_encryption_secret_version: env.ENCRYPTION_SECRETS.EMAIL.ACTIVE_VERSION,
      },
      where: { id: data.userId },
    });

    return updatedUser;
  };
}

const userEmailRotationService = new UserEmailRotationService(cryptoUtil);

export default userEmailRotationService;
