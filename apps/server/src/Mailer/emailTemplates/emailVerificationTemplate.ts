import { EmailTemplate } from "./index.js";

const getEmailVerificationTemplate = (code: string): EmailTemplate => {
  return {
    subject: "Email verification",
    text: "Verification code: " + code,
    html: "Verification code: " + code,
  };
};

export type GetEmailVerificationTemplate = typeof getEmailVerificationTemplate;

export default getEmailVerificationTemplate;
