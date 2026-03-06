import emailVerificationTemplate from "./getVerificationCodeEmailTemplate.js";

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export { emailVerificationTemplate };
