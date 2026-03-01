import { regex, string, enum as _enum } from "zod/v4-mini";

export const verificationCodeSchema = string().check(
  regex(/^[0-9]{6}$/g, { error: "Code must contain only numbers and be 6 characters long" }),
);

export const verificationCodeTypeSchema = _enum(["EMAIL_VERIFICATION"]);

export type VerificationCodeType = typeof verificationCodeTypeSchema._zod.output;
