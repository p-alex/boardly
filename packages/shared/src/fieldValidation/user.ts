import { email, maxLength, minLength, regex, string } from "zod/v4-mini";

export const usernameSchema = string().check(
  minLength(3, { error: "Username must be at least 3 characters long" }),
  maxLength(16, { error: "Username must be at most 16 characters long" }),
  regex(/^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, {
    error:
      "Username must start with a letter, contain only letters, numbers, '-' or '_', and must not end with '-' or '_'",
  }),
);

export const emailSchema = email({ error: "Email must be a valid" }).check(
  maxLength(254, "Email must be at most 254 characters long"),
  minLength(6, "Email must be at least 6 characters long"),
);

export const passwordSchema = string().check(
  minLength(8, "Password must be at least 8 characters long"),
  maxLength(128, "Password must be at most 128 characters long"),
  regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!?@#$%]).+$/, {
    error:
      "Password must contain at least one uppercase and lowercase letter, a number and a symbol (!?@#$%)",
  }),
);
