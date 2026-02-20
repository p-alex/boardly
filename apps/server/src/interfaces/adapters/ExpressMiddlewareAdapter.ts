import { NextFunction, Request, Response } from "express";
import { IMiddleware } from "../../middleware/index.js";
import handleServerError from "../../handleServerError.js";
import { getHttpRequest } from "./index.js";

export class ExpressMiddlewareAdapter {
  adapt = (middleware: ReturnType<IMiddleware["setup"]>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { isOk } = await middleware(getHttpRequest(req));

        if (isOk) next();
      } catch (error) {
        console.error(error);
        return handleServerError(error, res);
      }
    };
  };
}

const expressMiddlewareAdapter = new ExpressMiddlewareAdapter();

export default expressMiddlewareAdapter;
