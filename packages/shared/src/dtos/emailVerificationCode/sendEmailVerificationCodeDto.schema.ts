import { object } from "zod/v4-mini";
import { emailSchema } from "../../fieldValidation/user.js";

export const sendEmailVerificationCodeRequestDto = object({
  body: object({
    email: emailSchema,
  }),
});

export const sendEmailVerificationCodeResponseDto = null;

export type SendEmailVerificationCodeRequestDto =
  typeof sendEmailVerificationCodeRequestDto._zod.output;

export type SendEmailVerificationCodeResponseDto = typeof sendEmailVerificationCodeResponseDto;
