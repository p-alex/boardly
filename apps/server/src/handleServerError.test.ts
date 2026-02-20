import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import { mockRes } from "./__fixtures__/response/mockRes";
import handleServerError from "./handleServerError";
import ValidationException from "./exceptions/ValidationException";
import AlreadyExistsException from "./exceptions/AlreadyExistsException";
import TooManyRequestsException from "./exceptions/TooManyRequestsException";

describe("handleServerError.ts (unit)", () => {
  it("should respond correct status code and message for unknown errors", () => {
    handleServerError(new Error("error"), mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal server error",
      status: 500,
    } as ServerErrorResponseDto);
  });

  it("should respond with the correct status code and message for ValidationException", () => {
    handleServerError(new ValidationException("validation exception"), mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "validation exception",
      status: 400,
    } as ServerErrorResponseDto);
  });

  it("should respond with the correct status code and message for AlreadyExistsException", () => {
    handleServerError(new AlreadyExistsException("already exists exception"), mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "already exists exception",
      status: 409,
    } as ServerErrorResponseDto);
  });

  it("should respond with the correct status code and message for TooManyRequestsException", () => {
    const headers = {
      header1: "header1",
      header2: "header2",
      header3: "header3",
    };

    handleServerError(new TooManyRequestsException("already exists exception", headers), mockRes);

    const headerKeys = Object.keys(headers);

    for (let i = 0; i < headerKeys.length; i++) {
      expect(mockRes.setHeader).toHaveBeenCalledWith("header" + (i + 1), "header" + (i + 1));
    }

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "already exists exception",
      status: 409,
    } as ServerErrorResponseDto);
  });
});
