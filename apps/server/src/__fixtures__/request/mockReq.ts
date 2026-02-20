import type { Request } from "express";

export const mockReq = {
  url: "/url",
  method: "post",
  ip: "ip",
  socket: {
    remoteAddress: "remoteAddress",
  } as any,
  body: {},
  params: {},
  query: {},
} as unknown as Request;
