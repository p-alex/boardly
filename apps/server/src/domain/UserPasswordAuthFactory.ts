import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { UserPasswordAuth } from "../../generated/prisma_client/client.js";
import { env } from "../config.js";

export class UserPasswordAuthFactory {
  constructor(private readonly _cryptoUtil: CryptoUtil) {}
  create = async (data: { user_id: string; password: string }): Promise<UserPasswordAuth> => {
    const pepperVersion = env.PEPPERS.PASSWORD.ACTIVE_VERSION;

    const pepper = env.PEPPERS.PASSWORD[pepperVersion];

    return {
      user_id: data.user_id,
      password_hash: await this._cryptoUtil.hashPassword(data.password + pepper),
      password_pepper_version: pepperVersion,
      updated_at: new Date(Date.now()),
      created_at: new Date(Date.now()),
    };
  };
}

const userPasswordAuthFactory = new UserPasswordAuthFactory(cryptoUtil);

export default userPasswordAuthFactory;
