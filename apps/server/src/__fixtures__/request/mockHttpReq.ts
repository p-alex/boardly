import { HttpRequest } from "../../interfaces/adapters/index.js";

export const mockHttpRequest: HttpRequest = {
  body: {},
  client_ip: "client_ip",
  method: "post",
  params: {},
  query: {},
  url: "/url",
  cookies: {},
  accessToken: "Bearer accessToken",
  authenticatedSession: { sessionId: "sessionId", refreshToken: "refreshToken" },
  auth_user_id: "auth_user_id",
};
