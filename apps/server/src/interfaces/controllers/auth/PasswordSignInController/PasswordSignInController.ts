import {
  PasswordSignInDtoRequestSchema,
  PasswordSignInDtoResponseSchema,
} from "@boardly/shared/dtos/auth";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "../PasswordSignUpController/index.js";
import passwordSignInUsecase, {
  PasswordSignInUsecase,
} from "../../../../application/usecases/auth/PasswordSignInUsecase/PasswordSignInUsecase.js";
import makeRefreshTokenCookie from "../../../../infrastructure/auth/makeRefreshTokenCookie.js";

export class PasswordSignInController implements IController {
  constructor(
    private readonly _passwordSignInUsecase: PasswordSignInUsecase,
    private readonly _makeRefreshTokenCookie: typeof makeRefreshTokenCookie,
  ) {}

  handle = async (
    httpRequest: HttpRequest<PasswordSignInDtoRequestSchema["body"]>,
  ): Promise<ControllerResponse<PasswordSignInDtoResponseSchema>> => {
    const { email, password } = httpRequest.body;

    const { refreshToken, sessionId, shouldVerifyEmail } =
      await this._passwordSignInUsecase.execute({
        email,
        password,
      });

    return {
      code: 200,
      result: { redirectTo: shouldVerifyEmail ? "/verify-email" : undefined },
      cookies: [this._makeRefreshTokenCookie(sessionId, refreshToken)],
    };
  };
}

const passwordSignInController = new PasswordSignInController(
  passwordSignInUsecase,
  makeRefreshTokenCookie,
);

export default passwordSignInController;
