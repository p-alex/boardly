import { describe, it, expect } from "vitest";
import { extractAccessTokenFromRequest } from "./extractAccessTokenFromRequest";
import type { Request } from "express";

describe("extractAccessTokenFromRequest", () => {
  it("returns null if the authorization header is missing", () => {
    const req = { headers: {} } as Request;
    const result = extractAccessTokenFromRequest(req);
    expect(result).toBeNull();
  });

  it("returns null if the authorization header is malformed (not two parts)", () => {
    const req = { headers: { authorization: "BearerOnly" } } as Request;
    const result = extractAccessTokenFromRequest(req);
    expect(result).toBeNull();
  });

  it("returns null if the authorization type is not Bearer", () => {
    const req = { headers: { authorization: "Basic abc.def.ghi" } } as Request;
    const result = extractAccessTokenFromRequest(req);
    expect(result).toBeNull();
  });

  it("returns null if the token is not a valid JWT format", () => {
    const req = { headers: { authorization: "Bearer invalid-token" } } as Request;
    const result = extractAccessTokenFromRequest(req);
    expect(result).toBeNull();
  });

  it("returns the access token if it is valid", () => {
    const validJwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const req = { headers: { authorization: `Bearer ${validJwt}` } } as Request;
    const result = extractAccessTokenFromRequest(req);
    expect(result).toBe(validJwt);
  });
});
