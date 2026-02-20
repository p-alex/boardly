import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { env } from "../../../config.js";
import { IService, PrismaTsx } from "../index.js";
import { prisma } from "../../../prisma.js";

export class UserEmailFinderService implements IService {
  constructor(private readonly _cryptoUtil: CryptoUtil) {}

  execute = async (tsx: PrismaTsx | null, data: { email: string }) => {
    const dbClient = tsx ? tsx : prisma;

    let user = await this._findWithActiveSecret(dbClient, data.email);

    let foundWithActiveSecret = user !== null;

    if (foundWithActiveSecret) return { user, foundWithInactiveSecret: false };

    user = await this._findWithInactiveSecrets(dbClient, data.email);

    return { user, foundWithInactiveSecret: user ? foundWithActiveSecret === false : false };
  };

  private readonly _findWithActiveSecret = (tsx: PrismaTsx, email: string) => {
    const currentHashSecret = env.HASH_SECRETS.EMAIL[env.HASH_SECRETS.EMAIL.ACTIVE_VERSION];

    const hashedEmail = this._cryptoUtil.hmacSHA256(email, currentHashSecret);

    const user = tsx.user.findUnique({ where: { hashed_email: hashedEmail } });

    return user;
  };

  private readonly _findWithInactiveSecrets = async (tsx: PrismaTsx, email: string) => {
    const hashSecretVersions = env.HASH_SECRETS.EMAIL.VERSIONS;

    for (let i = 0; i < hashSecretVersions.length; i++) {
      const version = hashSecretVersions[i];

      if (version === env.HASH_SECRETS.EMAIL.ACTIVE_VERSION) continue;

      const hashedEmail = this._cryptoUtil.hmacSHA256(email, env.HASH_SECRETS.EMAIL[version]);

      let user = await tsx.user.findUnique({ where: { hashed_email: hashedEmail } });

      if (user) return user;
    }

    return null;
  };
}

const userEmailFinderService = new UserEmailFinderService(cryptoUtil);

export default userEmailFinderService;
