import { boolean, object } from "zod/v4-mini";

import { emailSchema } from "../../fieldValidation/user.js";

import {
  verificationCodeSchema,
  verificationCodeTypeSchema,
} from "../../fieldValidation/verificationCode.js";

export const verifyEmailRequestDtoSchema = object({
  body: object({
    email: emailSchema,
    code: verificationCodeSchema,
    code_type: verificationCodeTypeSchema,
  }),
});

export const verifyEmailResponseDtoSchema = object({
  success: boolean(),
});

export type VerifyEmailRequestDto = typeof verifyEmailRequestDtoSchema._zod.output;

export type VerifyEmailResponseDto = typeof verifyEmailResponseDtoSchema._zod.output;
