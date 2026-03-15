import jwt from "jsonwebtoken";
import { env } from "../../config.js";
import { User } from "../../../generated/prisma_client/client.js";

export type AccessTokenPayload = { id: User["id"] };

function makeAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRETS["ACCESS_TOKEN"], {
    algorithm: "HS256",
    expiresIn: "15m",
    issuer: "boardly-api",
    audience: "boardly-client",
  });
}

export default makeAccessToken;
