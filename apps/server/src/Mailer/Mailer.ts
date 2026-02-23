import { EmailTemplate } from "./emailTemplates/index.js";
import { MailApi } from "./MailApis/index.js";
import nodemailer from "nodemailer";

class Mailer {
  constructor(
    private readonly _mailApi: MailApi,
    private readonly _from: string,
  ) {}

  send = async (emailTemplate: EmailTemplate, to: string) => {
    const transporter = nodemailer.createTransport(this._mailApi);

    transporter.sendMail({
      ...emailTemplate,
      from: this._from,
      to,
    });
  };
}

export default Mailer;
