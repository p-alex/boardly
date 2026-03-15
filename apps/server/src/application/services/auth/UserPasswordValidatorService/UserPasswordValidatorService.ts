import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { env, PasswordPepperVersion } from "../../../../config.js";
import { UserPasswordAuth } from "../../../../../generated/prisma_client/client.js";

export class UserPasswordValidatorService {
  constructor(private readonly _cryptoUtil: CryptoUtil) {}

  validate = async (data: {
    password: string;
    hash: string;
    password_pepper_version: UserPasswordAuth["password_pepper_version"];
  }): Promise<{ success: boolean; validPepperVersion?: PasswordPepperVersion }> => {
    const isValidWithCurrentPepper = await this._cryptoUtil.verfyPasswordHash(
      data.password + env.PEPPERS.PASSWORD[data.password_pepper_version],
      data.hash,
    );

    if (isValidWithCurrentPepper)
      return { success: true, validPepperVersion: data.password_pepper_version };

    const pepperVersions: PasswordPepperVersion[] = ["V1", "V2"];

    const filteredVersions = pepperVersions.filter(
      (version) => version !== data.password_pepper_version,
    );

    for (let i = 0; i < filteredVersions.length; i++) {
      const isValidPassword = await this._cryptoUtil.verfyPasswordHash(
        data.password + env.PEPPERS.PASSWORD[filteredVersions[i]],
        data.hash,
      );
      if (isValidPassword) return { success: true, validPepperVersion: pepperVersions[i] };
    }

    return { success: false };
  };
}

const userPasswordValidatorService = new UserPasswordValidatorService(cryptoUtil);

export default userPasswordValidatorService;
