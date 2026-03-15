import { Request } from "express";

export function extractAccessTokenFromRequest(req: Request) {
  if (!req.headers.authorization) return null;

  const parts = req.headers.authorization.trim().split(/\s+/);

  if (parts.length !== 2) return null;

  const [authorizationType, accessToken] = parts;

  if (authorizationType.toLowerCase() !== "bearer") return null;

  const isValidJwt = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(accessToken);

  if (!isValidJwt) return null;

  return accessToken;
}
