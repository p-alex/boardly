import {
  emailVerificationCodeFieldValidations,
  userFieldValidations,
} from "@boardly/shared/fieldValidations";
import { object } from "zod/v4-mini";

export const verifyEmailFormSchema = object({
  email: userFieldValidations.emailSchema,
  code: emailVerificationCodeFieldValidations.emailVerificationCodeSchema,
});

export type VerifyEmailFormSchema = typeof verifyEmailFormSchema._zod.output;
