import { env } from "../../config.js";
import { SESSION_EXPIRES_AT } from "../../domain/factories/AuthSessionFactory.js";
import { CookieConfigType } from "../../interfaces/controllers/auth/PasswordSignUpController/index.js";

function makeRefreshTokenCookie(
  token: string,
  maxAgeMS: number = SESSION_EXPIRES_AT,
): CookieConfigType {
  return {
    name: "refresh_token",
    value: token,
    maxAgeMS,
    sameSite: "strict",
    isSecure: env.NODE_ENV === "development" ? false : true,
    isHttpOnly: true,
    path: "/",
    domain: env.SERVER_DOMAIN_NAME,
  };
}

export default makeRefreshTokenCookie;
