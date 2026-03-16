import { env } from "../../config.js";
import { SESSION_EXPIRES_AT } from "../../domain/factories/AuthSessionFactory.js";
import { CookieConfigType } from "../../interfaces/controllers/auth/PasswordSignUpController/index.js";

export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

function makeRefreshTokenCookie(
  sessionId: string,
  refreshToken: string,
  maxAgeMS: number = SESSION_EXPIRES_AT,
): CookieConfigType {
  return {
    name: REFRESH_TOKEN_COOKIE_NAME,
    value: `${sessionId}.${refreshToken}`,
    maxAgeMS,
    sameSite: "strict",
    isSecure: env.NODE_ENV === "development" ? false : true,
    isHttpOnly: true,
    path: "/",
    domain: env.SERVER_DOMAIN_NAME,
  };
}

export default makeRefreshTokenCookie;
