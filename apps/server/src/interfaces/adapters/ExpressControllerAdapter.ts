import { Request, Response } from "express";
import {
  CookieConfigType,
  IController,
} from "../controllers/auth/PasswordSignUpController/index.js";
import handleServerError from "../../handleServerError.js";
import { getHttpRequest } from "./index.js";

export class ExpressControllerAdapter {
  adapt = (controller: IController) => {
    return async (req: Request, res: Response) => {
      try {
        const { result, code, cookies } = await controller.handle(getHttpRequest(req));

        if (cookies) this._applyCookies(res, cookies);

        res.status(code);
        res.json(result);
      } catch (error) {
        console.error(error);
        return handleServerError(error, res);
      }
    };
  };

  private _applyCookies = (res: Response, cookies: CookieConfigType[]) => {
    cookies.forEach((cookie) =>
      res.cookie(cookie.name, cookie.value, {
        domain: cookie.domain,
        maxAge: cookie.maxAgeMS,
        httpOnly: cookie.isHttpOnly,
        path: cookie.path,
        secure: cookie.isSecure,
        sameSite: cookie.sameSite,
      }),
    );
  };
}

const expressControllerAdapter = new ExpressControllerAdapter();

export default expressControllerAdapter;
