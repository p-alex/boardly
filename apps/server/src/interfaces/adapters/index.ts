import { Request } from "express";
import { extractAccessTokenFromRequest } from "../../utils/extractAccessTokenFromRequest.js";

export type HttpRequest<TBody = any, TParams = any, TQuery = any> = {
  body: TBody;
  params: TParams;
  query: TQuery;
  client_ip: string;
  method: string;
  url: string;
  cookies: Record<string, string>;
  accessToken: string | null;
  auth_user_id: string | null;
};

export function getHttpRequest(req: Request): HttpRequest {
  return {
    body: req.body,
    params: req.params,
    query: req.query,
    client_ip: req.ip || req.socket.remoteAddress || "",
    method: req.method,
    url: req.url,
    cookies: req.cookies,
    accessToken: extractAccessTokenFromRequest(req),
    auth_user_id: null,
  };
}
