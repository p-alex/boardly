import { VerificationCode } from "../../../../generated/prisma_client/client.js";
import getVerificationCodeEmailTemplate from "../../../Mailer/emailTemplates/getVerificationCodeEmailTemplate.js";
import { mailer } from "../../../Mailer/index.js";
import Mailer from "../../../Mailer/Mailer.js";

export class SendVerificationCodeEmailService {
  constructor(
    private readonly _mailer: Mailer,
    private readonly _getVerificationCodeEmailTemplate: typeof getVerificationCodeEmailTemplate,
  ) {}

  execute = async (data: {
    rawCode: string;
    code_type: VerificationCode["type"];
    toEmail: string;
  }) => {
    await this._mailer.send(
      this._getVerificationCodeEmailTemplate(data.rawCode, data.code_type),
      data.toEmail,
    );
    return true;
  };
}

const sendVerificationCodeEmailService = new SendVerificationCodeEmailService(
  mailer,
  getVerificationCodeEmailTemplate,
);

export default sendVerificationCodeEmailService;
