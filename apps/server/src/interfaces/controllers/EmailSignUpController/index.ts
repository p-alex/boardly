import { HttpRequest } from "../../adapters/index.js";

export type ControllerResponse<TResult> = {
  result: TResult;
  code: number;
  redirect_to?: string;
};

export interface IController {
  handle: (httpRequest: HttpRequest) => Promise<ControllerResponse<unknown>>;
}
