import { object } from "zod/v4-mini";
import { userFieldValidations } from "@boardly/shared/fieldValidations";

export const sendEmailVerificationCodeFormSchema = object({
  email: userFieldValidations.emailSchema,
});

export type SendEmailVerificationCodeFormSchema =
  typeof sendEmailVerificationCodeFormSchema._zod.output;
