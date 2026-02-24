import { Router } from "express";
import expressControllerAdapter from "../adapters/ExpressControllerAdapter.js";
import expressMiddlewareAdapter from "../adapters/ExpressMiddlewareAdapter.js";
import resourceValidator from "../../middleware/ResourceValidator/ResourceValidator.js";
import { signUpRequestDtoSchema } from "@boardly/shared/dtos/auth";
import emailSignUpController from "../controllers/auth/EmailSignUpController/EmailSignUpController.js";
import rateLimiter from "../../middleware/RateLimiter/RateLimiter.js";
import { sendEmailVerificationCodeRequestDto } from "@boardly/shared/dtos/emailVerificationCode";
import sendEmailVerificationCodeController from "../controllers/emailVerificationCode/SendEmailVerificationCodeController/SendEmailVerificationCodeController.js";

const authRouter = Router();

authRouter.post(
  "/password-sign-up",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 10 })),
  expressMiddlewareAdapter.adapt(resourceValidator.setup({ schema: signUpRequestDtoSchema })),
  expressControllerAdapter.adapt(emailSignUpController),
);

authRouter.post(
  "/send-email-verification-code",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 10 })),
  expressMiddlewareAdapter.adapt(
    resourceValidator.setup({ schema: sendEmailVerificationCodeRequestDto }),
  ),
  expressControllerAdapter.adapt(sendEmailVerificationCodeController),
);

export default authRouter;
