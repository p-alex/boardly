import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { IService, PrismaTsx } from "../index.js";
import emailVerificationCodeFactory, {
  EmailVerificationCodeFactory,
} from "../../../domain/EmailVerificationCodeFactory.js";
import { prisma } from "../../../prisma.js";

export class EmailVerificationCodeCreatorService implements IService {
  constructor(
    private readonly _cryptoUtil: CryptoUtil,
    private readonly _emailVerificationCodeFactory: EmailVerificationCodeFactory,
  ) {}

  execute = async (tsx: PrismaTsx | null, data: { user_id: string }) => {
    const dbClient = tsx ? tsx : prisma;
    const code = this._cryptoUtil.generateCode(6);

    const emailVerificationCode = this._emailVerificationCodeFactory.create({
      user_id: data.user_id,
      code,
    });

    await dbClient.emailVerificationCode.create({ data: emailVerificationCode });

    return { code, emailVerificationCode };
  };
}

const emailVerificationCodeCreatorService = new EmailVerificationCodeCreatorService(
  cryptoUtil,
  emailVerificationCodeFactory,
);

export default emailVerificationCodeCreatorService;
