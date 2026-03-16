import { RefreshSessionResponseDto } from "@boardly/shared/dtos/auth";
import refreshSessionUsecase, {
  RefreshSessionUsecase,
} from "../../../../application/usecases/auth/RefreshSessionUsecase/RefreshSessionUsecase.js";
import makeRefreshTokenCookie from "../../../../infrastructure/auth/makeRefreshTokenCookie.js";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "../PasswordSignUpController/index.js";

class RefreshSessionController implements IController {
  constructor(private readonly _refreshSessionUsecase: RefreshSessionUsecase) {}

  handle = async (
    httpRequest: HttpRequest,
  ): Promise<ControllerResponse<RefreshSessionResponseDto>> => {
    const { sessionId, refreshToken, refreshTokenExpiryMs, accessToken, userId, username } =
      await this._refreshSessionUsecase.execute({
        authenticatedSession: httpRequest.authenticatedSession,
      });

    return {
      code: 200,
      result: {
        accessToken: accessToken,
        user: { id: userId, username },
      },
      cookies: [makeRefreshTokenCookie(sessionId, refreshToken, refreshTokenExpiryMs)],
    };
  };
}

const refreshSessionController = new RefreshSessionController(refreshSessionUsecase);

export default refreshSessionController;
