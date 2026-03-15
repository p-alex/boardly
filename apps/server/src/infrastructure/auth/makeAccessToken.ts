import jwt from "jsonwebtoken";
import { env } from "../../config.js";
import { User } from "../../../generated/prisma_client/client.js";

export type JwtTokenData = { iat: number; exp: number; aud: string; iss: string };

export type AccessTokenData = AccessTokenPayload & JwtTokenData;

export type AccessTokenPayload = {
  id: User["id"];
};

export const ACCESS_TOKEN_ALGORITHM = "HS256";
export const ACCESS_TOKEN_ISSUER = "boardly-api";
export const ACCESS_TOKEN_AUDIENCE = "boardly-client";

function makeAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRETS["ACCESS_TOKEN"], {
    algorithm: ACCESS_TOKEN_ALGORITHM,
    expiresIn: "15m",
    issuer: ACCESS_TOKEN_ISSUER,
    audience: ACCESS_TOKEN_AUDIENCE,
  });
}

export default makeAccessToken;
