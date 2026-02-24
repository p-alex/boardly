import { HttpRequest } from "../../../adapters/index.js";

export type ControllerResponse<TResult> = {
  result: TResult;
  code: number;
};

export interface IController {
  handle: (httpRequest: HttpRequest) => Promise<ControllerResponse<unknown>>;
}
