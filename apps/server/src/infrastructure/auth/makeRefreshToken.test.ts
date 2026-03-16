import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import makeRefreshToken from "./makeRefreshToken";

describe("makeRefreshToken", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a token using crypto.randomBytes", () => {
    const mockBuffer = Buffer.from("a".repeat(64));
    vi.spyOn(crypto, "randomBytes")
      // @ts-ignore
      .mockReturnValue(mockBuffer);

    const result = makeRefreshToken();

    expect(result).toBe(mockBuffer.toString("hex"));
  });
});
