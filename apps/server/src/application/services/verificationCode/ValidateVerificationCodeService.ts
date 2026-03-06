import { VerificationCode } from "../../../../generated/prisma_client/client.js";
import userLockChecker, {
  UserLockChecker,
} from "../../../domain/services/user/UserLockChecker/UserLockChecker.js";
import verificationCodeChecker, {
  VerificationCodeChecker,
} from "../../../domain/services/verificationCode/VerificationCodeChecker.js";
import TooManyRequestsException from "../../../exceptions/TooManyRequestsException.js";
import ValidationException from "../../../exceptions/ValidationException.js";
import { prisma } from "../../../prisma.js";
import { IService, PrismaTsx } from "../index.js";
import userEmailFinderService, { UserEmailFinderService } from "../user/UserEmailFinderService.js";

export class ValidateVerificationCodeService implements IService {
  constructor(
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _userLockChecker: UserLockChecker,
    private readonly _verificationCodeChecker: VerificationCodeChecker,
  ) {}

  execute = async (
    tsx: PrismaTsx | null,
    data: { email: string; code: string; code_type: VerificationCode["type"] },
  ) => {
    const dbClient = tsx ? tsx : prisma;

    const { user } = await this._userEmailFinderService.execute(dbClient, { email: data.email });

    if (!user) throw new ValidationException("Invalid or expired code");

    const isUserLocked = this._userLockChecker.isLocked(user);

    if (isUserLocked) throw new ValidationException("Invalid or expired code");

    let verificationCode = await dbClient.verificationCode.findFirst({
      where: { user_id: user.id, type: data.code_type },
    });

    if (!verificationCode) throw new ValidationException("Invalid or expired code");

    const isLocked = this._verificationCodeChecker.isLocked(verificationCode);

    if (isLocked) throw new ValidationException("Invalid or expired code");

    const isExpired = this._verificationCodeChecker.isExpired(verificationCode);

    if (isExpired) throw new ValidationException("Invalid or expired code");

    const isCodeValid = this._verificationCodeChecker.isValidHash(data.code, verificationCode);

    return { user, verificationCode, isCodeValid };
  };
}

const validateVerificationCodeService = new ValidateVerificationCodeService(
  userEmailFinderService,
  userLockChecker,
  verificationCodeChecker,
);

export default validateVerificationCodeService;
