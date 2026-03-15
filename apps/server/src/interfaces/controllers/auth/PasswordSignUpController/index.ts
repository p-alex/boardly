import { HttpRequest } from "../../../adapters/index.js";

export type CookieConfigType = {
  name: string;
  value: string;
  maxAgeMS: number;
  path: string;
  domain: string;
  isSecure: boolean;
  isHttpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
};

export type ControllerResponse<TResult> = {
  result: TResult;
  code: number;
  cookies?: CookieConfigType[];
};

export interface IController {
  handle: (httpRequest: HttpRequest) => Promise<ControllerResponse<unknown>>;
}
