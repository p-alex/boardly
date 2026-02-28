import userLockChecker, {
  UserLockChecker,
} from "../../../domain/services/user/UserLockChecker/UserLockChecker.js";
import { VerificationCode } from "../../../domain/services/verificationCode/index.js";
import verificationCodeLockerChecker, {
  VerificationCodeLockChecker,
} from "../../../domain/services/verificationCode/VerificationCodeLockChecker.js";
import { prisma } from "../../../prisma.js";
import { IService, PrismaTsx } from "../index.js";
import { VerificationCodeType } from "./index.js";

export class RateLimitVerificationCodeService implements IService {
  private readonly _codeLockThreshold = 5;
  private readonly _userLockThreshold = 10;

  constructor(
    private readonly _userLockChecker: UserLockChecker,
    private readonly _verificationCodeLockChecker: VerificationCodeLockChecker,
  ) {}

  execute = async (
    _: PrismaTsx | null,
    data: { verificationCode: VerificationCode; code_type: VerificationCodeType },
  ) => {
    let updatedVerificationCode = await prisma[data.code_type].update({
      data: {
        attempts: { increment: 1 },
        last_attempt_at: new Date(),
      },
      where: { id: data.verificationCode.id },
    });

    if (updatedVerificationCode.attempts >= this._codeLockThreshold) {
      updatedVerificationCode = await prisma[data.code_type].update({
        data: { lock_until: this._verificationCodeLockChecker.getLockDuration() },
        where: { id: updatedVerificationCode.id },
      });
    }

    if (updatedVerificationCode.attempts >= this._userLockThreshold) {
      await prisma.user.update({
        data: { hard_lock_until: this._userLockChecker.getHardLockDate() },
        where: { id: updatedVerificationCode.user_id },
      });
    }

    return { updatedVerificationCode };
  };
}

const rateLimitVerificationCodeService = new RateLimitVerificationCodeService(
  userLockChecker,
  verificationCodeLockerChecker,
);

export default rateLimitVerificationCodeService;
