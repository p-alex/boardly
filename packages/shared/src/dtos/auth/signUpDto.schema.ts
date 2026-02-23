import { object } from "zod/v4-mini";
import { emailSchema, passwordSchema, usernameSchema } from "../../fieldValidation/user.js";
import { string } from "zod";

const signUpRequestDtoSchema = object({
  body: object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
});

const signUpResponseDtoSchema = object({
  redirect_to: string,
});

type SignUpRequestDtoSchema = typeof signUpRequestDtoSchema._zod.output;

type SignUpResponseDtoSchema = typeof signUpResponseDtoSchema._zod.output;

export {
  signUpRequestDtoSchema,
  signUpResponseDtoSchema,
  SignUpRequestDtoSchema,
  SignUpResponseDtoSchema,
};
