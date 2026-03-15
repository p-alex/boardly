import makeRefreshToken from "../infrastructure/auth/makeRefreshToken.js";

export const refreshTokenFixture: ReturnType<typeof makeRefreshToken> = {
  refreshToken: "sessionId.token",
  sessionId: "sessionId",
  token: "token",
};
