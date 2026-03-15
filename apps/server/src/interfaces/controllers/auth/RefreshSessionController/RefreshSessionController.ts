import { RefreshSessionResponseDto } from "@boardly/shared/dtos/auth";
import refreshSessionUsecase, {
  RefreshSessionUsecase,
} from "../../../../application/usecases/auth/RefreshSessionUsecase/RefreshSessionUsecase.js";
import ForbiddenException from "../../../../exceptions/ForbiddenException.js";
import makeRefreshTokenCookie from "../../../../infrastructure/auth/makeRefreshTokenCookie.js";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "../PasswordSignUpController/index.js";

class RefreshSessionController implements IController {
  constructor(private readonly _refreshSessionUsecase: RefreshSessionUsecase) {}

  handle = async (
    httpRequest: HttpRequest,
  ): Promise<ControllerResponse<RefreshSessionResponseDto>> => {
    const refreshToken = httpRequest.cookies?.refresh_token;

    if (!refreshToken) throw new ForbiddenException("Invalid or expired token");

    const result = await this._refreshSessionUsecase.execute({ refreshToken });

    return {
      code: 200,
      result: {
        accessToken: result.accessToken,
        user: { id: result.user.id, username: result.user.username },
      },
      cookies: [makeRefreshTokenCookie(result.refreshToken, result.refreshTokenExpiryMs)],
    };
  };
}

const refreshSessionController = new RefreshSessionController(refreshSessionUsecase);

export default refreshSessionController;
