import { Router } from "express";
import expressControllerAdapter from "../adapters/ExpressControllerAdapter.js";
import expressMiddlewareAdapter from "../adapters/ExpressMiddlewareAdapter.js";
import resourceValidator from "../../middleware/ResourceValidator/ResourceValidator.js";
import { signUpRequestDtoSchema, verifyEmailRequestDtoSchema } from "@boardly/shared/dtos/auth";
import emailSignUpController from "../controllers/auth/EmailSignUpController/EmailSignUpController.js";
import rateLimiter from "../../middleware/RateLimiter/RateLimiter.js";
import { sendVerificationCodeRequestDto } from "@boardly/shared/dtos/verificationCode";
import sendverificationCodeController from "../controllers/verificationCode/SendVerificationCodeController/SendVerificationCodeController.js";
import verifiyEmailController from "../controllers/auth/VerifyEmailController/VerifiyEmailController.js";

const authRouter = Router();

authRouter.post(
  "/password-sign-up",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 10 })),
  expressMiddlewareAdapter.adapt(resourceValidator.setup({ schema: signUpRequestDtoSchema })),
  expressControllerAdapter.adapt(emailSignUpController),
);

authRouter.post(
  "/send-verification-code",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 10 })),
  expressMiddlewareAdapter.adapt(
    resourceValidator.setup({ schema: sendVerificationCodeRequestDto }),
  ),
  expressControllerAdapter.adapt(sendverificationCodeController),
);

authRouter.post(
  "/verify-email",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 10 })),
  expressMiddlewareAdapter.adapt(resourceValidator.setup({ schema: verifyEmailRequestDtoSchema })),
  expressControllerAdapter.adapt(verifiyEmailController),
);

export default authRouter;
