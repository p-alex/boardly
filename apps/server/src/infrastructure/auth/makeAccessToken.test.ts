import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import makeAccessToken from "./makeAccessToken";
import { env } from "../../config.js";

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe("makeAccessToken", () => {
  const payload = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls jwt.sign with the correct payload", () => {
    (jwt.sign as any).mockReturnValue("mock-token");

    makeAccessToken(payload);

    expect(jwt.sign).toHaveBeenCalledWith(
      payload,
      env.JWT_SECRETS["ACCESS_TOKEN"],
      expect.objectContaining({
        algorithm: "HS256",
        expiresIn: "15m",
        issuer: "boardly-api",
        audience: "boardly-client",
      }),
    );
  });

  it("returns the token returned by jwt.sign", () => {
    (jwt.sign as any).mockReturnValue("mock-token");

    const token = makeAccessToken(payload);

    expect(token).toBe("mock-token");
  });

  it("generates a token using the access token secret", () => {
    (jwt.sign as any).mockReturnValue("mock-token");

    makeAccessToken(payload);

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.any(Object),
      env.JWT_SECRETS["ACCESS_TOKEN"],
      expect.any(Object),
    );
  });
});
