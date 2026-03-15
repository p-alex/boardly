import { object, string, minLength, maxLength, optional } from "zod/v4-mini";
import { emailSchema } from "../../fieldValidation/user.js";

export const passwordSignInDtoRequestSchema = object({
  body: object({
    email: emailSchema,
    password: string().check(minLength(12), maxLength(64)),
  }),
});

export const passwordSignInDtoResponseSchema = object({
  redirectTo: optional(string()),
});

export type PasswordSignInDtoRequestSchema = typeof passwordSignInDtoRequestSchema._zod.output;

export type PasswordSignInDtoResponseSchema = typeof passwordSignInDtoResponseSchema._zod.output;
