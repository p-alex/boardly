import userLockChecker, {
  UserLockChecker,
} from "../../../domain/services/user/UserLockChecker/UserLockChecker.js";
import verificationCodeHashValidator, {
  VerificationCodeHashValidator,
} from "../../../domain/services/verificationCode/VerificationCodeHashValidator.js";
import verificationCodePolicy, {
  VerificationCodePolicy,
} from "../../../domain/services/verificationCode/VerificationCodePolicy.js";
import TooManyRequestsException from "../../../exceptions/TooManyRequestsException.js";
import ValidationException from "../../../exceptions/ValidationException.js";
import { prisma } from "../../../prisma.js";
import { IService, PrismaTsx } from "../index.js";
import userEmailFinderService, { UserEmailFinderService } from "../user/UserEmailFinderService.js";
import { VerificationCodeType } from "./index.js";

export class ValidateVerificationCodeService implements IService {
  constructor(
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _userLockChecker: UserLockChecker,
    private readonly _verificationCodePolicy: VerificationCodePolicy,
    private readonly _verificationCodeHashValidator: VerificationCodeHashValidator,
  ) {}

  execute = async (
    tsx: PrismaTsx | null,
    data: { email: string; code: string; code_type: VerificationCodeType },
  ) => {
    const dbClient = tsx ? tsx : prisma;

    const { user } = await this._userEmailFinderService.execute(dbClient, { email: data.email });

    if (!user) throw new ValidationException("Invalid or expired code");

    const isUserLocked = this._userLockChecker.isLocked(user);

    if (isUserLocked)
      throw new TooManyRequestsException("Account is temporarly locked. Try again later", {});

    let verificationCode = await dbClient[data.code_type].findUnique({
      where: { user_id: user.id },
    });

    if (!verificationCode) throw new ValidationException("Invalid or expired code");

    this._verificationCodePolicy.validateExistenceAndStatus(verificationCode);

    const isCodeValid = this._verificationCodeHashValidator.isValid({
      code_hash: verificationCode.code_hash,
      code_raw: data.code,
      code_type: "EMAIL_VERIFICATION",
    });

    return { user, verificationCode, isCodeValid };
  };
}

const validateVerificationCodeService = new ValidateVerificationCodeService(
  userEmailFinderService,
  userLockChecker,
  verificationCodePolicy,
  verificationCodeHashValidator,
);

export default validateVerificationCodeService;
