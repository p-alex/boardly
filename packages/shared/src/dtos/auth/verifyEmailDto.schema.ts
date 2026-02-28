import { boolean, object } from "zod/v4-mini";

import { emailSchema } from "../../fieldValidation/user.js";

import { emailVerificationCodeSchema } from "../../fieldValidation/emailVerificationCode.js";

export const verifyEmailRequestDtoSchema = object({
  body: object({
    email: emailSchema,
    code: emailVerificationCodeSchema,
  }),
});

export const verifyEmailResponseDtoSchema = object({
  success: boolean(),
});

export type VerifyEmailRequestDto = typeof verifyEmailRequestDtoSchema._zod.output;

export type VerifyEmailResponseDto = typeof verifyEmailResponseDtoSchema._zod.output;
