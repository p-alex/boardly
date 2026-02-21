import { Response } from "express";
import ValidationException from "./exceptions/ValidationException.js";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import AlreadyExistsException from "./exceptions/AlreadyExistsException.js";
import TooManyRequestsException from "./exceptions/TooManyRequestsException.js";

function handleServerError(error: any, res: Response) {
  let errorResponse: ServerErrorResponseDto = {
    status: 500,
    message: "Internal server error. Try again later.",
  };

  if (error instanceof ValidationException) {
    errorResponse.status = 400;
    errorResponse.message = error.message;
    res.status(errorResponse.status);
    return res.json(errorResponse);
  }

  if (error instanceof AlreadyExistsException) {
    errorResponse.status = 409;
    errorResponse.message = error.message;
    res.status(errorResponse.status);
    return res.json(errorResponse);
  }

  if (error instanceof TooManyRequestsException) {
    errorResponse.status = 429;
    errorResponse.message = error.message;

    const headers = Object.keys(error.headers);

    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      const value = error.headers[headers[i]];
      res.setHeader(key, value);
    }

    res.status(errorResponse.status);
    return res.json(errorResponse);
  }

  res.status(errorResponse.status);
  res.json(errorResponse);
}

export default handleServerError;
