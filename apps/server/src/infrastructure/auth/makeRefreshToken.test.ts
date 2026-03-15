import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import makeRefreshToken from "./makeRefreshToken";

describe("makeRefreshToken", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a new sessionId when none is provided", () => {
    const mockUUID = "session-123" as `${string}-${string}-${string}-${string}-${string}`;
    vi.spyOn(crypto, "randomUUID").mockReturnValue(mockUUID);

    const result = makeRefreshToken();

    expect(result.sessionId).toBe(mockUUID);
  });

  it("uses provided sessionId if given", () => {
    const sessionId = "existing-session";

    const result = makeRefreshToken(sessionId);

    expect(result.sessionId).toBe(sessionId);
  });

  it("generates a token using crypto.randomBytes", () => {
    const mockBuffer = Buffer.from("a".repeat(64));
    vi.spyOn(crypto, "randomBytes")
      // @ts-ignore
      .mockReturnValue(mockBuffer);

    const result = makeRefreshToken("session");

    expect(result.token).toBe(mockBuffer.toString("hex"));
  });

  it("returns refreshToken in the correct format", () => {
    const sessionId = "session123";
    const result = makeRefreshToken(sessionId);

    expect(result.refreshToken.startsWith(sessionId + ".")).toBe(true);
  });

  it("returns consistent refreshToken parts", () => {
    const result = makeRefreshToken();

    const [sessionId, token] = result.refreshToken.split(".");

    expect(sessionId).toBe(result.sessionId);
    expect(token).toBe(result.token);
  });
});
