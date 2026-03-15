import { PrismaClient } from "../../../../../generated/prisma_client/client.js";
import userLockChecker, {
  UserLockChecker,
} from "../../../../domain/services/user/UserLockChecker/UserLockChecker.js";
import LockException from "../../../../exceptions/LockException.js";
import ValidationException from "../../../../exceptions/ValidationException.js";
import { prisma } from "../../../../prisma.js";
import getMinutesUntilDate from "../../../../utils/getMinutesUntilDate.js";
import rotatePasswordPepperService, {
  RotatePasswordPepperService,
} from "../../../services/auth/RotatePasswordPepperService/RotatePasswordPepperService.js";
import userPasswordValidatorService, {
  UserPasswordValidatorService,
} from "../../../services/auth/UserPasswordValidatorService/UserPasswordValidatorService.js";
import createAuthSessionService, {
  CreateAuthSessionService,
} from "../../../services/authSession/CreateAuthSessionService/CreateAuthSessionService.js";
import userEmailFinderService, {
  UserEmailFinderService,
} from "../../../services/user/UserEmailFinderService.js";
import { IUsecase } from "../../index.js";

export class PasswordSignInUsecase implements IUsecase {
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _userPasswordValidatorService: UserPasswordValidatorService,
    private readonly _rotatePasswordPepperService: RotatePasswordPepperService,
    private readonly _createAuthSessionService: CreateAuthSessionService,
    private readonly _userLockChecker: UserLockChecker,
    private readonly _getMinutesUntilDate: typeof getMinutesUntilDate,
  ) {}

  execute = async (data: { email: string; password: string }) => {
    return await this._prisma.$transaction(async (tsx) => {
      const { user } = await this._userEmailFinderService.execute(tsx, { email: data.email });

      if (!user) throw new ValidationException("Incorrect email or password");

      const isUserLocked = this._userLockChecker.isLocked(user);

      if (isUserLocked)
        throw new LockException(
          `Your account is locked for ${this._getMinutesUntilDate(user.hard_lock_until!)} minutes.`,
        );

      if (!user.email_verified) {
        return { refreshToken: "", shouldVerifyEmail: true };
      }

      const userPasswordAuth = await tsx.userPasswordAuth.findUnique({
        where: { user_id: user.id },
      });

      if (!userPasswordAuth) throw new Error("user_password_auth does not exist for this user");

      const passwordValidationResult = await this._userPasswordValidatorService.validate({
        password: data.password,
        hash: userPasswordAuth.password_hash,
        password_pepper_version: userPasswordAuth.password_pepper_version,
      });

      if (!passwordValidationResult.success)
        throw new ValidationException("Incorrect email or password");

      await this._rotatePasswordPepperService.execute(tsx, {
        password: data.password,
        userPasswordAuth,
      });

      const { refreshToken } = await this._createAuthSessionService.execute(tsx, {
        user_id: user.id,
      });

      return { refreshToken, shouldVerifyEmail: false };
    });
  };
}

const passwordSignInUsecase = new PasswordSignInUsecase(
  prisma,
  userEmailFinderService,
  userPasswordValidatorService,
  rotatePasswordPepperService,
  createAuthSessionService,
  userLockChecker,
  getMinutesUntilDate,
);

export default passwordSignInUsecase;
