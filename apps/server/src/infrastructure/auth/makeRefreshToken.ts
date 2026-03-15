import crypto from "node:crypto";

function makeRefreshToken(providedSessionId?: string) {
  const sessionId = providedSessionId ?? crypto.randomUUID();
  const token = crypto.randomBytes(64).toString("hex");
  return { refreshToken: `${sessionId}.${token}`, sessionId, token };
}

export default makeRefreshToken;
