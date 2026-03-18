import { object } from "zod/v4-mini";
import { userFieldValidations, userPasswordAuth } from "@boardly/shared/fieldValidations";

export const signInFormSchema = object({
  email: userFieldValidations.emailSchema,
  password: userPasswordAuth.simplePasswordSchema,
});

export type SignInFormSchema = typeof signInFormSchema._zod.output;
