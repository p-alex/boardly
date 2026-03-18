import { maxLength, minLength, refine, string } from "zod/v4-mini";
import { isCommonlyUsedPassword } from "../utils/isCommonlyUsedPassword.js";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 64;

export const passwordSchema = string().check(
  minLength(
    PASSWORD_MIN_LENGTH,
    `Password must be between ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters long`,
  ),
  maxLength(
    PASSWORD_MAX_LENGTH,
    `Password must be between ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters long`,
  ),
  refine((password) => !isCommonlyUsedPassword(password), {
    error: "Password is too common. Please try a different one.",
  }),
);

export const simplePasswordSchema = string().check(minLength(1, "Can't be blank"));
