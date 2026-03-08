import {
  verificationCodeFieldValidations,
  userFieldValidations,
} from "@boardly/shared/fieldValidations";
import { object } from "zod/v4-mini";

export const verifyEmailFormSchema = object({
  email: userFieldValidations.emailSchema,
  code: verificationCodeFieldValidations.verificationCodeSchema,
  code_type: verificationCodeFieldValidations.verificationCodeTypeSchema,
});

export type VerifyEmailFormSchema = typeof verifyEmailFormSchema._zod.output;
