import UnauthorizedException from "../../exceptions/UnauthorizedException.js";
import {
  ACCESS_TOKEN_AUDIENCE,
  ACCESS_TOKEN_ISSUER,
  AccessTokenData,
  AccessTokenPayload,
} from "../../infrastructure/auth/makeAccessToken.js";
import { verifyJwt } from "../../infrastructure/auth/verifyJwt.js";
import { HttpRequest } from "../../interfaces/adapters/index.js";
import { IMiddleware, MiddlewareResponse } from "../index.js";

class AuthShield implements IMiddleware {
  setup = () => {
    return async (httpRequest: HttpRequest): Promise<MiddlewareResponse> => {
      const accessToken = httpRequest.accessToken;

      if (!accessToken) throw new UnauthorizedException("No access token provided");

      let tokenPayload: AccessTokenData | null = null;

      try {
        tokenPayload = verifyJwt<AccessTokenData>({
          token: accessToken,
          secret: "ACCESS_TOKEN",
        });
      } catch (error) {
        throw new UnauthorizedException("Invalid or expired access token");
      }

      if (!tokenPayload || tokenPayload.iss !== ACCESS_TOKEN_ISSUER)
        throw new UnauthorizedException("Invalid or expired access token");

      if (!tokenPayload || tokenPayload.aud !== ACCESS_TOKEN_AUDIENCE)
        throw new UnauthorizedException("Invalid or expired access token");

      httpRequest.auth_user_id = tokenPayload.id;

      return { isOk: true };
    };
  };
}

export const authShield = new AuthShield();

export default AuthShield;
