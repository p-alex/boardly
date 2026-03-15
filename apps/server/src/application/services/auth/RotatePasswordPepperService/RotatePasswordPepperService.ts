import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { UserPasswordAuth } from "../../../../../generated/prisma_client/client.js";
import { IService, PrismaTsx } from "../../index.js";
import { prisma } from "../../../../prisma.js";
import { env } from "../../../../config.js";

export class RotatePasswordPepperService implements IService {
  constructor(private readonly _cryptoUtil: CryptoUtil) {}

  execute = async (
    tsx: PrismaTsx | null,
    data: { password: string; userPasswordAuth: UserPasswordAuth },
  ) => {
    const dbClient = tsx ?? prisma;

    const activePepperVersion = env.PEPPERS.PASSWORD.ACTIVE_VERSION;

    if (data.userPasswordAuth.password_pepper_version === activePepperVersion) return null;

    const newPasswordHash = await this._cryptoUtil.hashPassword(
      data.password + env.PEPPERS.PASSWORD[activePepperVersion],
    );

    return await dbClient.userPasswordAuth.update({
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date(Date.now()),
        password_pepper_version: activePepperVersion,
      },
      where: { user_id: data.userPasswordAuth.user_id },
    });
  };
}

const rotatePasswordPepperService = new RotatePasswordPepperService(cryptoUtil);

export default rotatePasswordPepperService;
