import { Request } from "express";
import { extractAccessTokenFromRequest } from "../../utils/extractAccessTokenFromRequest.js";
import {
  AuthenticatedSession,
  extractAuthenticatedSessionFromRequest,
} from "../../utils/extractRefreshTokenFromRequest.js";
import { AuthSession, User } from "../../../generated/prisma_client/client.js";

export type AuthUser = { id: User["id"]; sessionId: AuthSession["id"] };

export interface CustomRequest extends Request {
  custom?: {
    authUser?: AuthUser;
  };
}

export type HttpRequest<TBody = any, TParams = any, TQuery = any> = {
  body: TBody;
  params: TParams;
  query: TQuery;
  client_ip: string;
  method: string;
  url: string;
  cookies: Record<string, string>;
  accessToken: string | null;
  authenticatedSession: AuthenticatedSession | null;
  authUser: AuthUser | null;
};

export function getHttpRequest(req: CustomRequest): HttpRequest {
  return {
    body: req.body,
    params: req.params,
    query: req.query,
    client_ip: req.ip || req.socket.remoteAddress || "",
    method: req.method,
    url: req.url,
    cookies: req.cookies,
    accessToken: extractAccessTokenFromRequest(req),
    authenticatedSession: extractAuthenticatedSessionFromRequest(req),
    authUser: req?.custom?.authUser ?? null,
  };
}
