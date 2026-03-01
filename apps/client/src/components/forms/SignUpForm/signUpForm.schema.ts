import { string, object, superRefine } from "zod/v4-mini";
import { userFieldValidations } from "@boardly/shared/fieldValidations";

const signUpFormSchema = object({
  username: userFieldValidations.usernameSchema,
  email: userFieldValidations.emailSchema,
  password: userFieldValidations.passwordSchema,
  confirmPassword: string(),
}).check(
  superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords must match",
        path: ["confirmPassword"],
      });
    }
  }),
);

export type SignUpFormSchema = typeof signUpFormSchema._zod.output;

export default signUpFormSchema;
