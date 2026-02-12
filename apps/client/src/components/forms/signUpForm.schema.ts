import { refine, string, object } from "zod/v4-mini";
import { userFieldValidations } from "@boardly/shared/fieldValidations";

const signUpFormSchema = object({
  username: userFieldValidations.usernameSchema,
  email: userFieldValidations.emailSchema,
  password: userFieldValidations.passwordSchema,
  confirmPassword: string(),
}).check(
  refine((data) => data.password === data.confirmPassword, {
    error: "Passwords must match",
    path: ["confirmPassword"],
  }),
);

export type SignUpFormSchema = typeof signUpFormSchema._zod.output;

export default signUpFormSchema;
