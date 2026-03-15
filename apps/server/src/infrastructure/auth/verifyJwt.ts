import jwt from "jsonwebtoken";
import { env } from "../../config.js";

function verifyJwt<TPayload>(data: { token: string; secret: keyof typeof env.JWT_SECRETS }) {
  return jwt.verify(data.token, env.JWT_SECRETS[data.secret]) as TPayload;
}

export default verifyJwt;
