import { object } from "zod/v4-mini";
import { emailSchema } from "../../fieldValidation/user.js";
import { verificationCodeTypeSchema } from "../../fieldValidation/verificationCode.js";

export const sendVerificationCodeRequestDto = object({
  body: object({
    email: emailSchema,
    code_type: verificationCodeTypeSchema,
  }),
});

export const sendVerificationCodeResponseDto = null;

export type SendVerificationCodeRequestDto = typeof sendVerificationCodeRequestDto._zod.output;

export type SendVerificationCodeResponseDto = typeof sendVerificationCodeResponseDto;
