import emailVerificationTemplate from "./emailVerificationTemplate.js";

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export { emailVerificationTemplate };
