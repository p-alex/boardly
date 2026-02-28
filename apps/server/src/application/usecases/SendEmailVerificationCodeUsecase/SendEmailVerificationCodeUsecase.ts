import { IUsecase } from "../index.js";
import { prisma } from "../../../prisma.js";
import createVerificationCodeService, {
  CreateVerificationCodeService,
} from "../../services/verificationCode/CreateVerificationCodeService.js";
import { PrismaClient } from "../../../../generated/prisma_client/client.js";
import userEmailFinderService, {
  UserEmailFinderService,
} from "../../services/user/UserEmailFinderService.js";
import Mailer from "../../../Mailer/Mailer.js";
import getEmailVerificationTemplate, {
  GetEmailVerificationTemplate,
} from "../../../Mailer/emailTemplates/emailVerificationTemplate.js";
import { mailer } from "../../../Mailer/index.js";

export class SendEmailVerificationCodeUsecase implements IUsecase {
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _createVerificationCodeService: CreateVerificationCodeService,
    private readonly _mailer: Mailer,
    private readonly _getEmailVerificationTemplate: GetEmailVerificationTemplate,
  ) {}

  execute = async (data: { email: string }) => {
    return await this._prisma.$transaction(async (tsx) => {
      const { user } = await this._userEmailFinderService.execute(tsx, { email: data.email });

      if (!user) return true;

      if (user.email_verified === true) return true;

      const { code } = await this._createVerificationCodeService.execute(tsx, {
        user_id: user.id,
        code_type: "emailVerificationCode",
      });

      await this._mailer.send(this._getEmailVerificationTemplate(code), data.email);

      return true;
    });
  };
}

const sendEmailVerificationCodeUsecase = new SendEmailVerificationCodeUsecase(
  prisma,
  userEmailFinderService,
  createVerificationCodeService,
  mailer,
  getEmailVerificationTemplate,
);

export default sendEmailVerificationCodeUsecase;
