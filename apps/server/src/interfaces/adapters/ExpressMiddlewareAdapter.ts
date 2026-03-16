import { NextFunction, Response } from "express";
import { IMiddleware } from "../../middleware/index.js";
import handleServerError from "../../handleServerError.js";
import { CustomRequest, getHttpRequest } from "./index.js";

export class ExpressMiddlewareAdapter {
  adapt = (middleware: ReturnType<IMiddleware["setup"]>) => {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
      try {
        const { isOk, updatedHttpRequest } = await middleware(getHttpRequest(req));

        if (updatedHttpRequest) {
          req.custom = {
            authUser: updatedHttpRequest.authUser ?? undefined,
          };
        }

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
