import logoutUsecase, {
  LogoutUsecase,
} from "../../../../application/usecases/auth/LogoutUsecase/LogoutUsecase.js";
import makeRefreshTokenCookie from "../../../../infrastructure/auth/makeRefreshTokenCookie.js";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "../PasswordSignUpController/index.js";

export class LogoutController implements IController {
  constructor(
    private readonly _logoutUsecase: LogoutUsecase,
    private readonly _makeRefreshTokenCookie: typeof makeRefreshTokenCookie,
  ) {}

  handle = async (httpRequest: HttpRequest): Promise<ControllerResponse<null>> => {
    await this._logoutUsecase.execute({ authUser: httpRequest.authUser });

    return {
      code: 200,
      result: null,
      cookies: [this._makeRefreshTokenCookie("", "", 0)],
    };
  };
}

const logoutController = new LogoutController(logoutUsecase, makeRefreshTokenCookie);

export default logoutController;
