import { Request } from "express";

export type HttpRequest<TBody = any, TParams = any, TQuery = any> = {
  body: TBody;
  params: TParams;
  query: TQuery;
  client_ip: string;
  method: string;
  url: string;
};

export function getHttpRequest(req: Request): HttpRequest {
  return {
    body: req.body,
    params: req.params,
    query: req.query,
    client_ip: req.ip || req.socket.remoteAddress || "",
    method: req.method,
    url: req.url,
  };
}
