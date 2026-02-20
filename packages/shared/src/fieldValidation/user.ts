import { email, maxLength, minLength, refine, regex, string } from "zod/v4-mini";
import { isCommonlyUsedPassword } from "../utils/isCommonlyUsedPassword.js";

export const usernameSchema = string().check(
  minLength(3, { error: "Username must be at least 3 characters long" }),
  maxLength(16, { error: "Username must be at most 16 characters long" }),
  regex(/^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, {
    error:
      "Username must start with a letter, contain only letters, numbers, '-' or '_', and must not end with '-' or '_'",
  }),
);

export const emailSchema = email({ error: "Email must be valid" }).check(
  maxLength(254, "Email must be at most 254 characters long"),
  minLength(6, "Email must be at least 6 characters long"),
);

export const passwordSchema = string().check(
  minLength(12, "Password must be between 12-64 characters long"),
  maxLength(64, "Password must be between 12-64 characters long"),
  refine((password) => !isCommonlyUsedPassword(password), {
    error: "Password is too common. Please try a different one.",
  }),
);
