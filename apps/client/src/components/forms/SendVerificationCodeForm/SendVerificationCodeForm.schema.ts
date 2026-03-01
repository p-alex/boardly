import { object } from "zod/v4-mini";
import {
  userFieldValidations,
  verificationCodeFieldValidations,
} from "@boardly/shared/fieldValidations";

export const sendVerificationCodeFormSchema = object({
  email: userFieldValidations.emailSchema,
  code_type: verificationCodeFieldValidations.verificationCodeTypeSchema,
});

export type SendVerificationCodeFormSchema = typeof sendVerificationCodeFormSchema._zod.output;
