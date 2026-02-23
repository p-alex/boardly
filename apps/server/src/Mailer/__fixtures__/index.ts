import { EmailTemplate } from "../../Mailer/emailTemplates/index.js";
import { MailApi } from "../../Mailer/MailApis/index.js";

export const emailTemplateFixture: EmailTemplate = {
  html: "html",
  subject: "subject",
  text: "text",
};

export const MailApiFixture: MailApi = {
  auth: {
    pass: "pass",
    user: "user",
  },
  host: "host",
  port: 5000,
  secure: false,
};
