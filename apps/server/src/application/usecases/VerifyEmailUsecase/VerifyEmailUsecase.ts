import { prisma } from "../../../prisma.js";
import ValidationException from "../../../exceptions/ValidationException.js";
import { IUsecase } from "../index.js";
import validateVerificationCodeService, {
  ValidateVerificationCodeService,
} from "../../services/verificationCode/ValidateVerificationCodeService.js";
import rateLimitVerificationCodeService, {
  RateLimitVerificationCodeService,
} from "../../services/verificationCode/RateLimitVerificationCodeService.js";
import { VerificationCode } from "../../../../generated/prisma_client/client.js";

export class VerifyEmailUsecase implements IUsecase {
  constructor(
    private readonly _validateVerificationCodeService: ValidateVerificationCodeService,
    private readonly _rateLimitVerificationCodeService: RateLimitVerificationCodeService,
  ) {}

  execute = async (data: { email: string; code: string; code_type: VerificationCode["type"] }) => {
    return await prisma.$transaction(async (tsx) => {
      const { isCodeValid, verificationCode, user } =
        await this._validateVerificationCodeService.execute(tsx, {
          email: data.email,
          code: data.code,
          code_type: data.code_type,
        });

      if (!isCodeValid) {
        await this._rateLimitVerificationCodeService.execute(null, { verificationCode });
        throw new ValidationException("Invalid or expired code");
      }

      await tsx.user.update({ where: { id: user.id }, data: { email_verified: true } });

      await tsx.verificationCode.delete({ where: { id: verificationCode.id } });

      return true;
    });
  };
}

const verifyEmailUsecase = new VerifyEmailUsecase(
  validateVerificationCodeService,
  rateLimitVerificationCodeService,
);

export default verifyEmailUsecase;
