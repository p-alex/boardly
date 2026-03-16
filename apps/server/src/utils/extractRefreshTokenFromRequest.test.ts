import { describe, it, expect } from "vitest";
import { extractAuthenticatedSessionFromRequest } from "./extractRefreshTokenFromRequest";
import { REFRESH_TOKEN_COOKIE_NAME } from "../infrastructure/auth/makeRefreshTokenCookie.js";

describe("extractAuthenticatedSessionFromRequest", () => {
  it("returns null if cookie is missing", () => {
    const req: any = {
      cookies: {},
    };

    const result = extractAuthenticatedSessionFromRequest(req);

    expect(result).toBeNull();
  });

  it("returns null if cookies object is missing", () => {
    const req: any = {};

    const result = extractAuthenticatedSessionFromRequest(req);

    expect(result).toBeNull();
  });

  it("returns null if cookie format is invalid", () => {
    const req: any = {
      cookies: {
        [REFRESH_TOKEN_COOKIE_NAME]: "invalidtoken",
      },
    };

    const result = extractAuthenticatedSessionFromRequest(req);

    expect(result).toBeNull();
  });

  it("returns sessionId and refreshToken when cookie format is valid", () => {
    const req: any = {
      cookies: {
        [REFRESH_TOKEN_COOKIE_NAME]: "session123.token456",
      },
    };

    const result = extractAuthenticatedSessionFromRequest(req);

    expect(result).toEqual({
      sessionId: "session123",
      refreshToken: "token456",
    });
  });

  it("trims whitespace before splitting", () => {
    const req: any = {
      cookies: {
        [REFRESH_TOKEN_COOKIE_NAME]: "   sessionId.refreshToken   ",
      },
    };

    const result = extractAuthenticatedSessionFromRequest(req);

    expect(result).toEqual({
      sessionId: "sessionId",
      refreshToken: "refreshToken",
    });
  });
});
