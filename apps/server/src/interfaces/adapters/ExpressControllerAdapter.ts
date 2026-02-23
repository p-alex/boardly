import { Request, Response } from "express";
import { IController } from "../controllers/EmailSignUpController/index.js";
import handleServerError from "../../handleServerError.js";
import { getHttpRequest } from "./index.js";

export class ExpressControllerAdapter {
  adapt = (controller: IController) => {
    return async (req: Request, res: Response) => {
      try {
        const { result, code } = await controller.handle(getHttpRequest(req));

        res.status(code);
        res.json(result);
      } catch (error) {
        console.error(error);
        return handleServerError(error, res);
      }
    };
  };
}

const expressControllerAdapter = new ExpressControllerAdapter();

export default expressControllerAdapter;
