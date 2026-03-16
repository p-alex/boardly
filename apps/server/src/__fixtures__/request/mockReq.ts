import type { Request } from "express";
import { CustomRequest } from "../../interfaces/adapters/index.js";

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
  headers: {} as Request["headers"],
  custom: { authUser: { id: "id", sessionId: "sessionId" } },
} as unknown as CustomRequest;
