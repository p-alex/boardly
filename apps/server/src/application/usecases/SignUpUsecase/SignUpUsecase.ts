import { PrismaClient } from "../../../../generated/prisma_client/client.js";
import AlreadyExistsException from "../../../exceptions/AlreadyExistsException.js";
import ValidationException from "../../../exceptions/ValidationException.js";
import getEmailVerificationTemplate, {
  GetEmailVerificationTemplate,
} from "../../../Mailer/emailTemplates/emailVerificationTemplate.js";
import { mailer } from "../../../Mailer/index.js";
import Mailer from "../../../Mailer/Mailer.js";
import { prisma } from "../../../prisma.js";
import pwnedPasswordCheckerService, {
  PwnedPasswordCheckerService,
} from "../../services/auth/PwnedPasswordCheckerService/PwnedPasswordCheckerService.js";
import emailVerificationCodeCreatorService, {
  EmailVerificationCodeCreatorService,
} from "../../services/emailVerificationCode/EmailVerificationCodeCreatorService.js";
import userCreatorService, { UserCreatorService } from "../../services/user/UserCreatorService.js";
import userEmailFinderService, {
  UserEmailFinderService,
} from "../../services/user/UserEmailFinderService.js";
import userEmailRotationService, {
  UserEmailRotationService,
} from "../../services/user/UserEmailRotationService.js";

export class SignUpUsecase {
  constructor(
    private readonly _userCreatorService: UserCreatorService,
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _userEmailRotationService: UserEmailRotationService,
    private readonly _pwnedPasswordCheckerService: PwnedPasswordCheckerService,
    private readonly _prisma: PrismaClient,
  ) {}

  execute = async (data: { username: string; email: string; password: string }) => {
    return await this._prisma.$transaction(async (tsx) => {
      const userWithUsername = await tsx.user.findUnique({ where: { username: data.username } });

      if (userWithUsername)
        throw new AlreadyExistsException("A user with that username already exists.");

      let userWithEmail = await this._userEmailFinderService.execute(tsx, {
        email: data.email,
      });

      if (userWithEmail?.user && userWithEmail.foundWithInactiveSecret) {
        userWithEmail.user = await this._userEmailRotationService.execute(null, {
          email: data.email,
          userId: userWithEmail.user.id,
        });
      }

      if (userWithEmail?.user)
        throw new AlreadyExistsException("A user with that email already exists.");

      const isPasswordPwned = await this._pwnedPasswordCheckerService.execute({
        password: data.password,
      });

      if (isPasswordPwned)
        throw new ValidationException(
          "Password has been found in a data breech and it's not safe to use. Please try another one.",
        );

      const { createdUser } = await this._userCreatorService.execute(tsx, data);

      return null;
    });
  };
}

const signUpUsecase = new SignUpUsecase(
  userCreatorService,
  userEmailFinderService,
  userEmailRotationService,
  pwnedPasswordCheckerService,
  prisma,
);

export default signUpUsecase;
