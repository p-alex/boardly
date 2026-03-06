import { IService, PrismaTsx } from "../index.js";
import emailVerificationCodeFactory, {
  VerificationCodeFactory,
} from "../../../domain/factories/VerificationCodeFactory.js";
import { prisma } from "../../../prisma.js";
import { VerificationCode } from "../../../../generated/prisma_client/client.js";

export class CreateVerificationCodeService implements IService {
  constructor(private readonly _verificationCodeFactory: VerificationCodeFactory) {}

  execute = async (
    tsx: PrismaTsx | null,
    data: { user_id: string; code_type: VerificationCode["type"] },
  ) => {
    const dbClient = tsx ? tsx : prisma;

    const { rawCode, verificationCode } = this._verificationCodeFactory.create({
      user_id: data.user_id,
      type: data.code_type,
    });

    await dbClient.verificationCode.create({ data: verificationCode });

    return { rawCode, verificationCode };
  };
}

const createVerificationCode = new CreateVerificationCodeService(emailVerificationCodeFactory);

export default createVerificationCode;
