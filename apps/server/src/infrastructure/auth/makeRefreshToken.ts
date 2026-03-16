import crypto from "node:crypto";

function makeRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export default makeRefreshToken;
