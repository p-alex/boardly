import { object } from "zod/v4-mini";
import { emailSchema, usernameSchema } from "../../fieldValidation/user.js";
import { passwordSchema } from "../../fieldValidation/userPasswordAuth.js";

const signUpRequestDtoSchema = object({
  body: object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
});

const signUpResponseDtoSchema = null;

type SignUpRequestDtoSchema = typeof signUpRequestDtoSchema._zod.output;

type SignUpResponseDtoSchema = typeof signUpResponseDtoSchema;

export {
  signUpRequestDtoSchema,
  signUpResponseDtoSchema,
  SignUpRequestDtoSchema,
  SignUpResponseDtoSchema,
};
