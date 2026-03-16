import { Request } from "express";
import { REFRESH_TOKEN_COOKIE_NAME } from "../infrastructure/auth/makeRefreshTokenCookie.js";

export type AuthenticatedSession = {
  refreshToken: string;
  sessionId: string;
};

export function extractAuthenticatedSessionFromRequest(req: Request): AuthenticatedSession | null {
  const refreshTokenCookie = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshTokenCookie) return null;

  const parts = refreshTokenCookie.trim().split(".");

  if (parts.length !== 2) return null;

  const [sessionId, refreshToken] = parts;

  return { refreshToken, sessionId };
}
