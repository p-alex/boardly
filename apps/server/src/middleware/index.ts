import { HttpRequest } from "../interfaces/adapters/index.js";

export type MiddlewareResponse = { isOk: boolean };

export interface IMiddleware {
  setup: (...args: any[]) => (httpRequest: HttpRequest) => Promise<MiddlewareResponse>;
}
