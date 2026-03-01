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
import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";
import verificationCodeMapper, {
  VerificationCodeMapper,
} from "../../../domain/mappers/VerificationCodeMapper.js";

export class SendVerificationCodeUsecase implements IUsecase {
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _createVerificationCodeService: CreateVerificationCodeService,
    private readonly _mailer: Mailer,
    private readonly _getEmailVerificationTemplate: GetEmailVerificationTemplate,
    private readonly _verificationCodeMapper: VerificationCodeMapper,
  ) {}

  execute = async (data: {
    email: string;
    code_type: verificationCodeFieldValidations.VerificationCodeType;
  }) => {
    return await this._prisma.$transaction(async (tsx) => {
      const { user } = await this._userEmailFinderService.execute(tsx, { email: data.email });

      if (!user) return true;

      if (user.email_verified === true) return true;

      const { code } = await this._createVerificationCodeService.execute(tsx, {
        user_id: user.id,
        code_type: this._verificationCodeMapper.map(data.code_type),
      });

      await this._mailer.send(this._getEmailVerificationTemplate(code), data.email);

      return true;
    });
  };
}

const sendVerificationCodeUsecase = new SendVerificationCodeUsecase(
  prisma,
  userEmailFinderService,
  createVerificationCodeService,
  mailer,
  getEmailVerificationTemplate,
  verificationCodeMapper,
);

export default sendVerificationCodeUsecase;
