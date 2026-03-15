import { Router } from "express";
import expressControllerAdapter from "../adapters/ExpressControllerAdapter.js";
import expressMiddlewareAdapter from "../adapters/ExpressMiddlewareAdapter.js";
import resourceValidator from "../../middleware/ResourceValidator/ResourceValidator.js";
import {
  passwordSignInDtoRequestSchema,
  signUpRequestDtoSchema,
  verifyEmailRequestDtoSchema,
} from "@boardly/shared/dtos/auth";
import emailSignUpController from "../controllers/auth/PasswordSignUpController/PasswordSignUpController.js";
import rateLimiter from "../../middleware/RateLimiter/RateLimiter.js";
import { sendVerificationCodeRequestDto } from "@boardly/shared/dtos/verificationCode";
import sendverificationCodeController from "../controllers/verificationCode/SendVerificationCodeController/SendVerificationCodeController.js";
import verifiyEmailController from "../controllers/auth/VerifyEmailController/VerifiyEmailController.js";
import passwordSignInController from "../controllers/auth/PasswordSignInController/PasswordSignInController.js";
import refreshSessionController from "../controllers/auth/RefreshSessionController/RefreshSessionController.js";

const authRouter = Router();

authRouter.post(
  "/password-sign-up",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 15 })),
  expressMiddlewareAdapter.adapt(resourceValidator.setup({ schema: signUpRequestDtoSchema })),
  expressControllerAdapter.adapt(emailSignUpController),
);

authRouter.post(
  "/send-verification-code",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 30 })),
  expressMiddlewareAdapter.adapt(
    resourceValidator.setup({ schema: sendVerificationCodeRequestDto }),
  ),
  expressControllerAdapter.adapt(sendverificationCodeController),
);

authRouter.post(
  "/verify-email",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 30 })),
  expressMiddlewareAdapter.adapt(resourceValidator.setup({ schema: verifyEmailRequestDtoSchema })),
  expressControllerAdapter.adapt(verifiyEmailController),
);

authRouter.post(
  "/password-sign-in",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 * 60 * 30 })),
  expressMiddlewareAdapter.adapt(
    resourceValidator.setup({ schema: passwordSignInDtoRequestSchema }),
  ),
  expressControllerAdapter.adapt(passwordSignInController),
);

authRouter.get(
  "/refresh-session",
  expressMiddlewareAdapter.adapt(rateLimiter.setup({ maxRequests: 5, windowMs: 1000 })),
  expressControllerAdapter.adapt(refreshSessionController),
);

export default authRouter;
