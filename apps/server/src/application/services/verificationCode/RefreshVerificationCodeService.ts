import { VerificationCode } from "../../../../generated/prisma_client/client.js";
import verificationCodeFactory, {
  VerificationCodeFactory,
} from "../../../domain/factories/VerificationCodeFactory.js";
import ValidationException from "../../../exceptions/ValidationException.js";
import { prisma } from "../../../prisma.js";
import { IService, PrismaTsx } from "../index.js";
import verificationCodeChecker, {
  VerificationCodeChecker,
} from "../../../domain/services/verificationCode/VerificationCodeChecker.js";
import getNewVerificationCodeResendAtDate from "../../../domain/services/verificationCode/getNewVerificationCodeResendAtDate.js";
import msToMinutes from "../../../utils/getMinutesUntilDate.js";
import getMinutesUntilDate from "../../../utils/getMinutesUntilDate.js";

export class RefreshVerificationCodeService implements IService {
  constructor(
    private readonly _verificationCodeFactory: VerificationCodeFactory,
    private readonly _verificationCodeChecker: VerificationCodeChecker,
    private readonly _getNewVerificationCodeResendAtDate: typeof getNewVerificationCodeResendAtDate,
    private readonly _getMinutesUntilDate: typeof getMinutesUntilDate,
  ) {}

  execute = async (
    tsx: PrismaTsx | null,
    data: { verificationCode: VerificationCode; user_id: VerificationCode["user_id"] },
  ) => {
    const dbClient = tsx ?? prisma;

    const isLocked = this._verificationCodeChecker.isLocked(data.verificationCode);
    if (isLocked)
      throw new ValidationException(
        `Sent too many verification codes. Try again in ${this._getMinutesUntilDate(data.verificationCode.lock_until!)} minutes.`,
      );

    const canResend = this._verificationCodeChecker.canResend(data.verificationCode);
    if (!canResend)
      throw new ValidationException(
        `Can't send code now. Try again in ${this._getMinutesUntilDate(data.verificationCode.can_resend_at)} minutes.`,
      );

    const { rawCode, verificationCode: newVerificationCode } = this._verificationCodeFactory.create(
      {
        user_id: data.user_id,
        type: data.verificationCode.type,
      },
    );

    const refreshedVerificationCode = await dbClient.verificationCode.update({
      data: {
        attempts: newVerificationCode.attempts,
        code_hash: newVerificationCode.code_hash,
        expires_at: newVerificationCode.expires_at,
        last_attempt_at: newVerificationCode.last_attempt_at,
        resend_code_count: { increment: 1 },
        can_resend_at: this._getNewVerificationCodeResendAtDate({
          resend_count: data.verificationCode.resend_code_count + 1,
        }),
      },
      where: { id: data.verificationCode.id },
    });

    return { refreshedVerificationCode, rawCode };
  };
}

const refreshVerificationCodeService = new RefreshVerificationCodeService(
  verificationCodeFactory,
  verificationCodeChecker,
  getNewVerificationCodeResendAtDate,
  getMinutesUntilDate,
);

export default refreshVerificationCodeService;
