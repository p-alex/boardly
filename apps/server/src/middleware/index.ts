import { HttpRequest } from "../interfaces/adapters/index.js";

export type MiddlewareResponse = { isOk: boolean; updatedHttpRequest?: HttpRequest };

export interface IMiddleware {
  setup: (...args: any[]) => (httpRequest: HttpRequest) => Promise<MiddlewareResponse>;
}
