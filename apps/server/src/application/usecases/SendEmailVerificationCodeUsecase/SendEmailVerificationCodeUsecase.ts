import { IUsecase } from "../index.js";
import { prisma } from "../../../prisma.js";
import emailVerificationCodeCreatorService, {
  EmailVerificationCodeCreatorService,
} from "../../services/emailVerificationCode/EmailVerificationCodeCreatorService.js";
import { PrismaClient } from "../../../../generated/prisma_client/client.js";
import userEmailFinderService, {
  UserEmailFinderService,
} from "../../services/user/UserEmailFinderService.js";
import NotFoundException from "../../../exceptions/NotFoundException.js";
import AlreadyExistsException from "../../../exceptions/AlreadyExistsException.js";
import Mailer from "../../../Mailer/Mailer.js";
import getEmailVerificationTemplate, {
  GetEmailVerificationTemplate,
} from "../../../Mailer/emailTemplates/emailVerificationTemplate.js";
import { mailer } from "../../../Mailer/index.js";

export class SendEmailVerificationCodeUsecase implements IUsecase {
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _emailVerificationCodeCreatorService: EmailVerificationCodeCreatorService,
    private readonly _mailer: Mailer,
    private readonly _getEmailVerificationTemplate: GetEmailVerificationTemplate,
  ) {}

  execute = async (data: { email: string }) => {
    return await this._prisma.$transaction(async (tsx) => {
      const { user } = await this._userEmailFinderService.execute(tsx, { email: data.email });

      if (!user) throw new NotFoundException("A user with that email does not exist.");

      if (user.email_verified === true)
        throw new AlreadyExistsException("This email is already verified.");

      const { code } = await this._emailVerificationCodeCreatorService.execute(tsx, {
        user_id: user.id,
      });

      await this._mailer.send(this._getEmailVerificationTemplate(code), data.email);

      return true;
    });
  };
}

const sendEmailVerificationCodeUsecase = new SendEmailVerificationCodeUsecase(
  prisma,
  userEmailFinderService,
  emailVerificationCodeCreatorService,
  mailer,
  getEmailVerificationTemplate,
);

export default sendEmailVerificationCodeUsecase;
