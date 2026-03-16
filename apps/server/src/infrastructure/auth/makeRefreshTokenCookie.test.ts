import { describe, it, expect, vi } from "vitest";

vi.mock("../../config.js", () => ({
  env: {
    NODE_ENV: "production",
    SERVER_DOMAIN_NAME: "example.com",
  },
}));

vi.mock("../../domain/factories/AuthSessionFactory.js", () => ({
  SESSION_EXPIRES_AT: 1000,
}));

import makeRefreshTokenCookie, { REFRESH_TOKEN_COOKIE_NAME } from "./makeRefreshTokenCookie.js";

describe("makeRefreshTokenCookie", () => {
  const refreshToken = "token456";
  const sessionId = "session123";

  it("creates a cookie with correct values", () => {
    const cookie = makeRefreshTokenCookie(sessionId, refreshToken);

    expect(cookie).toEqual({
      name: REFRESH_TOKEN_COOKIE_NAME,
      value: "session123.token456",
      maxAgeMS: 1000,
      sameSite: "strict",
      isSecure: true,
      isHttpOnly: true,
      path: "/",
      domain: "example.com",
    });
  });

  it("uses custom maxAgeMS when provided", () => {
    const cookie = makeRefreshTokenCookie(sessionId, refreshToken, 5000);

    expect(cookie.maxAgeMS).toBe(5000);
  });

  it("sets isSecure to false in development", async () => {
    vi.resetModules();

    vi.doMock("../../config.js", () => ({
      env: {
        NODE_ENV: "development",
        SERVER_DOMAIN_NAME: "example.com",
      },
    }));

    const { default: makeRefreshTokenCookieDev } = await import("./makeRefreshTokenCookie.js");

    const cookie = makeRefreshTokenCookieDev(sessionId, refreshToken);

    expect(cookie.isSecure).toBe(false);
  });
});
