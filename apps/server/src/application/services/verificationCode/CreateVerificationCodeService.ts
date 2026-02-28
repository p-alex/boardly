import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { IService, PrismaTsx } from "../index.js";
import emailVerificationCodeFactory, {
  VerificationCodeFactory,
} from "../../../domain/factories/VerificationCodeFactory.js";
import { prisma } from "../../../prisma.js";
import { VerificationCodeType } from "../verificationCode/index.js";

export class CreateVerificationCodeService implements IService {
  constructor(
    private readonly _cryptoUtil: CryptoUtil,
    private readonly _verificationCodeFactory: VerificationCodeFactory,
  ) {}

  execute = async (
    tsx: PrismaTsx | null,
    data: { user_id: string; code_type: VerificationCodeType },
  ) => {
    const dbClient = tsx ? tsx : prisma;

    const code = this._cryptoUtil.generateCode(6);

    const verificationCode = this._verificationCodeFactory.create({
      user_id: data.user_id,
      code,
    });

    await dbClient[data.code_type].create({ data: verificationCode });

    return { code, verificationCode };
  };
}

const createVerificationCode = new CreateVerificationCodeService(
  cryptoUtil,
  emailVerificationCodeFactory,
);

export default createVerificationCode;
