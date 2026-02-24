import { length, regex, string } from "zod/v4-mini";

export const emailVerificationCodeSchema = string().check(
  regex(/[0-9]{6}/g, { error: "Code must contain only numbers and be 6 characters long" }),
);
