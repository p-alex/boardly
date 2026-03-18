import { object, string, optional } from "zod/v4-mini";
import { emailSchema } from "../../fieldValidation/user.js";
import { simplePasswordSchema } from "../../fieldValidation/userPasswordAuth.js";

export const passwordSignInDtoRequestSchema = object({
  body: object({
    email: emailSchema,
    password: simplePasswordSchema,
  }),
});

export const passwordSignInDtoResponseSchema = object({
  redirectTo: optional(string()),
});

export type PasswordSignInDtoRequestSchema = typeof passwordSignInDtoRequestSchema._zod.output;

export type PasswordSignInDtoResponseSchema = typeof passwordSignInDtoResponseSchema._zod.output;
